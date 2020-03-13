import React from 'react';
import {Chart} from 'react-chartjs-2';
import {ThemeProvider} from '@material-ui/styles';

import {chartjs} from './helpers';
import theme from './theme';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './App.scss';

import {SettingsProvider} from './SettingsContext';
import {Main as MainLayout} from './layouts';
import Dashboard from './views/Dashboard/Dashboard';

Chart.helpers.extend(Chart.elements.Rectangle.prototype, {
    draw: chartjs.draw,
});

const settings = {
    doublingTime: 3,
    population: 9500000,
    exposure: 100,
    startDate: '2020-03-06',
    baseCases: 5,
    multiplier: 5,
    cutoffRiskPerDay: 5.0,
    cutoffRiskCumulative: 10.0,
};

const App = props => {
    return (
        <ThemeProvider theme={theme}>
            <SettingsProvider value={settings}>
                <MainLayout>
                    <Dashboard />
                </MainLayout>
            </SettingsProvider>
        </ThemeProvider>
    );
};

export default App;
