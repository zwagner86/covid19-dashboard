import find from 'lodash/find';
import React, {useState} from 'react';
import moment from 'moment';
import queryString from 'query-string';
import {Chart} from 'react-chartjs-2';
import CssBaseline from '@material-ui/core/CssBaseline';
import {ThemeProvider} from '@material-ui/styles';

import {chartjs} from './helpers';
import theme from './theme';
import regions from './data/regions';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './App.scss';

import {SettingsProvider} from './SettingsContext';
import {Main as MainLayout} from './layouts';
import Dashboard from './views/Dashboard/Dashboard';
import RegionUtils from './utils/region';

Chart.helpers.extend(Chart.elements.Rectangle.prototype, {
    draw: chartjs.draw,
});

const {
    disableForm,
    hideForm,
    onlyCase,
    onlyRisk,
    onlyCharts,
    onlyTables,
    hideHospitalChart,
    defaultChartScale = 'linear',
    doublingTime = 2.3,
    countryCode = 'usa',
    regionCode = 'IL',
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
    hospBeds,
} = queryString.parse(location.search, {
    parseBooleans: true,
    parseNumbers: true,
});
// TODO: expand on this when other countries are supported
const regionsToSearch = regions[countryCode.toLowerCase()] || regions.usa;
const popsToSearch = [
    ...regionsToSearch.country,
    ...regionsToSearch.regions,
    ...regionsToSearch.states,
];
const region = find(popsToSearch, {key: regionCode}) || popsToSearch[0];
const initialRegionData = RegionUtils.getRegionInfoByKey({
    countryCode,
    regionKey: region.key,
    fromFirstCase: true,
});
const startDateMoment = startDate
    ? moment(startDate)
    : initialRegionData
    ? moment(initialRegionData[0].date)
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
    hideHospitalChart,
    defaultChartScale,
    doublingTime: doublingTime || 2.3,
    countryCode,
    regionKey: region.key,
    population: population || region.population || 1000000,
    exposure,
    startDate: startDateMoment,
    numberOfDays,
    baseCases: baseCases || initialRegionData ? initialRegionData[0].cases : 5,
    multiplier,
    cutoffRiskPerDay: riskPerDay,
    cutoffRiskCumulative: cumRisk,
    hospitalizationRate: hospRate,
    fatalityRate,
    hospitalizationDelayInDays: hospDelay,
    hospitalizationStayInDays: hospStay,
    hospitalBeds: hospBeds || region.hospitalBeds || 15000,
};

const App = props => {
    const [settings, setSettings] = useState(initialSettings);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SettingsProvider value={{settings, setSettings}}>
                <MainLayout disableForm={disableForm} hideForm={hideForm}>
                    <Dashboard />
                </MainLayout>
            </SettingsProvider>
        </ThemeProvider>
    );
};

export default App;
