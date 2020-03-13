import React from 'react';
import {Chart} from 'react-chartjs-2';
import {ThemeProvider} from '@material-ui/styles';

import {chartjs} from './helpers';
import theme from './theme';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './App.scss';

import {Main as MainLayout} from './layouts';
import Dashboard from './views/Dashboard/Dashboard';

Chart.helpers.extend(Chart.elements.Rectangle.prototype, {
    draw: chartjs.draw,
});

const App = props => {
    return (
        <ThemeProvider theme={theme}>
            <MainLayout>
                <Dashboard />
            </MainLayout>
        </ThemeProvider>
    );
};

export default App;
