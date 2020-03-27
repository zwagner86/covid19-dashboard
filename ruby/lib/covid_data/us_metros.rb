require 'json'
require 'time'

require 'open-uri'
require 'linefit'

module USMetros
  def us_metro_counties(county=nil)
    @us_metro_counties ||= begin
                             ret = {}
                             rev = {}
                             lines = URI.parse('https://www.census.gov/population/estimates/metro-city/99mfips.txt')
                                      .read
                                      .split("\n")
                                      .select { |line| line.start_with?(/^\d{4}/) }
                             lines.each do |line|
                               line = line.chomp.unpack('a4a4a4a4a2a6a2a3a3a1a5a5a3a49')
                               msa, _, _, _, _, _, fips_state, fips_county, _, _, _, _, _, name = line
                               r = ret[msa] ||= { msa: msa, counties: [], }
                               if fips_state.strip.empty?
                                 r[:name] = name.strip.gsub(' MSA','')
                               else
                                 r[:counties] << fips_state + fips_county
                               end
                               rev[fips_state + fips_county] = msa
                             end
                             [ret, rev]
                           end

    return @us_metro_counties[0] if county.nil?
    msa = @us_metro_counties[1][county]
    return ['0000', 'Unknown MSA'] if msa.nil?
    [msa, @us_metro_counties[0][msa][:name]]
  end

  def us_metro_data(msa=nil)
    @us_metro_data ||= begin
                         s = Struct.new(*@date_stat_keys)
                         ret = {}

                         # get the fresh data from the NYT
                         r = `cd ../../covid-19-data; git pull`.chomp.gsub('Already up to date.','').chomp
                         unless r.empty?
                           puts "Failed to update covid-19-data"
                           pp r
                           exit
                         end
                         open('../../covid-19-data/us-counties.csv').each_struct(',') do |record|
                           %w[cases deaths].each { |k| record[k.to_sym] = record[k.to_sym].to_i }
                           record = record.to_h
                           msa_code, msa_name = us_metro_counties(record[:fips])
                           record[:msa] = msa_code
                           record[:metro] = msa_name

                           s1 = ret[record[:metro]] ||= {
                             code: record[:msa],
                             name: record[:metro],
                             type: 'msa',
                             beds: 0, # us_state_beds(record[:state])[:beds],
                             population: 0, # us_state_population(record[:state]),
                             centroid: [0,0],
                             dailyData: {}
                           }
                           r = [record[:cases], 0, 0, 0, record[:deaths], 0]
                           r = s.new(*r).to_h
                           s1[:dailyData][record[:date]] = r
                         end
                         ret.to_a
                           .select { |_,v| v[:dailyData].length < 7 || v[:dailyData].values[-1][:positive] < 10 }
                           .each { |k,v| ret.delete(k)}
                         data_finish(ret)
                       end
    return @us_metro_data if msa.nil?
    @us_metro_data[msa]
  end

  def us_metro_save
    d = us_metro_data(nil)
    save_json(us_metro_data(), 'us_metros')
  end


end