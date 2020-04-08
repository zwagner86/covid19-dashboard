class Numeric
  # format a number with commas at the 100's positions
  # E.g., 1000.commify => '1,000'
  #       1000.1.commify(2) => 1,000.10
  # decimals=:all and keep every one of them
  # @return a string with commas in it
  def commify(decimals=0)
    return self.to_s unless self.finite?
    part_decimal = self.to_s.split('.')[1] || ''
    unless decimals == :all
      part_decimal = part_decimal[0,decimals]
      part_decimal += '0' while part_decimal.length < decimals
    end

    v = self.to_i
    ret = v.to_s.gsub(/(\d)(?=(\d{3})+$)/,'\1,')
    ret += '.' + part_decimal unless part_decimal.empty?
    ret
  end

end