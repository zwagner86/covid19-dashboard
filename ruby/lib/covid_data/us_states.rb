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

  def us_state_name(state)
    @us_state_name ||= {
      AL: 'Alabama',
      AK: 'Alaska',
      AZ: 'Arizona',
      AR: 'Arkansas',
      CA: 'California',
      CO: 'Colorado',
      CT: 'Connecticut',
      DE: 'Delaware',
      FL: 'Florida',
      GA: 'Georgia',
      HI: 'Hawaii',
      ID: 'Idaho',
      IL: 'Illinois',
      IN: 'Indiana',
      IA: 'Iowa',
      KS: 'Kansas',
      KY: 'Kentucky',
      LA: 'Louisiana',
      ME: 'Maine',
      MD: 'Maryland',
      MA: 'Massachusetts',
      MI: 'Michigan',
      MN: 'Minnesota',
      MS: 'Mississippi',
      MO: 'Missouri',
      MT: 'Montana',
      NE: 'Nebraska',
      NV: 'Nevada',
      NH: 'New Hampshire',
      NJ: 'New Jersey',
      NM: 'New Mexico',
      NY: 'New York',
      NC: 'North Carolina',
      ND: 'North Dakota',
      OH: 'Ohio',
      OK: 'Oklahoma',
      OR: 'Oregon',
      PA: 'Pennsylvania',
      RI: 'Rhode Island',
      SC: 'South Carolina',
      SD: 'South Dakota',
      TN: 'Tennessee',
      TX: 'Texas',
      UT: 'Utah',
      VT: 'Vermont',
      VA: 'Virginia',
      WA: 'Washington',
      WV: 'West Virginia',
      WI: 'Wisconsin',
      WY: 'Wyoming',
      DC: 'District of Columbia',
      MH: 'Marshall Islands',
      AE: 'Armed Forces Elsewhere',
      AA: 'Armed Forces Americas',
      AP: 'Armed Forces Pacific'
    }
    @us_state_name[state]
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
                             name: us_state_name(record[:state]),
                             code: record[:state],
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
                         data_finish(ret)
                       end
    return @us_state_data[state] unless state.nil?
    #pp @us_state_data
    #exit
    @us_state_data
  end



  def us_state_save
    save_json(us_state_data(), 'us_states')
  end




end
