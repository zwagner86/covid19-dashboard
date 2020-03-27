require_relative 'enumerable'
require_relative 'covid_data/us_states'

class CovidData
  # Covid data source parsing

  def initialize
    # the keys in each dated record
    @date_stat_keys = %w[positive negative pending hospitalized death tests].map { |k| k.to_sym }
    @dir = File.join(File.dirname(__FILE__),'data')
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


  include USStates
  # include Countries
  # include MetroAreas
end
