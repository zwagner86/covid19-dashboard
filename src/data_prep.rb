#!/usr/bin/env ruby
require 'pp'
require 'time'
require 'json'

module Enumerable
  # makes parsing titled columns a little more readable in code.
  # each line becomes a struct with named valules
  def each_struct
    str = nil
    each do |line|
      line = line.chomp.gsub(',','').split("\t")
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
    @targets = %w[positive hospital death tests].map { |k| k.to_sym }
  end

  # convert the data to a json object, optionally saving to a file
  def json(path=nil)
    ret = {}
    load_us_data.each do |state, dates|
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
    @rstr ||= Struct.new(*@targets, :ignorance)
    out = [[state]]

    d0, d1 = load_us_data[state].keys.minmax.map { |d| DateTime.strptime(d, '%Y%m%d').to_date}

    # get the references
    refs = {}
    load_us_data[state].to_a.sort.each do |date, counts|
      counts = counts.to_a
      counts << (1.0 * counts[0] / counts[-1]).round(2) # add ignorance
      counts = @rstr.new(*counts)
      (@targets + [:ignorance]).each do |k|
        next if refs.include?(k)
        next if counts[k] == 0
        refs[k] = [DateTime.strptime(date, '%Y%m%d').to_date, counts[k]]
      end
    end

    counts0 = load_us_data[state][load_us_data[state].keys.min].to_a
    counts0 << (1.0 * counts0[0] / counts0[-1]).round(2) # add ignorance
    counts0 = @rstr.new(*counts0)

    out << [:date] + @targets + [:ignorance]
    load_us_data[state].to_a.sort.each do |date, counts|
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

    counts = load_us_data[state][load_us_data[state].keys.max].to_a
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

  # Get the average latitude of a state - used for analysis of case doubling latitude-dependance
  def latitude(state)
    @latitudes ||= begin
                     ret = {}
                     path = File.join(File.dirname(__FILE__), 'data', 'countries_raw', 'us_lats.txt')
                     open(path).each_struct do |record|
                       ret[record[:state]] = record[:lat].to_f
                     end
                     ret
                   end
    @latitudes[state]
  end

  def us_states
    load_us_data.keys
  end

  def load_us_data
    s = Struct.new(*@targets)
    ret = {}
    path = File.join(File.dirname(__FILE__), 'data', 'countries_raw', 'us_date.txt')
    open(path).each_struct do |record|
      next if record[:date].nil?
      next if record[:date].empty?
      next if record[:date].start_with?('#')
      @targets.each { |k| record[k.to_sym] = record[k.to_sym].to_i }
      s1 = ret[record[:state].to_sym] ||= {}
      s1[record[:date]] = s.new(*@targets.map { |k| record[k] } )

      s1 = ret[:all] ||= {}
      s2 = s1[record[:date]] ||= s.new(0, 0, 0, 0)
      @targets.each { |k| s2[k] += record[k] }
    end
    ret
  end
end
c = Covid.new
path = File.join(File.dirname(__FILE__), 'data', 'countries', 'us.json')
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

