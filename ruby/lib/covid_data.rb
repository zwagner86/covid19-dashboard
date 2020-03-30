require_relative 'enumerable'
require_relative 'covid_data/us_states'
require_relative 'covid_data/us_metros'

class CovidData
  # Covid data source parsing

  def initialize
    # the keys in each dated record
    @date_stat_keys = %w[positive negative pending hospitalized death tests].map { |k| k.to_sym }
    @dir1 = File.join(File.dirname(__FILE__), 'data')
    @dir2 = File.join(File.dirname(File.dirname(File.dirname(__FILE__))), 'src', 'data', 'countries')
  end

  # TODO: obsolete, I think
  # convert the data to a json object, optionally saving to a file
  # def json(path=nil)
  #   ret = {}
  #   us_state_data.each do |state, dates|
  #     ret[state] = dates.map do |date, counts|
  #       {
  #         date: date.gsub(/^(\d{4})(\d{2})(\d{2})/,'\1-\2-\3'),
  #         cases: counts[:positive],
  #         hospitalizations: counts[:hospital],
  #         deaths: counts[:death],
  #         tests: counts[:tests]
  #       }
  #     end
  #   end
  #   ret = JSON.pretty_generate(ret)
  #   open(path,'w') { |f| f.puts(ret) } unless path.nil?
  #   ret
  # end

  def save_json(data, name)
    # fix the daily values as a list not a dictionary
    data.each_value do |val|
      val[:dailyData] = val[:dailyData].to_a.sort.map { |d,c| c[:date] = d; c }
    end

    path1 = File.join(@dir1, 'final', name + '.json')
    open(path1,'w') { |f| f.puts(JSON.pretty_generate(data)) }

    path2 = File.join(@dir2, name + '.json')
    open(path2,'w') { |f| f.puts(JSON.pretty_generate(data)) }

    puts path2
  end

  def data_finish(stats_data)
    # TODO: refactor these two steps because they are shared by metros and countries
    # make sure that each date has an entry, 0'd out if nothing present
    stats_data.each_value do |data|
      d0, d1 = data[:dailyData].keys.minmax.map { |d| DateTime.strptime(d, '%Y-%m-%d').to_date }
      # make sure that each date has an entry, 0'd out if nothing present
      (d0 .. d1).each do |d|
        data[:dailyData][d.strftime('%Y-%m-%d')] ||= s.new(*([0] * s.members.length))
      end
    end

    # infer the best-fit doubling time kinetics
    stats_data.each_value do |data|
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
    stats_data
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
    nz = ydx.select { |c, _, _| c > 2}.map { |_, d, _| d}
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


  # get a human-friendly table of stats and doubling times
  # if relative, the numbers are scaled to the first non-zero entry
  # TODO: refactor this to be more general (to countries, metros and the like)
  def region_stats(state, relative=false)
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

  include USStates
  include USMetros

  # include Countries
  # include MetroAreas
end
