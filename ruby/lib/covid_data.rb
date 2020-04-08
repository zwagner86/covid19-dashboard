require_relative 'enumerable'
require_relative 'covid_data/us_states'
require_relative 'covid_data/us_metros'
require_relative 'covid_data/us_counties'
require_relative 'covid_data/countries'

class CovidData
  # Covid data source parsing

  def initialize(delay = 0.5)
    @delay = delay
    # the keys in each dated record
    @date_stat_keys = %w[positive negative pending hospitalized death tests].map { |k| k.to_sym }
    @date_stat_struct = Struct.new(*@date_stat_keys)

    @dir1 = File.join(File.dirname(__FILE__), 'data')
    @dir2 = File.join(File.dirname(File.dirname(File.dirname(__FILE__))), 'src', 'data', 'countries')
  end

  def stats_by_dates(group, options)
    dates = group_data(group).values.map { |v| v[:dailyData].keys }.flatten.sort.uniq[3,999]
    dates.each do |date|
      group_data(group).each do |location, data|
        population = data[:population]
        pp date
        pp population
        pp location
        d = data[:dailyData][date]
        d[:positive_per_100k] = 1.0 * d[:positive] /population * 100_000
        d[:death_per_100k]    = 1.0 * d[:death]    /population * 100_000
        pp d
        exit
      end
    end

    exit
  end


  def stats(group, location, options)
    d = group_location(group.to_sym, location,  options[:model_date], options[:end_date])

    cols = options[:columns].split(',').map do |col|
      col = col.downcase
      col = 'positive'      if %w[cases case positive positives].include?(col)
      col = 'negative'      if %w[negative negatives].include?(col)
      col = 'pending'       if %w[pending pendings].include?(col)
      col = 'hospitalized'  if %w[hospitalized hospitalizeds].include?(col)
      col = 'death'         if %w[deaths death].include?(col)
      col = 'tests'         if %w[test tersts].include?(col)
      col.downcase.to_sym
    end

    tbl = [['date'] + cols]
    d[:dailyData].each do |date, counts|
      tbl << [date] + cols.map do |col|
        v = counts[col] || ''
        v = '' if v.to_s == '1000'
        v
      end
    end
    tbl.table(options[:separator])
  end

  def groups
    [:us_county, :us_metro, :us_state, :country]
  end

  def fix_group(group)
    group.to_s.downcase.gsub(/s$/,'').to_sym
  end

  def group_data(group)
    case fix_group(group)
    when :us_state
      us_state_data
    when :us_county
      us_county_data
    when :us_metro
      us_metro_data
    when :country
      country_data
    else
      raise Exception, "Illegal group '#{group}' - must be us_state, us_county, us_metro, or country"
    end
  end

  def group_locations(group)
    group_data.keys
  end

  def group_location(group, location, model_date, end_date)
    h = case fix_group(group)
        when :us_state
          data_fit(data_finish(us_state_data),  model_date, end_date)
        when :us_county
          data_fit(data_finish(us_county_data), model_date, end_date)
        when :us_metro
          data_fit(data_finish(us_metro_data),  model_date, end_date)
        when :country
          data_fit(data_finish(country_data),   model_date, end_date)
        else
          raise Exception, "Illegal group '#{group}' - must be us_state, us_county, us_metro, or country"
        end
    h[location.to_sym]
  end

  def blank_struct
    r = [0] * @date_stat_struct.members.length
    @date_stat_struct.new(*r).to_h
  end


  ##############################
  # standard processing of regions
  ##############################
  def save_json(dir)
    save_json_one(dir, country_data, 'country')
    save_json_one(dir, us_state_data,'us_state')
    save_json_one(dir, us_metro_data, 'us_metro')
    save_json_one(dir, us_county_data, 'us_county')

    bn = File.basename(dir)
    dn = File.dirname(dir)


    puts "Uploading json data"
    Dir[File.join(dir,'*.json')].each do |path|
      bn = File.basename(path)
      dn = File.dirname(path)
      cmd = "curl -u 'corona@coronamodel.com:Pp[31415926]' --ftp-create-dirs -s -T #{dn}/#{bn} ftp://160.153.91.2/standalone/#{bn}"
      r = `#{cmd} 2>&1`.chomp
      r = ' - ERRORS: ' + r unless r.empty?
      puts "  #{bn}#{r}"
    end
  end

  def save_json_one(dir, data,name)
    # fix the daily values as a list not a dictionary
    data = Marshal.load(Marshal.dump(data))
    data.each_value do |val|
      val[:dailyData] = val[:dailyData].to_a.sort.map { |d,c| c[:date] = d; c }
    end

    path = File.join(dir, name + '.json')
    open(path,'w') { |f| f.puts(JSON.pretty_generate(data)) }
  end

  def data_fit(stats_data, model_date, end_date)
    # infer the best-fit doubling time kinetics
    #stats_data.keys.each { |k| stats_data.delete(k) unless k == :IL}
    stats_data.each_value do |data|
      #@date_stat_keys = [:positive]
      @date_stat_keys.reject { |k| %w[pending hospitalized].include?(k.to_s) }.each do |k|
        d = data[:doublings][k]

        ref = d.keys.select { |date| date <= model_date }.sort.reverse[0]
        next if ref.nil?

        # fill in the model predictions
        model_name = ('model_' + k.to_s).to_sym
        dt = d[ref][:doubling_time]
        v0 = data[:dailyData][ref][k]
        date = data[:dailyData].keys.sort.min
        i = 1
        while date <= end_date
          data[:dailyData][date] ||= {}
          i = date_dif(ref, date)
          fold = 2 ** (1.0 * i / dt)
          pred = (v0 * fold).round(0)
          data[:dailyData][date][model_name] = pred.round(0)
          date = add_date(date)
          i += 1
        end
      end
    end
    stats_data
  end

  def data_finish(stats_data)
    stats_data.each_value do |data|
      d0, d1 = data[:dailyData].keys.minmax.map { |d| DateTime.strptime(d, '%Y-%m-%d').to_date }
      # make sure that each date has an entry, 0'd out if nothing present
      (d0 .. d1).each do |d|
        data[:dailyData][d.strftime('%Y-%m-%d')] ||= blank_struct
      end

      # sort the days in dailyData
      ndd = {}
      data[:dailyData].to_a.sort.each do |d,r|
        ndd[d] = r
      end
      data[:dailyData] = ndd
    end

    # infer the best-fit doubling time kinetics
    stats_data.each_value do |data|
      data[:doublings] = {}
      @date_stat_keys.reject { |k| %w[pending hospitalized].include?(k.to_s) }.each do |k|
        d = data[:doublings][k] = {}
        xyd = double_dxy(data, k) || next
        (2 .. xyd.length - 1).each do |i|
          training = xyd.select { |row| row[2].between?(xyd[i][2] - 4, xyd[i][2]) }
          n = training.length
          next if n < 2

          x = training.map { |row| row[0] }
          y = training.map { |row| row[1] }
          dates = training.map { |row| row[2] }
          dt, r2 = double_fitting(x, y)
          doubling_name = ('doubling_' + k.to_s).to_sym
          data[:dailyData][dates[-1].strftime('%Y-%m-%d')][doubling_name] = dt

          d[xyd[i][-1].strftime('%Y-%m-%d')] = {
            initial: xyd[i][1],
            n: n,
            r2: r2,
            doubling_time: dt,
            x: x,
            y: y,
          }
        end
      end
    end


    stats_data
  end

  def add_date(date)
    (DateTime.strptime(date,'%Y-%m-%d').to_date + 1).strftime('%Y-%m-%d')
  end
  def date_dif(date1,date2)
    d1 = DateTime.strptime(date1,'%Y-%m-%d').to_date
    d2 = DateTime.strptime(date2,'%Y-%m-%d').to_date
    (d2 - d1).to_i
  end

  ##############################
  # curve fitting
  ##############################
  def double_dxy(data, which)
    d0, d1 = data[:dailyData].keys.minmax.map { |d| DateTime.strptime(d, '%Y-%m-%d').to_date }
    xyd = (d0 .. d1).map do |d|
      [
        (d - d0).to_i,
        data[:dailyData][d.strftime('%Y-%m-%d')][which],
        d
      ]
    end
    return nil if xyd.empty?

    # strip out the leading 0s
    first = xyd.select { |row| (row[1] || 0) > 0 }[0]
    return nil if first.nil?
    xyd = xyd[first[0], xyd.length]
    d0 = xyd[0][-1]
    d1 = xyd[-1][-1]
    xyd.each do |row|
      row[0] = (row[-1] - d0).to_i
    end

    # drop any rows that are less than 2
    xyd = xyd.select { |row| (row[1] || 0) > 1 }
    return nil if xyd.empty?
    d0 = xyd[0][-1]
    d1 = xyd[-1][-1]
    xyd.each do |row|
      row[0] = (row[-1] - d0).to_i
    end

    # drop any rows much larger than the previous and those after
    (0 .. xyd.length-1).zip(xyd).reject do |real_i, row|
      _, v, _ = row
      v_b = real_i > 0              ? xyd[real_i-1][1] : v
      v_a = real_i < xyd.length - 1 ? xyd[real_i+1][1] : v
      v > v_a || v/v_b > 2
    end
    return nil if xyd.empty?
    xyd
  end

  def double_fitting(x, y)
    # TODO: remove internal 0 records where it is not zero on either side
    r = y.map { |a| [1.0 * a / y[0], 1].max }
    rl = r.map { |a| Math.log(a) }
    #pp x.zip(y)
    #exit



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

  ##############################
  # Caching results
  ##############################
  def unlink_old_file(path, days)
    return unless File.file?(path)
    age = 1.0 * (Time.now() - File.mtime(path)) / (60 * 60 * 24)
    return if age < days
    puts "deleting #{path}"
    File.unlink(path)
  end

  def cached(days)
    path = "data/cache/#{caller_locations.first.label}.marshal"
    unlink_old_file(path, days)
    if File.file?(path)
      Marshal.load(open(path).read)
    else
      r = yield
      open(path,'w') { |f| f.write(Marshal.dump(r))}
      r
    end
  end

  ##############################
  # analysis of regions
  ##############################
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

  ##############################
  # regional code
  ##############################
  include USStates
  include USCounties
  include USMetros
  include Countries
end
