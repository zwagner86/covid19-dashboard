#!/usr/bin/env ruby
require 'pp'
require 'time'
require 'json'
require 'open-uri'

module Enumerable
  # makes parsing titled columns a little more readable in code.
  # each line becomes a struct with named valules
  def each_struct(sep="\t")
    str = nil
    each do |line|
      next if line.start_with?('#')
      line = line.chomp.split(sep)
      if str.nil?
        str = Struct.new(*line.map { |k| k.to_sym })
      else
        yield str.new(*line)
      end
    end
  end
end

class Covid
  # Covid data source parsing

  def initialize
    @date_stat_keys = %w[positive negative pending hospitalized death tests beds population latitude longitude].map { |k| k.to_sym }
  end

  # convert the data to a json object, optionally saving to a file
  def json(path=nil)
    ret = {}
    us_state_data.each do |state, dates|
      ret[state] = dates.map do |date, counts|
        {
          date: date.gsub(/^(\d{4})(\d{2})(\d{2})/,'\1-\2-\3'),
          cases: counts[:positive],
          hospitalizations: counts[:hospital],
          deaths: counts[:death],
          tests: counts[:tests]
        }
      end
    end
    ret = JSON.pretty_generate(ret)
    open(path,'w') { |f| f.puts(ret) } unless path.nil?
    ret
  end

  # get a human-friendly table of stats and doubling times
  # if relative, the numbers are scaled to the first non-zero entry
  def state_stats(state, relative=false)
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

  # Get the average latitude of a state - used for analysis of case doubling latitude-dependance
  def us_state_centroid(state)
    @us_state_centroids ||= begin
                     ret = {}
                     path = File.join(File.dirname(__FILE__), 'data', 'raw', 'us_states', 'centroids.txt')
                     open(path).each_struct do |record|
                       ret[record[:state].to_sym] = [record[:lat].to_f, record[:lon].to_f]
                     end
                     ret
                   end
    @us_state_centroids[state.to_sym] || -99.0
  end

  def us_states
    us_state_data.keys
  end



  def us_state_beds(state)
    @us_state_beds ||= begin
                          ret = {}
                          path = File.join(File.dirname(__FILE__), 'data', 'raw', 'us_states', 'beds.txt')
                          open(path).each_struct do |record|
                            pp record
                            exit
                            ret[record[:state].to_sym] = [record[:lat].to_f, record[:lon].to_f]
                          end
                          ret
                        end
    @us_state_beds[state.to_sym] || 0

  end
  def us_state_population

  end

  def us_state_data
    @us_state_data ||= begin
      s = Struct.new(*@date_stat_keys)
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
        beds = 0
        population = 0
        latitude, longitude = us_state_centroid(record[:state])
        # add
        r = %w[positive negative pending hospitalized death totalTestResults].map { |k| record[k.to_sym] }
        r += [beds, population, latitude, longitude]
        r = s.new(*r)

        # fill in the record for this state and date
        s1 = ret[record[:state]] ||= {}
        s1[record[:date]] = r

        # create a combined :all entry
        s1 = ret[:all] ||= {}
        s2 = s1[record[:date]] ||= s.new(*([0] * @date_stat_keys.length))
        @date_stat_keys.each { |k| s2[k] += r[k] }
      end
      ret
    end
    pp @us_state_data
    exit

    @us_state_data
  end
end
c = Covid.new
c.us_state_beds('FL')
exit
c.us_state_data
exit

path = File.join(File.dirname(__FILE__), 'data', 'countries', 'us_states.json')
c.json(path)
res = c.us_states.map do |state|
  [c.state_stats(state).split("\n")[-1].split("\t")[1], state]
end.sort.each do |d,s|
  puts [s,d].join("\t")
end
puts '-------------------'
ARGV.each do |state|
  puts c.state_stats(state.to_sym)
  puts
end

c.us_states.each do |state|
  puts [state, c.state_stats(state.to_sym).split("\n")[-2].split("\t")[3]].join("\t")
end

