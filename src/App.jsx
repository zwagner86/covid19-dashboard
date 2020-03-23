import find from 'lodash/find';
import React, {useState} from 'react';
import moment from 'moment';
import queryString from 'query-string';
import {Chart} from 'react-chartjs-2';
import CssBaseline from '@material-ui/core/CssBaseline';
import {ThemeProvider} from '@material-ui/styles';

import {chartjs} from './helpers';
import theme from './theme';
import states from './data/regions/usa/states';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './App.scss';

import {SettingsProvider} from './SettingsContext';
import {Main as MainLayout} from './layouts';
import Dashboard from './views/Dashboard/Dashboard';
import StatesUtils from './utils/states';

Chart.helpers.extend(Chart.elements.Rectangle.prototype, {
    draw: chartjs.draw,
});

// TODO: support parameters
/*
disableForm - disables form
onlyCase - only show case model
onlyRisk - only show risk model
onlyCharts - only show charts
onlyTables - only show tables

// settings
doublingTime
country
state
population
exposure
startDate
numberOfDays
baseCases
multiplier
riskPerDay
cumRisk
hospRate
fatalityRate
hospDelay
hospStay
hospBeds

// add lastDate - then configure number of days from start date
*/

const {
    disableForm,
    onlyCase,
    onlyRisk,
    onlyCharts,
    onlyTables,
    doublingTime = 2.3,
    countryCode = 'USA',
    stateCode = 'IL',
    population,
    exposure = 100,
    startDate,
    lastDate,
    numDays = 30,
    baseCases,
    multiplier = 5,
    riskPerDay = 5,
    cumRisk = 10,
    hospRate = 10,
    fatalityRate = 2,
    hospDelay = 9,
    hospStay = 10,
    hospBeds = 33000,
} = queryString.parse(location.search, {
    parseBooleans: true,
    parseNumbers: true,
});
// TODO: expand on this when other countries are supported
const statesToSearch = countryCode.toUpperCase() === 'USA' ? states : states;
const state = find(statesToSearch, {key: stateCode}) || statesToSearch[0];
const initialStateData = StatesUtils.getStateInfoByKey(state.key);
const startDateMoment = startDate
    ? moment(startDate)
    : initialStateData
    ? moment(initialStateData[0].date)
    : moment().subtract(7, 'days');
const lastDateMoment = lastDate
    ? moment(lastDate)
    : moment(startDateMoment).add(numDays, 'days');
const numberOfDays = lastDateMoment.diff(startDateMoment, 'days');

const initialSettings = {
    onlyCase,
    onlyRisk,
    onlyCharts,
    onlyTables,
    doublingTime: doublingTime || 2.3,
    countryCode,
    stateKey: state.key,
    population: population || state.population || 1000000,
    exposure,
    startDate: startDateMoment,
    numberOfDays,
    baseCases: baseCases || initialStateData ? initialStateData[0].cases : 5,
    multiplier,
    cutoffRiskPerDay: riskPerDay,
    cutoffRiskCumulative: cumRisk,
    hospitalizationRate: hospRate,
    fatalityRate,
    hospitalizationDelayInDays: hospDelay,
    hospitalizationStayInDays: hospStay,
    hospitalBeds: hospBeds,
};

const App = props => {
    const [settings, setSettings] = useState(initialSettings);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SettingsProvider value={{settings, setSettings}}>
                <MainLayout disableForm={disableForm}>
                    <Dashboard />
                </MainLayout>
            </SettingsProvider>
        </ThemeProvider>
    );
};

export default App;
