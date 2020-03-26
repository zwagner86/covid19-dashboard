import find from 'lodash/find';
import range from 'lodash/range';
import React, {Fragment, useContext, useState} from 'react';
import moment from 'moment';
import {colors, Grid, Paper, Tabs, Tab} from '@material-ui/core';
import {makeStyles} from '@material-ui/styles';
import StatesUtils from '../../utils/states';
import {MaterialTable} from '../../components';
import SettingsContext from '../../SettingsContext';
import TabPanel from './components/TabPanel';
import ProjectedCases from './components/charts/ProjectedCases';
import Risk from './components/charts/Risk';
import HospitalBeds from './components/charts/HospitalBeds';

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
        maxWidth: 600,
        margin: '0 auto',
    },
}));

const Dashboard = props => {
    const classes = useStyles();
    const {
        settings: {
            onlyCase,
            onlyRisk,
            onlyCharts,
            onlyTables,
            hideHospitalChart,
            defaultChartScale,
            doublingTime,
            stateKey,
            population,
            exposure,
            startDate,
            numberOfDays,
            baseCases,
            multiplier,
            cutoffRiskPerDay,
            cutoffRiskCumulative,
            hospitalizationRate,
            // fatalityRate,
            hospitalizationDelayInDays,
            hospitalizationStayInDays,
            hospitalBeds,
        },
    } = useContext(SettingsContext);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const stateData = StatesUtils.getStateInfoByKey(stateKey);
    const handleChange = (event, newIndex) => {
        setActiveTabIndex(newIndex);
    };
    // display conditions
    const displayCasesTab = onlyCase || !onlyRisk;
    const displayRiskTab = onlyRisk || !onlyCase;
    const displayCharts = onlyCharts || !onlyTables;
    const displayTables = onlyTables || !onlyCharts;
    const caseTableColumns = [
        {
            title: 'Date',
            field: 'dateWithDay',
            type: 'date',
        },
        {
            title: 'Reported Cases',
            field: 'reportedCasesRounded',
            type: 'numeric',
            tooltip: 'Estimate of number of CDC reported cases.',
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
    ];
    const projectionData = [];
    const riskData = [];
    const hospitalizationData = [];
    const projectionsChartLabels = [];
    const projectionsChartData = [];
    const cdcChartData = [];
    const risk1PlusChartLabels = [];
    const risk1PlusChartData = [];
    const cumulativeRiskChartLabels = [];
    const cumulativeRiskChartData = [];
    const hospitalBedsChartLabels = [];
    const hospitalBedsChartData = [];

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

        if (stateData) {
            const cdcData = find(stateData, {
                date: dateMoment.format('YYYY-MM-DD'),
            });
            /* eslint-disable no-undefined */
            const cases = cdcData ? cdcData.cases : undefined;
            const casesScaled = cdcData ? cases * multiplier : undefined;
            /* eslint-enable no-undefined */

            projection.cdcCases = cases;
            projection.cdcCasesScaled = casesScaled;

            cdcChartData.push(casesScaled);
        }

        projectionData.push(projection);
        projectionsChartLabels.push(date);
        projectionsChartData.push(projectedCasesRounded);

        // risk calculations
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
        risk1PlusChartLabels.push(date);
        risk1PlusChartData.push(risk1PlusEncounters);
        cumulativeRiskChartLabels.push(date);
        cumulativeRiskChartData.push(cumulativeRisk);

        // hospital calculations
        const hospitalizationRateDecimal = hospitalizationRate / 100;
        const enteredHospital =
            index < hospitalizationDelayInDays
                ? 0
                : Math.round(
                      hospitalizationRateDecimal *
                          projectionData[index - hospitalizationDelayInDays]
                              .projectedCasesRounded
                  );
        const leftHospital =
            index < hospitalizationStayInDays
                ? 0
                : Math.round(
                      hospitalizationData[index - hospitalizationStayInDays]
                          .enteredHospital
                  );
        const netBeds = enteredHospital - leftHospital;
        const hospital = {
            date,
            dateWithDay,
            dayOfWeek,
            enteredHospital,
            leftHospital,
            netBeds,
        };

        hospitalizationData.push(hospital);
        hospitalBedsChartLabels.push(date);
        hospitalBedsChartData.push(netBeds);
    }

    if (stateData) {
        caseTableColumns.push({
            title: 'CDC Reported Cases',
            field: 'cdcCases',
            type: 'numeric',
            tooltip: 'The number of cases reported by the CDC',
        });
        caseTableColumns.push({
            title: 'CDC Scaled Cases',
            field: 'cdcCasesScaled',
            type: 'numeric',
            tooltip:
                'The number of reported CDC cases scaled by the multiplier',
        });
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
                    {displayCasesTab && <Tab label="Cases" {...a11yProps(0)} />}
                    {displayRiskTab && <Tab label="Risk" {...a11yProps(1)} />}
                </Tabs>
            </Paper>
            {displayCasesTab && (
                <TabPanel value={activeTabIndex} index={0}>
                    <Grid container spacing={4}>
                        {displayTables && (
                            <Fragment>
                                <Grid item xs={12}>
                                    <MaterialTable
                                        title="Cases"
                                        columns={caseTableColumns}
                                        data={projectionData}
                                        options={{
                                            sorting: false,
                                            search: false,
                                            draggable: false,
                                            exportButton: true,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <MaterialTable
                                        title="Hospitalizations"
                                        columns={[
                                            {
                                                title: 'Date',
                                                field: 'dateWithDay',
                                                type: 'date',
                                            },
                                            {
                                                title: 'Entered Hospital',
                                                field: 'enteredHospital',
                                                type: 'numeric',
                                                tooltip:
                                                    'Estimated number of hospitalized patients.',
                                            },
                                            {
                                                title: 'Left Hospital',
                                                field: 'leftHospital',
                                                type: 'numeric',
                                                tooltip:
                                                    'Estimated number of patients who left hospital.',
                                            },
                                            {
                                                title: 'Occupied Beds',
                                                field: 'netBeds',
                                                type: 'numeric',
                                                tooltip:
                                                    'The number of occupied hospital beds.',
                                            },
                                        ]}
                                        data={hospitalizationData}
                                        options={{
                                            sorting: false,
                                            search: false,
                                            draggable: false,
                                            exportButton: true,
                                        }}
                                    />
                                </Grid>
                            </Fragment>
                        )}
                        {displayCharts && (
                            <Fragment>
                                <Grid
                                    item
                                    xs={12}
                                    md={hideHospitalChart ? 12 : 6}
                                >
                                    <ProjectedCases
                                        chartLabels={projectionsChartLabels}
                                        projectionsData={projectionsChartData}
                                        cdcData={cdcChartData}
                                        population={population}
                                        defaultChartScale={defaultChartScale}
                                    />
                                </Grid>
                                {!hideHospitalChart && (
                                    <Grid item xs={12} md={6}>
                                        <HospitalBeds
                                            title="Occupied Hospital Beds"
                                            chartLabels={
                                                hospitalBedsChartLabels
                                            }
                                            chartData={hospitalBedsChartData}
                                            hospitalBedCapacity={hospitalBeds}
                                            defaultChartScale={
                                                defaultChartScale
                                            }
                                        />
                                    </Grid>
                                )}
                            </Fragment>
                        )}
                    </Grid>
                </TabPanel>
            )}
            {displayRiskTab && (
                <TabPanel value={activeTabIndex} index={1}>
                    <Grid container spacing={4}>
                        {displayTables && (
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
                                            field:
                                                'risk1PlusEncountersPercentage',
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
                                        sorting: false,
                                        search: false,
                                        draggable: false,
                                        exportButton: true,
                                    }}
                                />
                            </Grid>
                        )}
                        {displayCharts && (
                            <Fragment>
                                <Grid item xs={12} md={6}>
                                    <Risk
                                        title="Risk 1-Plus Encounters"
                                        type="1plus"
                                        chartLabels={risk1PlusChartLabels}
                                        chartData={risk1PlusChartData}
                                        worryLevel={cutoffRiskPerDay}
                                        defaultChartScale={defaultChartScale}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Risk
                                        title="Cumulative Risk"
                                        type="cumulative"
                                        chartLabels={cumulativeRiskChartLabels}
                                        chartData={cumulativeRiskChartData}
                                        worryLevel={cutoffRiskCumulative}
                                        defaultChartScale={defaultChartScale}
                                    />
                                </Grid>
                            </Fragment>
                        )}
                    </Grid>
                </TabPanel>
            )}
        </div>
    );
};

Dashboard.propTypes = {};

Dashboard.defaultProps = {};

export default Dashboard;
