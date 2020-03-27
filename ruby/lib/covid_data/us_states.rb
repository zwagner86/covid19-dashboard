require 'json'
require 'time'

require 'open-uri'
require 'linefit'

module USStates
  # Get the average latitude of a state - used for analysis of case doubling latitude-dependance
  def us_state_centroid(state)
    @us_state_centroids ||= begin
                              ret = {}
                              path = File.join(@dir, 'us_states', 'centroids.txt')
                              open(path).each_struct do |record|
                                ret[record[:state].to_sym] = [record[:lat].to_f, record[:lon].to_f]
                              end
                              ret
                            end
    @us_state_centroids[state.to_sym] || [-99, -1]
  end

  def us_states
    us_state_data.keys
  end

  def us_state_beds(state)
    s = @us_state_beds_struct ||= Struct.new(:hospitals, :beds, :icu_ccb, :occupancy)
    @us_state_beds ||= begin
                         ret = {all: s.new(*([0] * s.members.length))}
                         path = File.join(@dir, 'us_states', 'beds.txt')
                         open(path).each_struct do |record|
                           state = record[:abbreviation].to_sym
                           beds = record[:staffed_beds].gsub(/\D/,'').to_i
                           hospitals = record[:hospitals].gsub(/\D/,'').to_i
                           occupancy = beds > 0 ? record[:patient_days].gsub(/\D/,'').to_i / (365 * beds) : 0

                           r = ret[state] = s.new(hospitals, beds, (beds * 0.1).round(0), occupancy )
                           s.members.each { |k| ret[:all][k] += r[k] }
                         end
                         ret
                       end
    @us_state_beds[state.to_sym] || s.new(*([0] * s.members.length))
  end
  def us_state_population(state)
    @us_state_population ||= begin
                               s = Struct.new(:hospitals, :beds, :icu_ccb, :occupancy)
                               ret = {}
                               path = File.join(@dir, 'us_states', 'populations.txt')
                               open(path).each_struct do |record|
                                 state = record[:state].strip.to_sym
                                 pop = record[:p2019].gsub(/\D/,'').to_i
                                 ret[state] = pop
                               end
                               ret
                             end
    @us_state_population[state.to_sym] || 0

  end

  def us_state_data(state=nil)
    @us_state_data ||= begin
                         s = Struct.new(*@date_stat_keys)
                         ret = {}
                         d = URI.parse('https://covidtracking.com/api/states/daily.csv').read.split("\n").each_struct(',') do |record|
                           # skip over blank entries
                           next if record[:date].nil? || record[:date].empty?

                           # fix some fields
                           record[:date] = record[:date].gsub(/^(\d{4})(\d{2})(\d{2})/,'\1-\2-\3')
                           %w[positive negative pending hospitalized death total totalTestResults].each do |k|
                             record[k.to_sym] = record[k.to_sym].gsub(',','').to_i
                           end
                           %w[state].each do |k|
                             record[k.to_sym] = record[k.to_sym].to_sym
                           end

                           # fill in the record for this state and date
                           s1 = ret[record[:state]] ||= {
                             name: record[:state], # TODO: should be spelled-out name
                             type: 'state',
                             beds: us_state_beds(record[:state])[:beds],
                             population: us_state_population(record[:state]),
                             centroid: us_state_centroid(record[:state]),
                             dailyData: {}
                           }
                           r = %w[positive negative pending hospitalized death totalTestResults].map { |k| record[k.to_sym] }
                           r = s.new(*r).to_h
                           s1[:dailyData][record[:date]] = r

                           # create a combined :all entry
                           s1 = ret[:all] ||= {
                             name: 'United States', # shuld be spelled-out name
                             type: 'country',
                             beds: us_state_beds(:all)[:beds],
                             population: us_state_population(:all),
                             centroid: [39.8333333, -98.585522],
                             dailyData: {}
                           }
                           s2 = s1[:dailyData][record[:date]] ||= s.new(*([0] * @date_stat_keys.length)).to_h
                           @date_stat_keys.each { |k| s2[k] += r[k] }
                         end

                         # make sure that each date has an entry, 0'd out if nothing present
                         ret.each_value do |data|
                           d0, d1 = data[:dailyData].keys.minmax.map { |d| DateTime.strptime(d, '%Y-%m-%d').to_date }
                           # make sure that each date has an entry, 0'd out if nothing present
                           (d0 .. d1).each do |d|
                             data[:dailyData][d.strftime('%Y-%m-%d')] ||= s.new(*([0] * s.members.length))
                           end
                         end


                         # d0, d1, x, y = double_dxy(ret[:all], :negative)
                         # pp double_fitting(x, y)
                         # exit

                         # infer the best-fit doubling time kinetics
                         ret.each_value do |data|
                           data[:doublings] = {}
                           @date_stat_keys.each do |k|
                             d0, d1, x, y = double_dxy(data, k)
                             next if d0.nil?
                             dt, r2 = double_fitting(x, y)
                             d = data[:doublings][k] = [{
                                                      dates: [d0.to_s, d1.to_s],
                                                      initial: y[0],
                                                      r2: r2,
                                                      dt: dt,
                                                      y: y
                                                    }]
                           end
                         end
                         # ret.each_value do |data|
                         #   data[:dailyData] = data[:dailyData].to_a.sort.map { |d,c| c[:date] = d; c }
                         # end
                         ret
                       end
    return @us_state_data[state] unless state.nil?
    #pp @us_state_data
    #exit
    @us_state_data
  end

  def double_dxy(data, which)
    d0, d1 = data[:dailyData].keys.minmax.map { |d| DateTime.strptime(d, '%Y-%m-%d').to_date }
    ydx = (d0 .. d1)
            .map { |d| data[:dailyData][d.strftime('%Y-%m-%d')][which] }
            .zip(
              (d0 .. d1).to_a,
              (0 .. (d1-d0).to_i + 1).to_a
            )
    # TODO: credibly we could only count them once the value is higher than 1 - maybe 3 or 4
    nz = ydx.select { |c, _, _| c > 0}.map { |_, d, _| d}
    return [nil, nil, nil] if nz.length < 2
    ydx = ydx.select { |_, d, _| d.between?(*nz.minmax) }
    x = ydx.map { |_, _, i| i - ydx[0][-1] }
    y = ydx.map { |c, _, _| c }
    [d0, d1, x, y]
  end
  def double_fitting(x, y)
    r = y.map { |a| [1.0 * a / y[0], 1].max }
    rl = r.map { |a| Math.log(a) }

    lf = LineFit.new
    lf.setData(x, rl)
    r2 = lf.rSquared
    if lf.rSquared.to_f.round(2).nan?
      puts "ERROR IN doubling curve fitting!!"
      pp lf
      puts x.zip(y,r, rl).map { |r| r.join("\t")}.join("\n")
      exit
    end
    _, m = lf.coefficients
    dt = [[Math.log(2) / m, 1000].min,-1000].max
    [dt.round(1), r2.round(1)]
  end


  def us_state_save
    path = File.join(@dir, 'final', 'us_states.json')
    puts path
    ret = us_state_data
    ret.each_value do |data|
      data[:dailyData] = data[:dailyData].to_a.sort.map { |d,c| c[:date] = d; c }
    end
    ret = JSON.pretty_generate(ret)
    open(path,'w') { |f| f.puts(ret) }
  end

  # get a human-friendly table of stats and doubling times
  # if relative, the numbers are scaled to the first non-zero entry
  # TODO: refactor this
  def us_state_stats(state, relative=false)
    @rstr ||= Struct.new(*@date_stat_keys, :ignorance)
    out = [[state]]

    d0, d1 = us_state_data[state].keys.minmax.map { |d| DateTime.strptime(d, '%Y%m%d').to_date}

    # get the references
    refs = {}
    us_state_data[state].to_a.sort.each do |date, counts|
      counts = counts.to_a
      counts << (1.0 * counts[0] / counts[-1]).round(2) # add ignorance
      counts = @rstr.new(*counts)
      (@date_stat_keys + [:ignorance]).each do |k|
        next if refs.include?(k)
        next if counts[k] == 0
        refs[k] = [DateTime.strptime(date, '%Y%m%d').to_date, counts[k]]
      end
    end

    counts0 = us_state_data[state][us_state_data[state].keys.min].to_a
    counts0 << (1.0 * counts0[0] / counts0[-1]).round(2) # add ignorance
    counts0 = @rstr.new(*counts0)

    out << [:date] + @date_stat_keys + [:ignorance]
    us_state_data[state].to_a.sort.each do |date, counts|
      date = DateTime.strptime(date, '%Y%m%d').to_date
      counts = counts.to_a
      counts << (1.0 * counts[0] / counts[-1]).round(1)
      counts = counts.zip(@date_stat_keys + [:ignorance]).map do |v, k|
        vd, v0 = refs[k]
        v = (1.0 * v / v0).round(1) if relative
        v
      end
      out << [date] + counts
    end

    counts = us_state_data[state][us_state_data[state].keys.max].to_a
    counts << (1.0 * counts[0] / counts[-1]).round(2) # add ignorance
    counts = counts.zip(@date_stat_keys + [:ignorance]).map do |v, k|
      vd, v0 = refs[k]
      if v0.nil?
        'NA'
      else
        v = (1.0 * v / v0).round(1)
        dt = (d1 - vd).to_i
        doublings = Math.log(v) / Math.log(2)
        (dt / doublings).round(1)
      end
    end
    out << ['d-time'] + counts

    out.map { |line| line.join("\t") }.join("\n")
  end



end
