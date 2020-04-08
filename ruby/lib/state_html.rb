require_relative 'html_projects'

class StateHTML < HTMLProjects
  def update
    # reset the cumulative stats
    @index_table = [['State', 'Shelter Order', 'Population', 'Cumulative Sheltered', '', 'Cumulative % of US Sheltered']]
    @total_population = states.map { |ar| ar[1] }.inject(0,:+)
    @cum_pop = 0

    # do each state's data
    puts "Updating states"
    states.each { |ar| puts '  ' + ar[0]; one_state(*ar) }

    # make the index
    table = @index_table.table_html(
      {align: 'right'},
      [
        {width:  50, align: 'left', },
        {width: 150},
        {width: 150},
        {width: 150},
        {width: 100},
        {width: 210, align: 'left'},
      ]
    )

    path = File.join(File.dirname(__FILE__),'data', 'covid_shutdowns.html')
    template = open(path)
                 .read
                 .gsub('__DATE__', Date.today().to_s)
                 .gsub('__TIME__', Time.now.strftime('%H:%M:%S'))
                 .gsub('__TABLE__', table)

    path = File.join(@dir, 'index.html')
    open(path, 'w') { |f| f.write(template) }
    package
  end

  def add_to_index(state, population, date)
    @cum_pop += population
    cum_perc = '%.1f%%' % (100.0 * @cum_pop / @total_population).round(1)
    @index_table << [
      "<a href='index_state.html?state=%s'>%s</a>" % [state, state],
      date,
      population.commify,
      @cum_pop.commify,
      cum_perc,
      "<img src='resources/images/%s.png' height=12 width=%s>" % [
        date > Date.today.to_s ? 'red' : 'green',
        (200 * @cum_pop / @total_population).round(0),
      ]
    ]
  end

  def one_state(state, population, date)
    add_to_index(state, population, date) unless state == 'ALL'

    dir = File.join(@dir,'data', state.to_s.downcase)
    Dir.mkdir(dir) unless File.directory?(dir)

    d0 = DateTime.strptime(date, '%Y-%m-%d').to_date
    d1 = d0 + 5
    d2 = d0 + 17
    r = {
      date0: d0.to_s,
      date1: d1.to_s,
      date2: d2.to_s,
    }
    path = File.join(dir, 'dates.json')
    open(path, 'w') { |f| f.write(JSON.dump(r)) }


    c = CovidData.new

    r = c.stats(:us_states, state.upcase.to_sym, {
      columns: 'positive,model_positive',
      separator: ",",
      end_date: Date.today.to_s,
      model_date: date,
    })
    path = File.join(dir, 'cases_count.csv')
    open(path, 'w') { |f| f.write(r) }

    r = c.stats(:us_states, state.upcase.to_sym, {
      columns: 'doubling_positive',
      separator: ",",
      end_date: Date.today.to_s,
      model_date: date,
    })
    path = File.join(dir, 'cases_doubling.csv')
    open(path, 'w') { |f| f.write(r) }

    r = c.stats(:us_states, state.upcase.to_sym, {
      columns: 'death,model_death',
      separator: ",",
      end_date: Date.today.to_s,
      model_date: date,
    })
    path = File.join(dir, 'deaths_count.csv')
    open(path, 'w') { |f| f.write(r) }

    r = c.stats(:us_states, state.upcase.to_sym, {
      columns: 'doubling_death',
      separator: ",",
      end_date: Date.today.to_s,
      model_date: date,
    })
    path = File.join(dir, 'deaths_doubling.csv')
    open(path, 'w') { |f| f.write(r) }

  end

  def states
    # get the states ad when they went into shelter-in-place
    @states ||= begin
                  path = File.join(File.dirname(__FILE__),'data', 'us_states', 'shutdowns.txt')
                  open(path).read.split("\n").map do |line|
                    if line.start_with?('#')
                      nil
                    else
                      state, population, date = line.chomp.split("\t")
                      population = population.to_i
                      [state, population, date]
                    end
                  end.reject { |ar| ar.nil? }.sort_by { |_, _, date| date }
                end
    return @states
  end

end
