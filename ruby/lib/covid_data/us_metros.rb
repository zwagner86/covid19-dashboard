require 'json'
require 'time'

require 'open-uri'
require 'linefit'


module USMetros
  def us_metro_counties(county=nil)
    @us_metro_counties ||= cached(@delay) do
      ret = {}
      rev = {}
      lines = URI.parse('https://www.census.gov/population/estimates/metro-city/99mfips.txt')
              .read
              .split("\n")
              .select { |line| line.start_with?(/^\d{4}/) }
      lines.each do |line|
       line = line.chomp.unpack('a4a4a4a4a2a6a2a3a3a1a5a5a3a2a47')
       msa, _, _, _, _, _, fips_state, fips_county, _, _, _, _, _, _, name = line
       r = ret[msa] ||= { msa: msa, counties: [], }
       if name.start_with?(' ')
         r[:counties] << fips_state + fips_county unless fips_county.strip.empty?
       else
         r[:name] = name.strip.gsub(' MSA','').gsub(' CMSA','')
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


  def us_metro_data(area=nil)
    @us_metro_data ||= cached(@delay) do
      ret = {}
      us_county_data.each_pair do |fips, data|
        msa_code, msa_name = us_metro_counties(data[:code])
        s1 = ret[msa_name] ||= {
          code: msa_code,
          name: msa_name,
          type: 'msa',

          beds: 0,
          population: 0,
          centroid: [0,0],

          dailyData: {}
        }
        # add in the global beds and pops
        s1[:beds] += data[:beds]
        s1[:population] += data[:population]

        # add in the dailyData
        data[:dailyData].each do |date, record|
          s2 = s1[:dailyData][date] ||= blank_struct
          record.each_pair { |k,v| s2[k] += v if s2.include?(k) }
        end
      end
      # remove some of the quiet MSAs
      ret.to_a
        .select { |_,v| v[:dailyData].length < 7 } #|| v[:dailyData].values[-1][:positive] < 10 }
        .each { |k,v| ret.delete(k)}
      # fix the structure to include doublings and so on
      data_finish(ret)
   end
    return @us_metro_data[area] unless area.nil?
    @us_metro_data
  end

end