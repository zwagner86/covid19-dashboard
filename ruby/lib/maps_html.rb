require 'fileutils'
require_relative 'html_projects'

class MapsHTML < HTMLProjects
  def initialize(dir)
    @dir = dir
    path = File.join(File.dirname(__FILE__), 'states')
    FileUtils.rm_r(@dir) if File.directory?(@dir)
    FileUtils.cp_r(path, @dir)
  end

  def update
    c = CovidData.new
    c.groups.each do |group|
      next if group == :country
      dates = c.group_data(group).values.map { |v| v[:dailyData].keys }.flatten.sort.uniq[3,999]
      [:positive, :hospitalized, :death, :positive_per_100k, :death_per_100k].each do |key|
        max = 0
        dates.each do |date|
          ret = [%w[id value tip]]
          c.group_data(group).each do |location, data|
            population = data[:population]
            next if population == 0
            d = data[:dailyData][date]
            next if d.nil?
            d[:positive_per_100k] = (1.0 * d[:positive] /population * 100_000).round(3)
            d[:death_per_100k]    = (1.0 * d[:death]    /population * 100_000).round(3)
            max = [d[key], max].max
            code = location
            code = 'FIPS_' + location.to_s if group == :us_county
            val = '%.2f' % d[key]
            ret << [code, val, val + ' in ' + data[:name]]
          end
          path = File.join(@dir,'data',group.to_s, key.to_s, date + '.csv')
          FileUtils.mkdir_p(File.dirname(path))
          open(path,'w') { |f| f.write(ret.table(",")) }
        end
        path = File.join(@dir,'data',group.to_s, key.to_s, 'max.csv')
        open(path,'w') { |f| f.write(max.to_s) }
        puts 'finished ' + [group, key].join(' for ')
      end
    end
  end
end