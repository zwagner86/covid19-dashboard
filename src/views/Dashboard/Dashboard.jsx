import range from 'lodash/range';
import React, {useContext, useState} from 'react';
import moment from 'moment';
import {colors, Grid, Paper, Tabs, Tab, Typography} from '@material-ui/core';
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
            cutoffRiskPerDay,
            cutoffRiskCumulative,
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
                fill: true,
                lineTension: 0.1,
                borderColor: colors.blue[600],
                pointBorderColor: colors.blue[600],
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: colors.blue[600],
                pointHoverBorderColor: colors.grey[50],
                pointHoverBorderWidth: 2,
                pointRadius: 4,
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
                fill: true,
                lineTension: 0.1,
                borderColor: colors.blue[600],
                pointBorderColor: colors.blue[600],
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: colors.blue[600],
                pointHoverBorderColor: colors.grey[50],
                pointHoverBorderWidth: 2,
                pointRadius: 4,
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
                fill: true,
                lineTension: 0.1,
                borderColor: colors.orange[800],
                pointBorderColor: colors.orange[800],
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: colors.orange[800],
                pointHoverBorderColor: colors.grey[50],
                pointHoverBorderWidth: 2,
                pointRadius: 4,
                pointHitRadius: 10,
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
        const risk1PlusEncountersAsPercent = risk1PlusEncounters * 100;
        const risk1PlusEncountersPercentage = `${risk1PlusEncountersAsPercent.toFixed(
            1
        )}%`;
        const cumulativeMiss =
            index === 0
                ? 1 - risk1PlusEncounters
                : (1 - risk1PlusEncounters) *
                  riskData[index - 1].cumulativeMiss;
        const cumulativeMissPercentage = `${(cumulativeMiss * 100).toFixed(
            1
        )}%`;
        const cumulativeRisk = 1 - cumulativeMiss;
        const cumulativeRiskAsPercent = cumulativeRisk * 100;
        const cumulativeRiskPercentage = `${cumulativeRiskAsPercent.toFixed(
            1
        )}%`;
        const risk = {
            date,
            dateWithDay,
            dayOfWeek,
            encountersPerDay,
            risk1PlusEncounters,
            risk1PlusEncountersAsPercent,
            risk1PlusEncountersPercentage,
            cumulativeMiss,
            cumulativeMissPercentage,
            cumulativeRisk,
            cumulativeRiskAsPercent,
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
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <MaterialTable
                            title="Projections"
                            columns={[
                                {
                                    title: 'Date',
                                    field: 'dateWithDay',
                                    type: 'date',
                                },
                                {
                                    title: 'Reported Cases',
                                    field: 'reportedCasesRounded',
                                    type: 'numeric',
                                    tooltip:
                                        'Estimate of number of CDC reported cases.',
                                },
                                {
                                    title: 'Projected Cases',
                                    field: 'projectedCasesRounded',
                                    type: 'numeric',
                                    tooltip:
                                        'The true amount of cases.  Projected Cases = Reported Cases x Multiplier.',
                                },
                                {
                                    title: 'Projected Rate',
                                    field: 'projectedRatePercentage',
                                    type: 'numeric',
                                    tooltip:
                                        'The percentage of those infected.  Projected Rate = Projected Cases / Population.',
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
                    </Grid>
                    <Grid item xs={12}>
                        <ProjectedCases chartData={projectionsChartData} />
                    </Grid>
                </Grid>
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
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <MaterialTable
                            title="Risk"
                            columns={[
                                {
                                    title: 'Date',
                                    field: 'dateWithDay',
                                    type: 'date',
                                },
                                {
                                    title: 'Encounters Per Day',
                                    field: 'encountersPerDay',
                                    type: 'numeric',
                                    tooltip:
                                        'Expected amount of infected people met in a single day.',
                                },
                                {
                                    title: 'Risk of 1+ Encounters',
                                    field: 'risk1PlusEncountersPercentage',
                                    type: 'numeric',
                                    cellStyle: (value, rowData) => {
                                        const {
                                            risk1PlusEncountersAsPercent,
                                        } = rowData;

                                        return {
                                            color:
                                                risk1PlusEncountersAsPercent >
                                                cutoffRiskPerDay
                                                    ? colors.red[700]
                                                    : 'inherit',
                                        };
                                    },
                                    tooltip:
                                        'For date in row, chance of meeting at least one infected person this date.',
                                },
                                {
                                    title: 'Cumulative Miss',
                                    field: 'cumulativeMissPercentage',
                                    type: 'numeric',
                                    tooltip:
                                        'For date in row, the chance of not meeting an infected person up to this date.',
                                },
                                {
                                    title: 'Cumulative Risk',
                                    field: 'cumulativeRiskPercentage',
                                    type: 'numeric',
                                    cellStyle: (value, rowData) => {
                                        const {
                                            cumulativeRiskAsPercent,
                                        } = rowData;

                                        return {
                                            color:
                                                cumulativeRiskAsPercent >
                                                cutoffRiskCumulative
                                                    ? colors.red[700]
                                                    : 'inherit',
                                        };
                                    },
                                    tooltip:
                                        'For date in row, the chance of meeting at least one infected person by this date.',
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
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Risk
                            title="Risk 1-Plus Encounters"
                            type="1plus"
                            chartData={risk1PlusChartData}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Risk
                            title="Cumulative Risk"
                            type="cumulative"
                            chartData={cumulativeRiskChartData}
                        />
                    </Grid>
                </Grid>
            </TabPanel>
        </div>
    );
};

Dashboard.propTypes = {};

Dashboard.defaultProps = {};

export default Dashboard;
