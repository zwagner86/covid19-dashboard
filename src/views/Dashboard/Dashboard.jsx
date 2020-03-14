import range from 'lodash/range';
import React, {useContext, useState} from 'react';
import moment from 'moment';
// import PropTypes from 'prop-types';
import {Paper, Tabs, Tab, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/styles';
import {MaterialTable} from '../../components';
import SettingsContext from '../../SettingsContext';
import TabPanel from './components/TabPanel';

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
}));

const Dashboard = props => {
    const classes = useStyles();
    const {
        settings: {
            doublingTime,
            population,
            exposure,
            startDate,
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

    for (const index of range(50)) {
        // dates used for both projected and risk tables
        const dateMoment = moment(startDate).add(index, 'days');
        const date = dateMoment.format('MM-DD-YYYY');
        const dayOfWeek = dateMoment.format('dddd');
        // projected calculations
        const doublings = index / doublingTime;
        const reportedCases =
            index === 0 ? baseCases : Math.pow(2, doublings) * baseCases;
        const projectedCases = reportedCases * multiplier;
        const projectedRate = projectedCases / population;
        const projectedRatePercentage = `${(projectedRate * 100).toFixed(2)}%`;
        const projection = {
            date,
            dayOfWeek,
            reportedCases,
            reportedCasesRounded: Math.round(reportedCases),
            projectedCases,
            projectedCasesRounded: Math.round(projectedCases),
            projectedRate,
            projectedRatePercentage,
        };

        projectionData.push(projection);

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
    }

    return (
        <div className={classes.root}>
            <Paper square>
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
                        {title: 'Date', field: 'date', type: 'date'},
                        {title: 'Day of Week', field: 'dayOfWeek'},
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
                        paging: false,
                        draggable: false,
                        exportButton: true,
                    }}
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
