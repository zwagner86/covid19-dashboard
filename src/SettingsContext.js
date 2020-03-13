import React from 'react';

const SettingsContext = React.createContext({
    doublingTime: 3,
    population: 9500000,
    exposure: 100,
    startDate: '2020-03-06',
    baseCases: 5,
    multiplier: 5,
    cutoffRiskPerDay: 5.0,
    cutoffRiskCumulative: 10.0,
});

export const SettingsProvider = SettingsContext.Provider;
export const SettingsConsumer = SettingsContext.Consumer;
export default SettingsContext;
