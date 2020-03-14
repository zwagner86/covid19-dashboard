/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React, {useContext} from 'react';
// import clsx from 'clsx';
// import moment from 'moment';
// import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import {Button, LinearProgress} from '@material-ui/core';
import {Formik, Form, Field} from 'formik';
import {TextField} from 'formik-material-ui';
import {DatePicker} from 'formik-material-ui-pickers';
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import SettingsContext from '../../../../../../SettingsContext';

const useStyles = makeStyles(theme => ({
    root: {},
    field: {
        width: '100%',
        paddingBottom: theme.spacing(2),
    },
}));

const SidebarSettings = props => {
    // const {className, ...rest} = props;
    const classes = useStyles();
    const {settings, setSettings} = useContext(SettingsContext);

    return (
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <Formik
                initialValues={settings}
                onSubmit={(values, {setSubmitting}) => {
                    setSettings(values);
                    setSubmitting(false);
                }}
            >
                {({submitForm, isSubmitting}) => (
                    <Form>
                        <Field
                            className={classes.field}
                            component={TextField}
                            name="doublingTime"
                            label="Doubling Time"
                            type="number"
                            inputProps={{
                                min: 1,
                                max: 3,
                            }}
                            required
                        />
                        <br />
                        <Field
                            className={classes.field}
                            component={TextField}
                            name="population"
                            label="Population"
                            type="number"
                            inputProps={{
                                min: 0,
                            }}
                            required
                        />
                        <br />
                        <Field
                            className={classes.field}
                            component={TextField}
                            name="exposure"
                            label="Exposure"
                            type="number"
                            inputProps={{
                                min: 0,
                            }}
                            required
                        />
                        <br />
                        <Field
                            className={classes.field}
                            component={DatePicker}
                            name="startDate"
                            label="Start Date"
                            required
                        />
                        <br />
                        <Field
                            className={classes.field}
                            component={TextField}
                            name="baseCases"
                            label="Base Cases"
                            type="number"
                            inputProps={{
                                min: 0,
                            }}
                            required
                        />
                        <br />
                        <Field
                            className={classes.field}
                            component={TextField}
                            name="multiplier"
                            label="Multiplier"
                            type="number"
                            inputProps={{
                                min: 1,
                            }}
                            required
                        />
                        <br />
                        <Field
                            className={classes.field}
                            component={TextField}
                            name="cutoffRiskPerDay"
                            label="Risk Per Day"
                            type="number"
                            inputProps={{
                                step: '0.01',
                                min: 0,
                            }}
                            required
                        />
                        <br />
                        <Field
                            className={classes.field}
                            component={TextField}
                            name="cutoffRiskCumulative"
                            label="Cumulative Risk"
                            type="number"
                            inputProps={{
                                step: '0.01',
                                min: 0,
                            }}
                            required
                        />
                        <br />
                        {isSubmitting && <LinearProgress />}
                        <br />
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting}
                            onClick={submitForm}
                        >
                            Submit
                        </Button>
                    </Form>
                )}
            </Formik>
        </MuiPickersUtilsProvider>
    );
};

SidebarSettings.propTypes = {
    // className: PropTypes.string,
};

export default SidebarSettings;
