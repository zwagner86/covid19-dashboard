module Enumerable
  # makes parsing titled columns a little more readable in code.
  # each line becomes a struct with named valules
  def each_struct(sep="\t")
    str = nil
    each do |line|
      next if line.start_with?('#')
      line = line.chomp.split(sep)
      if str.nil?
        str = Struct.new(*line.map { |k| k.to_sym })
      else
        yield str.new(*line)
      end
    end
  end
end