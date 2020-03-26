require 'open-uri'
require 'json'

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
    @us_state_beds ||= begin
                         s = Struct.new(:hospitals, :beds, :icu_ccb, :occupancy)
                         ret = {}
                         path = File.join(@dir, 'us_states', 'beds.txt')
                         open(path).each_struct do |record|
                           state = record[:abbreviation].to_sym
                           beds = record[:staffed_beds].gsub(/\D/,'').to_i
                           hospitals = record[:hospitals].gsub(/\D/,'').to_i
                           occupancy = beds > 0 ? record[:patient_days].gsub(/\D/,'').to_i / (365 * beds) : 0

                           ret[state] = s.new(hospitals, beds, (beds * 0.1).round(0), occupancy )
                         end
                         ret
                       end
    @us_state_beds[state.to_sym] || 0
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
                   s = Struct.new(*@targets)
                   ret = {}
                   d = URI.parse('https://covidtracking.com/api/states/daily.csv').read.split("\n").each_struct(',') do |record|
                     next if record[:date].nil?
                     next if record[:date].empty?
                     record[:date] = record[:date].gsub(/^(\d{4})(\d{2})(\d{2})/,'\1-\2-\3')
                     %w[positive negative pending hospitalized death total totalTestResults].each do |k|
                       record[k.to_sym] = record[k.to_sym].gsub(',','').to_i
                     end
                     %w[state].each do |k|
                       record[k.to_sym] = record[k.to_sym].to_sym
                     end
                     # get state-level beds and population
                     beds = us_state_beds(record[:state])[:beds]
                     population = us_state_population(record[:state])
                     latitude, longitude = us_state_centroid(record[:state]) || [-99, -1]
                     # add
                     r = %w[positive negative pending hospitalized death totalTestResults].map { |k| record[k.to_sym] }
                     r += [beds, population, latitude, longitude]
                     r = s.new(*r)

                     # fill in the record for this state and date
                     s1 = ret[record[:state]] ||= {}
                     s1[record[:date]] = r.to_h

                     # create a combined :all entry
                     s1 = ret[:all] ||= {}
                     s2 = s1[record[:date]] ||= s.new(*([0] * @targets.length)).to_h
                     @targets.each { |k| s2[k] += r[k] }
                     s2[:latitude] = 39.8333333
                     s2[:longitude] = -98.585522
                   end
                   ret
                 end
    return @us_state_data[state] unless state.nil?
    @us_state_data
  end

  def us_state_save
    path = File.join(@dir, 'final', 'us_states.json')
    puts path
    ret = JSON.pretty_generate(us_state_data)
    open(path,'w') { |f| f.puts(ret) }
  end

  # get a human-friendly table of stats and doubling times
  # if relative, the numbers are scaled to the first non-zero entry
  # TODO: refactor this
  def us_state_stats(state, relative=false)
    @rstr ||= Struct.new(*@targets, :ignorance)
    out = [[state]]

    d0, d1 = us_state_data[state].keys.minmax.map { |d| DateTime.strptime(d, '%Y%m%d').to_date}

    # get the references
    refs = {}
    us_state_data[state].to_a.sort.each do |date, counts|
      counts = counts.to_a
      counts << (1.0 * counts[0] / counts[-1]).round(2) # add ignorance
      counts = @rstr.new(*counts)
      (@targets + [:ignorance]).each do |k|
        next if refs.include?(k)
        next if counts[k] == 0
        refs[k] = [DateTime.strptime(date, '%Y%m%d').to_date, counts[k]]
      end
    end

    counts0 = us_state_data[state][us_state_data[state].keys.min].to_a
    counts0 << (1.0 * counts0[0] / counts0[-1]).round(2) # add ignorance
    counts0 = @rstr.new(*counts0)

    out << [:date] + @targets + [:ignorance]
    us_state_data[state].to_a.sort.each do |date, counts|
      date = DateTime.strptime(date, '%Y%m%d').to_date
      counts = counts.to_a
      counts << (1.0 * counts[0] / counts[-1]).round(1)
      counts = counts.zip(@targets + [:ignorance]).map do |v, k|
        vd, v0 = refs[k]
        v = (1.0 * v / v0).round(1) if relative
        v
      end
      out << [date] + counts
    end

    counts = us_state_data[state][us_state_data[state].keys.max].to_a
    counts << (1.0 * counts[0] / counts[-1]).round(2) # add ignorance
    counts = counts.zip(@targets + [:ignorance]).map do |v, k|
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
