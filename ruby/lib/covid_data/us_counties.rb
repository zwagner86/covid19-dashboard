module USCounties
  def us_county_population(fips=nil)
    @us_county_population ||= cached(@delay) do
      ret = {}
      uri = 'https://www2.census.gov/programs-surveys/popest/datasets/2010-2019/counties/totals/co-est2019-alldata.csv'
      URI.parse(uri).read.split("\n").each_struct(',') do |record|
        fips_val = [record[:STATE], record[:COUNTY]].join('')
        state_code = us_county_to_state(fips_val)
        pop = record[:POPESTIMATE2019].to_i
        ret[fips_val] = pop
      end
      ret
    end
    return @us_county_population[fips] if !fips.nil?
    @us_county_population
  end

  def us_county_to_state(fips)
    {
      '01' => 'AL',      '02' => 'AK',      '04' => 'AZ',      '05' => 'AR',      '06' => 'CA',      '08' => 'CO',
      '09' => 'CT',      '10' => 'DE',      '11' => 'DC',      '12' => 'FL',      '13' => 'GA',      '15' => 'HI',
      '16' => 'ID',      '17' => 'IL',      '18' => 'IN',      '19' => 'IA',      '20' => 'KS',      '21' => 'KY',
      '22' => 'LA',      '23' => 'ME',      '24' => 'MD',      '25' => 'MA',      '26' => 'MI',      '27' => 'MN',
      '28' => 'MS',      '29' => 'MO',      '30' => 'MT',      '31' => 'NE',      '32' => 'NV',      '33' => 'NH',
      '34' => 'NJ',      '35' => 'NM',      '36' => 'NY',      '37' => 'NC',      '38' => 'ND',      '39' => 'OH',
      '40' => 'OK',      '41' => 'OR',      '42' => 'PA',      '44' => 'RI',      '45' => 'SC',      '46' => 'SD',
      '47' => 'TN',      '48' => 'TX',      '49' => 'UT',      '50' => 'VT',      '51' => 'VA',      '53' => 'WA',
      '54' => 'WV',      '55' => 'WI',      '56' => 'WY',      '60' => 'AS',      '66' => 'GU',      '72' => 'PR',
      '78' => 'VI',
    }[fips[0,2]]
  end

  # us_state_beds(record[:state])[:beds] scaled to population of country / state,
  def us_county_beds(fips)
    state = us_county_to_state(fips).to_sym
    p_ratio = 1.0 * us_county_population(fips) / us_state_population(state)
    ret = us_state_beds(state)
    ret.each_key { |k| ret[k] = (ret[k] * p_ratio).round(1) }
    ret
  end

  def us_county_data(fips=nil)
    @us_county_data ||= cached(@delay) do
      # get the fresh data from the NYT
      unless system('cd ../../covid-19-data; git pull >/dev/null')
        puts "Failed to update covid-19-data"
        exit
      end

      ret = {}
      open('../../covid-19-data/us-counties.csv').each_struct(',') do |record|
        %w[cases deaths].each { |k| record[k.to_sym] = record[k.to_sym].to_i }
        next if record[:fips].strip.empty?
        record = record.to_h
        s1 = ret[record[:fips]] ||= {
          code: record[:fips],
          name: [record[:county], record[:state]].join(', '),
          county: record[:county],
          state: record[:state],
          state_code: us_county_to_state(record[:fips]),
          type: 'county',

          beds: us_county_beds(record[:fips])[:beds],
          population: us_county_population[record[:fips]] || 0,
          centroid: [0,0],
          dailyData: {}
        }
        # The NYT only gives us cases and deaths
        r = [record[:cases], 0, 0, 0, record[:deaths], 0]
        r = @date_stat_struct.new(*r).to_h
        s1[:dailyData][record[:date]] = r
      end
      data_finish(ret)
    end
    return @us_county_data[fips] unless fips.nil?
    @us_county_data
  end


end

