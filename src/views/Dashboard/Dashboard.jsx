import React from 'react';
// import PropTypes from 'prop-types';
import {Grid, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/styles';
import {MaterialTable} from '../../components';
import CardSummary from './components/CardSummary';
import {generateTableRows} from './fakeFFData';

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

    return (
        <div className={classes.root}>
            <Typography
                component="h1"
                variant="h1"
                color="textPrimary"
                gutterBottom
            >
                Stuff Will Go Here
            </Typography>
            {false && (
                <div className={classes.content}>
                    <div className={classes.portfolioSummary}>
                        <Typography
                            className={classes.portfolioSummaryTypography}
                            component="h3"
                            variant="h3"
                            color="textPrimary"
                            gutterBottom
                        >
                            Portfolio Summary
                        </Typography>
                        <Grid container spacing={4}>
                            <Grid item lg={3} sm={6} xl={3} xs={12}>
                                <CardSummary
                                    cardType="red"
                                    minScore={59}
                                    maxScore={100}
                                    count={4}
                                />
                            </Grid>
                            <Grid item lg={3} sm={6} xl={3} xs={12}>
                                <CardSummary
                                    cardType="orange"
                                    minScore={6}
                                    maxScore={58}
                                    count={46}
                                />
                            </Grid>
                            <Grid item lg={3} sm={6} xl={3} xs={12}>
                                <CardSummary
                                    cardType="yellow"
                                    minScore={1}
                                    maxScore={5}
                                    count={436}
                                />
                            </Grid>
                            <Grid item lg={3} sm={6} xl={3} xs={12}>
                                <CardSummary cardType="gray" count={896} />
                            </Grid>
                        </Grid>
                    </div>
                    <div>
                        <Typography
                            className={classes.cardsAtRiskTypography}
                            component="h3"
                            variant="h3"
                            color="textPrimary"
                            gutterBottom
                        >
                            Cards at Risk
                        </Typography>
                        <MaterialTable
                            title="Cards at Risk"
                            columns={[
                                {title: 'Card Token', field: 'token'},
                                {title: 'Fraud Forecast', field: 'score'},
                                {
                                    title: 'Spending Limit',
                                    field: 'spendingLimit',
                                    type: 'currency',
                                },
                                {
                                    title: 'Expiration Date',
                                    field: 'expirationDate',
                                    type: 'date',
                                },
                                {title: 'Card Status', field: 'status'},
                                {title: 'Total Reissued', field: 'reissued'},
                                {title: 'Latest Alert ID', field: 'alertId'},
                                {
                                    title: 'Latest Alert Date',
                                    field: 'alertDate',
                                    type: 'date',
                                },
                                {
                                    title: 'Last Download',
                                    field: 'lastDownload',
                                    type: 'datetime',
                                },
                            ]}
                            data={generateTableRows(15)}
                            options={{
                                sorting: true,
                                selection: true,
                                showTitle: false,
                                exportButton: true,
                                searchFieldAlignment: 'left',
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
