module Enumerable
  # makes parsing titled columns a little more readable in code.
  # each line becomes a struct with named valules
  def each_struct(sep="\t")
    str = nil
    each do |line|
      next if line.start_with?('#')
      line = line.chomp.split(sep,-1)
      if str.nil?
        str = Struct.new(*line.map { |k| k.to_sym })
      else
        if line.length != str.members.length
          pp '-----------------'
          pp str.members
          pp line
          pp "Mismatch line lengths!"
          pp '-----------------'
          exit
        end
        yield str.new(*line)
      end
    end
  end

  def table(spacer="\t")
    lengths = []
    s = self.to_a
    s.each do |line|
      line.each_with_index do |val, i|
        #val = val.commify if val.respond_to?(:commify)
        lengths[i] = [lengths[i] || 0, val.to_s.length].max
      end
    end
    fmt = lengths.map { |l| '%-' + l.to_s + 's' }.join(spacer)

    ret = []
    s.each do |line|
      line = Array(line).map do |val|
        #val = val.commify if val.respond_to?(:commify)
        val
      end
      fmt ||= line.map { |k| '%-' + k.length.to_s + 's'}.join(spacer)
      ret << (fmt % line)
    end
    ret.join("\n")
  end

  def table_html(attributes=nil, columns=nil)
    attributes ||= {}
    columns ||= []
    ret = []
    ret << '<table>'
    self.to_a.each_with_index do |row, row_i|
      ret << "\t<tr>"
      row.each_with_index do |cell, cell_i|
        a = attributes.clone.update(columns[cell_i] || {}).map { |k,v| "#{k}='#{v}'"}.join(' ')
        ret << "\t\t<td #{a}>"
        ret << "\t\t\t" + cell.to_s
        ret << "\t\t</td>"
      end
      ret << "\t</tr>"
    end
    ret << '</table>'
    ret.join("\n")
  end

end