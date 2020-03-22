import React from 'react';
import moment from 'moment';
import metros from './data/metros';

const startDate = moment('2020-03-06');

const initialSettings = {
    doublingTime: 2.3,
    metroKey: metros[0].key,
    population: metros[0].population,
    exposure: 100,
    startDate,
    numberOfDays: 30,
    baseCases: 5,
    multiplier: 5,
    cutoffRiskPerDay: 5.0,
    cutoffRiskCumulative: 10.0,
    hospitalizationRate: 10.0,
    fatalityRate: 2.0,
    hospitalizationDelayInDays: 9,
    hospitalizationStayInDays: 10,
    hospitalBeds: 33000,
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
