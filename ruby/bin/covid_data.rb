#!/usr/bin/env ruby

require 'covid_data'

# commands
#   update - update the data for the web portal
#   stats group-section*

c = CovidData.new
c.us_state_save
c.us_metro_save
