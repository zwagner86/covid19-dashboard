class HTMLProjects
  def initialize(dir)
    @dir = dir
    path = File.join(File.dirname(__FILE__), 'states')
    FileUtils.rm_r(@dir) if File.directory?(@dir)
    FileUtils.cp_r(path, @dir)
  end

  def package
    `chmod -Rf a+rX #{@dir}`
    bn = File.basename(@dir)
    dn = File.dirname(@dir)
    Dir[File.join(@dir,'*.html')].each { |path| `touch #{path}`}

    puts "Uploading state data"
    Dir[File.join(@dir,'**','*')].each do |path|
      path = path.gsub(@dir,'')
      cmd = "curl -u 'corona@coronamodel.com:Pp[31415926]' --ftp-create-dirs -s -T #{@dir}#{path} ftp://160.153.91.2/standalone/#{path}"
      r = `#{cmd} 2>&1`.chomp
      r = ' - ERRORS: ' + r unless r.empty?
      puts "  #{path}#{r}"
    end
  end

end