import React from 'react';
import moment from 'moment';

const startDate = moment('2020-03-06');

const initialSettings = {
    onlyCase: false,
    onlyRisk: false,
    onlyCharts: false,
    onlyTables: false,
    hideHospitalChart: false,
    defaultChartScale: 'linear',
    doublingTime: 2.3,
    populationType: 'country',
    populationCode: 'USA',
    population: 1000000,
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
