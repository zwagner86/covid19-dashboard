import range from 'lodash/range';
import React, {useContext, useState} from 'react';
import moment from 'moment';
// import PropTypes from 'prop-types';
import {Paper, Tabs, Tab, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/styles';
import {MaterialTable} from '../../components';
import SettingsContext from '../../SettingsContext';
import TabPanel from './components/TabPanel';
import ProjectedCases from './components/charts/ProjectedCases';
import Risk from './components/charts/Risk';

const a11yProps = index => {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
};

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(3),
    },
    content: {
        marginTop: theme.spacing(2),
    },
    portfolioSummary: {
        paddingBottom: theme.spacing(5),
    },
    portfolioSummaryTypography: {
        paddingBottom: theme.spacing(1),
    },
    cardsAtRiskTypography: {
        paddingBottom: theme.spacing(1),
    },
    tabBar: {
        flexGrow: 1,
        maxWidth: 400,
        margin: '0 auto',
    },
}));

const Dashboard = props => {
    const classes = useStyles();
    const {
        settings: {
            doublingTime,
            population,
            exposure,
            startDate,
            numberOfDays,
            baseCases,
            multiplier,
            // cutoffRiskPerDay,
            // cutoffRiskCumulative,
        },
    } = useContext(SettingsContext);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const handleChange = (event, newIndex) => {
        setActiveTabIndex(newIndex);
    };
    const projectionData = [];
    const riskData = [];
    const projectionsChartData = {
        labels: [],
        datasets: [
            {
                label: 'Projected Cases',
                fill: false,
                lineTension: 0.1,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
            },
        ],
    };
    const risk1PlusChartData = {
        labels: [],
        datasets: [
            {
                label: 'Risk 1-Plus Encounters',
                fill: false,
                lineTension: 0.1,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
            },
        ],
    };
    const cumulativeRiskChartData = {
        labels: [],
        datasets: [
            {
                label: 'Cumulative Risk',
                fill: false,
                lineTension: 0.1,
                /* backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10, */
                data: [],
            },
        ],
    };

    for (const index of range(numberOfDays)) {
        // dates used for both projected and risk tables
        const dateMoment = moment(startDate).add(index, 'days');
        const date = dateMoment.format('MM/DD/YY');
        const dateWithDay = dateMoment.format('MM/DD/YY ddd');
        const dayOfWeek = dateMoment.format('dddd');
        // projected calculations
        const doublings = index / doublingTime;
        const reportedCases =
            index === 0 ? baseCases : Math.pow(2, doublings) * baseCases;
        const projectedCases = reportedCases * multiplier;
        const projectedCasesRounded = Math.round(projectedCases);
        const projectedRate = projectedCases / population;
        const projectedRatePercentage = `${(projectedRate * 100).toFixed(2)}%`;
        const projection = {
            date,
            dateWithDay,
            dayOfWeek,
            reportedCases,
            reportedCasesRounded: Math.round(reportedCases),
            projectedCases,
            projectedCasesRounded,
            projectedRate,
            projectedRatePercentage,
        };

        projectionData.push(projection);
        projectionsChartData.labels.push(date);
        projectionsChartData.datasets[0].data.push(projectedCasesRounded);

        const encountersPerDay = (projectedRate * exposure).toFixed(3);
        const risk1PlusEncounters = 1 - Math.pow(1 - projectedRate, exposure);
        const risk1PlusEncountersPercentage = `${(
            risk1PlusEncounters * 100
        ).toFixed(1)}%`;
        const cumulativeMiss =
            index === 0
                ? 1 - risk1PlusEncounters
                : (1 - risk1PlusEncounters) *
                  riskData[index - 1].cumulativeMiss;
        const cumulativeMissPercentage = `${(cumulativeMiss * 100).toFixed()}%`;
        const cumulativeRisk = 1 - cumulativeMiss;
        const cumulativeRiskPercentage = `${(cumulativeRisk * 100).toFixed()}%`;
        const risk = {
            date,
            dateWithDay,
            dayOfWeek,
            encountersPerDay,
            risk1PlusEncounters,
            risk1PlusEncountersPercentage,
            cumulativeMiss,
            cumulativeMissPercentage,
            cumulativeRisk,
            cumulativeRiskPercentage,
        };

        riskData.push(risk);
        risk1PlusChartData.labels.push(date);
        risk1PlusChartData.datasets[0].data.push(risk1PlusEncounters);
        cumulativeRiskChartData.labels.push(date);
        cumulativeRiskChartData.datasets[0].data.push(cumulativeRisk);
    }

    return (
        <div className={classes.root}>
            <Paper className={classes.tabBar} square>
                <Tabs
                    value={activeTabIndex}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleChange}
                    centered
                >
                    <Tab label="Projections" {...a11yProps(0)} />
                    <Tab label="Risk" {...a11yProps(1)} />
                </Tabs>
            </Paper>
            <TabPanel value={activeTabIndex} index={0}>
                <Typography
                    className={classes.cardsAtRiskTypography}
                    component="h3"
                    variant="h3"
                    color="textPrimary"
                    gutterBottom
                >
                    Projections
                </Typography>
                <MaterialTable
                    title="Projections"
                    columns={[
                        {title: 'Date', field: 'dateWithDay', type: 'date'},
                        {
                            title: 'Reported Cases',
                            field: 'reportedCasesRounded',
                            type: 'numeric',
                        },
                        {
                            title: 'Projected Cases',
                            field: 'projectedCasesRounded',
                            type: 'numeric',
                        },
                        {
                            title: 'Projected Rate',
                            field: 'projectedRatePercentage',
                            type: 'numeric',
                        },
                    ]}
                    data={projectionData}
                    options={{
                        showTitle: false,
                        sorting: false,
                        search: false,
                        draggable: false,
                        exportButton: true,
                    }}
                />
                <ProjectedCases chartData={projectionsChartData} />
            </TabPanel>
            <TabPanel value={activeTabIndex} index={1}>
                <Typography
                    className={classes.cardsAtRiskTypography}
                    component="h3"
                    variant="h3"
                    color="textPrimary"
                    gutterBottom
                >
                    Risk
                </Typography>
                <MaterialTable
                    title="Risk"
                    columns={[
                        {title: 'Date', field: 'dateWithDay', type: 'date'},
                        {
                            title: 'Encounters Per Day',
                            field: 'encountersPerDay',
                            type: 'numeric',
                        },
                        {
                            title: 'Risk of 1+ Encounters',
                            field: 'risk1PlusEncountersPercentage',
                            type: 'numeric',
                        },
                        {
                            title: 'Cumulative Miss',
                            field: 'cumulativeMissPercentage',
                            type: 'numeric',
                        },
                        {
                            title: 'Cumulative Risk',
                            field: 'cumulativeRiskPercentage',
                            type: 'numeric',
                        },
                    ]}
                    data={riskData}
                    options={{
                        showTitle: false,
                        sorting: false,
                        search: false,
                        draggable: false,
                        exportButton: true,
                    }}
                />
                <Risk
                    title="Risk 1-Plus Encounters"
                    type="1plus"
                    chartData={risk1PlusChartData}
                />
                <Risk
                    title="Cumulative Risk"
                    type="cumulative"
                    chartData={cumulativeRiskChartData}
                />
            </TabPanel>
            {false && (
                <div className={classes.content}>
                    <div>
                        <Typography
                            className={classes.cardsAtRiskTypography}
                            component="h3"
                            variant="h3"
                            color="textPrimary"
                            gutterBottom
                        >
                            Projections
                        </Typography>
                        <MaterialTable
                            title="Projections"
                            columns={[
                                {title: 'Date', field: 'date', type: 'date'},
                                {title: 'Day of Week', field: 'dayOfWeek'},
                                {
                                    title: 'Reported Cases',
                                    field: 'reportedCasesRounded',
                                    type: 'numeric',
                                },
                                {
                                    title: 'Projected Cases',
                                    field: 'projectedCasesRounded',
                                    type: 'numeric',
                                },
                                {
                                    title: 'Projected Rate',
                                    field: 'projectedRatePercentage',
                                    type: 'numeric',
                                },
                            ]}
                            data={projectionData}
                            options={{
                                showTitle: false,
                                sorting: false,
                                search: false,
                                paging: false,
                                draggable: false,
                                exportButton: true,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

Dashboard.propTypes = {};

Dashboard.defaultProps = {};

export default Dashboard;
