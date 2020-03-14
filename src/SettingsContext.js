import React from 'react';
import moment from 'moment';

const initialSettings = {
    doublingTime: 3,
    population: 9500000,
    exposure: 100,
    startDate: moment('2020-03-06'),
    baseCases: 5,
    multiplier: 5,
    cutoffRiskPerDay: 5.0,
    cutoffRiskCumulative: 10.0,
};

const SettingsContext = React.createContext({
    settings: initialSettings,
    setSettings: () => {
        return initialSettings;
    },
});

export const SettingsProvider = SettingsContext.Provider;
export const SettingsConsumer = SettingsContext.Consumer;
export default SettingsContext;