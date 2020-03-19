/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import isNil from 'lodash/isNil';
import React, {useContext} from 'react';
// import clsx from 'clsx';
// import moment from 'moment';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import {
    Button,
    LinearProgress,
    InputAdornment,
    Tooltip,
} from '@material-ui/core';
import {Formik, Form, Field} from 'formik';
import {TextField} from 'formik-material-ui';
import {DatePicker} from 'formik-material-ui-pickers';
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import MomentUtils from '@date-io/moment';
import TextFieldWithNumberFormat from './TextFieldWithNumberFormat';
import MetroSelect from './MetroSelect';
import SettingsContext from '../../../../../../SettingsContext';

const useStyles = makeStyles(theme => ({
    root: {},
    field: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    helpIcon: {
        fontSize: '1.2rem',
    },
}));

const SidebarSettings = ({disableForm}) => {
    const classes = useStyles();
    const {settings, setSettings} = useContext(SettingsContext);

    return (
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <Formik
                initialValues={{
                    ...settings,
                }}
                validate={values => {
                    const {
                        doublingTime,
                        population,
                        exposure,
                        numberOfDays,
                        baseCases,
                        multiplier,
                        cutoffRiskPerDay,
                        cutoffRiskCumulative,
                    } = values;
                    const errors = {};

                    // doublingTime errors
                    if (isNil(doublingTime)) {
                        errors.doublingTime = 'This is a required field.';
                    } else if (doublingTime < 1 || doublingTime > 3) {
                        errors.doublingTime = 'Value must be between 1 and 3.';
                    }

                    // population errors
                    if (isNil(population)) {
                        errors.population = 'This is a required field.';
                    } else if (population < 1) {
                        errors.population = 'Value must be 1 or greater.';
                    }

                    // exposure errors
                    if (isNil(exposure)) {
                        errors.exposure = 'This is a required field.';
                    } else if (exposure < 0) {
                        errors.exposure = 'Value must be 0 or greater.';
                    }

                    // numberOfDays errors
                    if (isNil(numberOfDays)) {
                        errors.numberOfDays = 'This is a required field.';
                    } else if (numberOfDays < 1) {
                        errors.numberOfDays = 'Value must be 1 or greater.';
                    } else if (numberOfDays > 365) {
                        errors.numberOfDays = 'Value must be 365 or less.';
                    }

                    // baseCases errors
                    if (isNil(baseCases)) {
                        errors.baseCases = 'This is a required field.';
                    } else if (baseCases < 0) {
                        errors.baseCases = 'Value must be 0 or greater.';
                    }

                    // multiplier errors
                    if (isNil(multiplier)) {
                        errors.multiplier = 'This is a required field.';
                    } else if (multiplier < 1) {
                        errors.multiplier = 'Value must be 1 or greater.';
                    }

                    // cutoffRiskPerDay errors
                    if (isNil(cutoffRiskPerDay)) {
                        errors.cutoffRiskPerDay = 'This is a required field.';
                    } else if (cutoffRiskPerDay < 0) {
                        errors.cutoffRiskPerDay = 'Value must be 0 or greater.';
                    }

                    // cutoffRiskPerDay errors
                    if (isNil(cutoffRiskCumulative)) {
                        errors.cutoffRiskCumulative =
                            'This is a required field.';
                    } else if (cutoffRiskCumulative < 0) {
                        errors.cutoffRiskCumulative =
                            'Value must be 0 or greater.';
                    }

                    return errors;
                }}
                validateOnChange={false}
                onSubmit={(values, {setSubmitting}) => {
                    setSettings(values);
                    setSubmitting(false);
                }}
            >
                {({isSubmitting, isValid, submitForm}) => {
                    return (
                        <Form>
                            <Field
                                className={classes.field}
                                component={TextField}
                                name="doublingTime"
                                label="Doubling Time"
                                type="number"
                                placeholder="3"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip
                                                title="Between 1 and 3.  Lower is faster."
                                                arrow
                                            >
                                                <HelpOutlineIcon
                                                    className={classes.helpIcon}
                                                />
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                }}
                                inputProps={{
                                    min: 1,
                                    max: 3,
                                }}
                                disabled={disableForm}
                                required
                            />
                            <br />
                            <Field
                                className={classes.field}
                                component={MetroSelect}
                                name="metroKey"
                                disabled={disableForm}
                                required
                            />
                            <br />
                            <Field
                                className={classes.field}
                                component={TextFieldWithNumberFormat}
                                name="population"
                                label="Population"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip
                                                title="The population of your metro area."
                                                arrow
                                            >
                                                <HelpOutlineIcon
                                                    className={classes.helpIcon}
                                                />
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                }}
                                inputProps={{
                                    min: 1,
                                    thousandSeparator: true,
                                }}
                                disabled={disableForm}
                                required
                            />
                            <br />
                            <Field
                                className={classes.field}
                                component={TextFieldWithNumberFormat}
                                name="exposure"
                                label="Exposure"
                                placeholder="100"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip
                                                title="The people you encounter in a day."
                                                arrow
                                            >
                                                <HelpOutlineIcon
                                                    className={classes.helpIcon}
                                                />
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                }}
                                inputProps={{
                                    min: 0,
                                    thousandSeparator: true,
                                }}
                                disabled={disableForm}
                                required
                            />
                            <br />
                            <Field
                                className={classes.field}
                                component={DatePicker}
                                name="startDate"
                                label="Start Date"
                                format="MMMM Do YYYY"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip
                                                title="The start date of the pandemic."
                                                arrow
                                            >
                                                <HelpOutlineIcon
                                                    className={classes.helpIcon}
                                                />
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                }}
                                disabled={disableForm}
                                required
                            />
                            <br />
                            <Field
                                className={classes.field}
                                component={TextField}
                                name="numberOfDays"
                                label="Number of Days"
                                type="number"
                                placeholder="30"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip
                                                title="The number of days to model since the start date."
                                                arrow
                                            >
                                                <HelpOutlineIcon
                                                    className={classes.helpIcon}
                                                />
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                }}
                                inputProps={{
                                    min: 1,
                                    max: 365,
                                }}
                                disabled={disableForm}
                                required
                            />
                            <br />
                            <Field
                                className={classes.field}
                                component={TextField}
                                name="baseCases"
                                label="Base Cases"
                                type="number"
                                placeholder="5"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip
                                                title="The initial reported cases on the start date."
                                                arrow
                                            >
                                                <HelpOutlineIcon
                                                    className={classes.helpIcon}
                                                />
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                }}
                                inputProps={{
                                    min: 0,
                                }}
                                disabled={disableForm}
                                required
                            />
                            <br />
                            <Field
                                className={classes.field}
                                component={TextField}
                                name="multiplier"
                                label="Multiplier"
                                type="number"
                                placeholder="5"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip
                                                title="For every reported case there will be X unreported cases.  Set that multiplier here."
                                                arrow
                                            >
                                                <HelpOutlineIcon
                                                    className={classes.helpIcon}
                                                />
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                }}
                                inputProps={{
                                    min: 1,
                                }}
                                disabled={disableForm}
                                required
                            />
                            <br />
                            <Field
                                className={classes.field}
                                component={TextFieldWithNumberFormat}
                                name="cutoffRiskPerDay"
                                label="Risk Per Day"
                                placeholder="5"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip
                                                title="The cutoff for the chance you encountered an infected person on a given day."
                                                arrow
                                            >
                                                <HelpOutlineIcon
                                                    className={classes.helpIcon}
                                                />
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                }}
                                inputProps={{
                                    step: '0.01',
                                    min: 0,
                                    max: 100,
                                    decimalScale: 2,
                                    fixedDecimalScale: true,
                                    suffix: '%',
                                }}
                                disabled={disableForm}
                                required
                            />
                            <br />
                            <Field
                                className={classes.field}
                                component={TextFieldWithNumberFormat}
                                name="cutoffRiskCumulative"
                                label="Cumulative Risk"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip
                                                title="The cutoff for the chance you encountered an infected person any day since the start date."
                                                arrow
                                            >
                                                <HelpOutlineIcon
                                                    className={classes.helpIcon}
                                                />
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                }}
                                inputProps={{
                                    step: '0.01',
                                    min: 0,
                                    max: 100,
                                    decimalScale: 2,
                                    fixedDecimalScale: true,
                                    suffix: '%',
                                }}
                                disabled={disableForm}
                                required
                            />
                            <br />
                            {isSubmitting && <LinearProgress />}
                            <br />
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={
                                    disableForm || isSubmitting || !isValid
                                }
                                onClick={submitForm}
                                fullWidth
                            >
                                Submit
                            </Button>
                        </Form>
                    );
                }}
            </Formik>
        </MuiPickersUtilsProvider>
    );
};

SidebarSettings.propTypes = {
    disableForm: PropTypes.bool,
};

export default SidebarSettings;
