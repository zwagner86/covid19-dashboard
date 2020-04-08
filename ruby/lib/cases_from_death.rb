class CasesFromDeath
  def initialize
    @model = Hash.new(0)
    File.open(__FILE__.gsub('.rb','.txt'))
        .readlines
        .map { |line| line.chomp.split("\t") }
        .map { |d, perc| @model[d.to_i] = (1.0 * perc.to_f / 100).round(3) }
      #predict(0.33,2.45, 0.03)
      predict(1,2.8, 0.01)
      #predict(0.16,2.45, 0.06)
  end
  def predict(c0, dt, dr)
    days = (0..60).to_a
    cases = days.map do |i|
      (c0 * (2 ** (i / dt))).round(1)
    end
    deaths = Hash.new(0)
    days.zip(cases).each do |d,c|
      @model.each do |dt, fr|
        deaths[dt + d + 4] += (dr * fr * c).round(1)
      end
    end

    cum = 0
    puts days.map { |d| cum += deaths[d]; [d, cases[d], '%.1f' % cum].join("\t") }
  end



end