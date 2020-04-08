require 'thor'
require 'fileutils'

require 'enumerable'
require 'numeric'
require 'covid_data'
require 'state_html'
require 'maps_html'

class CovidCLI < Thor
  ##################################
  # Web outputs
  ##################################
  desc "json DIR", "Update json files in DIR"
  def json(dir)
    puts "updating json in #{dir}"
    c = CovidData.new
    c.save_json(dir)
  end

  desc 'states DIR', 'make the states site'
  def states(dir)
    s = StateHTML.new(dir)
    s.update
  end

  desc 'maps DIR', 'make the maps data'
  def maps(dir)
    m = MapsHTML.new(dir)
    m.update
  end

  ##################################
  # CL statistical tools
  ##################################
  desc "stats group location", "get tabular stats on an location (e.g, a state) in a group (e.g., in us_states)"
  option(
    :columns,
    :type => :string,
    :description => 'comma-delimeted list of base columns to include (from positive, negative, pending, hospitalized, death, tests)',
    :default => 'death,doubling_death,model_death'
  )
  option(
    :end_date,
    :type => :string,
    :description => 'the final date for which to extend projections',
    :default => Date.today().to_s
  )
  option(
    :model_date,
    :type => :string,
    :description => 'the final date for which to extend projections',
    :default => Date.today().to_s
  )
  option(
    :separator,
    :type => :string,
    :description => 'separator in output tables, def = tab',
    :default => "\t"
  )
  def stats(group, location)
    c = CovidData.new
    puts c.stats(group, location, options)
  end

  desc "groups", "get a list of all groups"
  def groups
    c = CovidData.new
    puts c.groups.join("\n")
  end

  desc "locations group", "get a list of all entities in a group (e.g., in us_states)"
  def locations(group)
    group = group.gsub(/s$/,'')
    c = CovidData.new
    puts "Locations inside #{group}:"
    puts '=' * "Locations inside #{group}:".length
    puts c.group_locations(group).join("\n")
  end
end

