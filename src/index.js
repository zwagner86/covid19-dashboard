import 'core-js/stable';
import 'regenerator-runtime/runtime';
import get from 'lodash/get';
import keys from 'lodash/keys';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import React from 'react';
import {render} from 'react-dom';
import moment from 'moment';
import queryString from 'query-string';
import {Chart} from 'react-chartjs-2';
import axios from 'axios';
import {chartjs} from './helpers';
import DataUtils from './utils/data';
import StorageUtils from './utils/storage';
import App from './App';
import './index.scss';

Chart.helpers.extend(Chart.elements.Rectangle.prototype, {
    draw: chartjs.draw,
});

const isProduction = process.env.NODE_ENV === 'production';

const API = axios.create({
    baseURL: isProduction
        ? 'https://corona-model-proxy.herokuapp.com/'
        : 'http://coronamodel.com/standalone/covid19-dashboard/',
});

const renderApp = loadingError => {
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
        populationType = 'country',
        populationCode = 'USA',
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

    let populationData = DataUtils.getDataByPopTypeAndCode({
        type: populationType,
        code: populationCode,
        fromFirstCase: true,
    });

    if (!populationData) {
        populationData = DataUtils.getRandomPopTypeData({
            type: populationType,
            fromFirstCase: true,
        });
    }

    const startDateMoment = startDate
        ? moment(startDate)
        : populationData
        ? moment(populationData.dailyData[0].date)
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
        doublingTime: doublingTime || get(populationData, 'doublingTime', 2.3),
        populationType: populationData?.type,
        populationCode: populationData?.code,
        populationObj: {
            type: populationData?.type,
            code: populationData?.code,
        },
        population: population || populationData?.population || 1000000,
        exposure,
        startDate: startDateMoment,
        numberOfDays,
        baseCases:
            baseCases || populationData
                ? populationData.dailyData[0]?.positive
                : 5,
        multiplier,
        cutoffRiskPerDay: riskPerDay,
        cutoffRiskCumulative: cumRisk,
        hospitalizationRate: hospRate,
        fatalityRate,
        hospitalizationDelayInDays: hospDelay,
        hospitalizationStayInDays: hospStay,
        hospitalBeds: hospBeds || populationData?.beds || 15000,
    };

    render(
        <App
            initialSettings={initialSettings}
            loadingError={loadingError}
            disableForm={disableForm}
            hideForm={hideForm}
        />,
        document.getElementById('root')
    );
};

const sortDataByKey = data => {
    return sortBy(data, ['key']);
};

// fetch all data
const getCountryData = async () => {
    try {
        const response = await API.get(
            `country${!isProduction ? '.json' : ''}`
        );

        return response.data;
    } catch (error) {
        return [];
    }
};

const getStateData = async () => {
    try {
        const response = await API.get(
            `us_state${!isProduction ? '.json' : ''}`
        );

        return response.data;
    } catch (error) {
        return [];
    }
};

const getMetroData = async () => {
    try {
        const response = await API.get(
            `us_metro${!isProduction ? '.json' : ''}`
        );

        return response.data;
    } catch (error) {
        return [];
    }
};

const getAllData = async () => {
    let loadingError = false;

    try {
        const [countries, states, metros] = await Promise.all([
            getCountryData(),
            getStateData(),
            getMetroData(),
        ]);

        const countryData = map(countries, (country, key) => {
            const {
                code,
                name,
                population,
                beds,
                doublings: {positive: positiveDoublings},
                dailyData,
            } = country;
            const doublingDateKeys = keys(positiveDoublings);
            const sortedKeys = doublingDateKeys.sort((a, b) =>
                moment(b).diff(moment(a))
            );
            /* eslint-disable camelcase */
            const doublingTime =
                country.doublings.positive?.[sortedKeys[0]]?.doubling_time;
            /* eslint-enable camelcase */

            return {
                type: 'country',
                key,
                code: code || name,
                name,
                population,
                beds,
                doublingTime,
                dailyData,
            };
        });

        const stateData = map(states, (state, key) => {
            const {
                code,
                name,
                population,
                beds,
                doublings: {positive: positiveDoublings},
                dailyData,
            } = state;
            const doublingDateKeys = keys(positiveDoublings);
            const sortedKeys = doublingDateKeys.sort((a, b) =>
                moment(b).diff(moment(a))
            );
            /* eslint-disable camelcase */
            const doublingTime =
                state.doublings.positive?.[sortedKeys[0]]?.doubling_time;
            /* eslint-enable camelcase */

            return {
                type: 'state',
                key,
                code: code || name,
                name,
                population,
                beds,
                doublingTime,
                dailyData,
            };
        });

        const metroData = map(metros, (metro, key) => {
            const {
                code,
                name,
                population,
                beds,
                doublings: {positive: positiveDoublings},
                dailyData,
            } = metro;
            const doublingDateKeys = keys(positiveDoublings);
            const sortedKeys = doublingDateKeys.sort((a, b) =>
                moment(b).diff(moment(a))
            );
            /* eslint-disable camelcase */
            const doublingTime =
                metro.doublings.positive?.[sortedKeys[0]]?.doubling_time;
            /* eslint-enable camelcase */

            return {
                type: 'metro',
                key,
                code: code || name,
                name,
                population,
                beds,
                doublingTime,
                dailyData,
            };
        });

        StorageUtils.set('countryData', sortDataByKey(countryData), 'session');
        StorageUtils.set('stateData', sortDataByKey(stateData), 'session');
        StorageUtils.set('metroData', sortDataByKey(metroData), 'session');
    } catch (error) {
        console.log('guess i failed');
        console.log(error);
        loadingError = true;
    } finally {
        renderApp(loadingError);
    }
};

getAllData();
