import find from 'lodash/find';
import get from 'lodash/get';
import React, {useState} from 'react';
import moment from 'moment';
import queryString from 'query-string';
import {Chart} from 'react-chartjs-2';
import CssBaseline from '@material-ui/core/CssBaseline';
import {ThemeProvider} from '@material-ui/styles';

import {chartjs} from './helpers';
import theme from './theme';
// import regions from './data/regions';
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
    doublingTime,
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
const regionsToSearch = RegionUtils.getRegionsGroupedByType(
    countryCode.toLowerCase() || 'usa'
);
// const regionsToSearch = regions[countryCode.toLowerCase()] || regions.usa;
const popsToSearch = [
    ...regionsToSearch.country,
    ...regionsToSearch.region,
    ...regionsToSearch.state,
];
const region = find(popsToSearch, {code: regionCode}) || popsToSearch[0];
/* const initialRegionData = RegionUtils.getRegionInfoByKey({
    countryCode,
    regionKey: region.key,
    fromFirstCase: true,
}); */
const sortedRegionDailyData = RegionUtils.sortRegionDailyDataByDate(
    region,
    true
);
const startDateMoment = startDate
    ? moment(startDate)
    : sortedRegionDailyData
    ? moment(sortedRegionDailyData[0].date)
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
    doublingTime: doublingTime || get(region, 'doublings.positive[0].dt', 2.3),
    countryCode,
    regionKey: region.code,
    population: population || region.population || 1000000,
    exposure,
    startDate: startDateMoment,
    numberOfDays,
    baseCases:
        baseCases || sortedRegionDailyData
            ? sortedRegionDailyData[0].positive
            : 5,
    multiplier,
    cutoffRiskPerDay: riskPerDay,
    cutoffRiskCumulative: cumRisk,
    hospitalizationRate: hospRate,
    fatalityRate,
    hospitalizationDelayInDays: hospDelay,
    hospitalizationStayInDays: hospStay,
    hospitalBeds: hospBeds || region.beds || 15000,
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
