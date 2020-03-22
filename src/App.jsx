import find from 'lodash/find';
import React, {useState} from 'react';
import moment from 'moment';
import queryString from 'query-string';
import {Chart} from 'react-chartjs-2';
import {ThemeProvider} from '@material-ui/styles';

import {chartjs} from './helpers';
import theme from './theme';
import metros from './data/metros';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './App.scss';

import {SettingsProvider} from './SettingsContext';
import {Main as MainLayout} from './layouts';
import Dashboard from './views/Dashboard/Dashboard';

Chart.helpers.extend(Chart.elements.Rectangle.prototype, {
    draw: chartjs.draw,
});

const {disableForm, metro: metroName} = queryString.parse(location.search, {
    parseBooleans: true,
});
const metro = find(metros, {key: metroName}) || metros[0];
const startDate = moment('2020-03-06');

const initialSettings = {
    doublingTime: 2.3,
    metroKey: metro.key,
    population: metro.population,
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

const App = props => {
    const [settings, setSettings] = useState(initialSettings);

    return (
        <ThemeProvider theme={theme}>
            <SettingsProvider value={{settings, setSettings}}>
                <MainLayout disableForm={disableForm}>
                    <Dashboard />
                </MainLayout>
            </SettingsProvider>
        </ThemeProvider>
    );
};

export default App;
