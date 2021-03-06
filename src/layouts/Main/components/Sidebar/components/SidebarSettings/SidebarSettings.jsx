/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import isNil from 'lodash/isNil';
import React, {Fragment, useContext} from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import {
    Button,
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
    LinearProgress,
    InputAdornment,
    Tooltip,
    Typography,
} from '@material-ui/core';
import {Formik, Form, Field} from 'formik';
import {TextField} from 'formik-material-ui';
import {DatePicker} from 'formik-material-ui-pickers';
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import MomentUtils from '@date-io/moment';
import TextFieldWithNumberFormat from './TextFieldWithNumberFormat';
import PopulationAutocomplete from './PopulationAutocomplete';
import SettingsContext from '/SettingsContext';

const useStyles = makeStyles(theme => ({
    root: {},
    field: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    helpIcon: {
        fontSize: '1.2rem',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
    expansionSummary: {
        padding: theme.spacing(1),
    },
    expansionDetails: {
        display: 'block',
        padding: theme.spacing(1),
    },
    submitButton: {
        marginBottom: theme.spacing(2),
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
                        hospitalizationRate,
                        fatalityRate,
                        hospitalizationDelayInDays,
                        hospitalizationStayInDays,
                        hospitalBeds,
                    } = values;
                    const errors = {};

                    // doublingTime errors
                    if (isNil(doublingTime)) {
                        errors.doublingTime = 'This is a required field.';
                    } else if (doublingTime < 0) {
                        errors.doublingTime = 'Value must be greater than 0.';
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
                    } else if (cutoffRiskPerDay < 0 || cutoffRiskPerDay > 100) {
                        errors.cutoffRiskPerDay =
                            'Value must be between 0 and 100.';
                    }

                    // cutoffRiskPerDay errors
                    if (isNil(cutoffRiskCumulative)) {
                        errors.cutoffRiskCumulative =
                            'This is a required field.';
                    } else if (
                        cutoffRiskCumulative < 0 ||
                        cutoffRiskCumulative > 100
                    ) {
                        errors.cutoffRiskCumulative =
                            'Value must be between 0 and 100.';
                    }

                    // hospitalizationRate errors
                    if (isNil(hospitalizationRate)) {
                        errors.hospitalizationRate =
                            'This is a required field.';
                    } else if (
                        hospitalizationRate < 0 ||
                        hospitalizationRate > 100
                    ) {
                        errors.hospitalizationRate =
                            'Value must be between 0 and 100.';
                    }

                    // fatalityRate errors
                    if (isNil(fatalityRate)) {
                        errors.fatalityRate = 'This is a required field.';
                    } else if (fatalityRate < 0 || fatalityRate > 100) {
                        errors.fatalityRate =
                            'Value must be between 0 and 100.';
                    }

                    // hospitalizationDelayInDays errors
                    if (isNil(hospitalizationDelayInDays)) {
                        errors.hospitalizationDelayInDays =
                            'This is a required field.';
                    } else if (hospitalizationDelayInDays < 0) {
                        errors.hospitalizationDelayInDays =
                            'Value must be 0 or greater.';
                    }

                    // hospitalizationStayInDays errors
                    if (isNil(hospitalizationStayInDays)) {
                        errors.hospitalizationStayInDays =
                            'This is a required field.';
                    } else if (hospitalizationStayInDays < 0) {
                        errors.hospitalizationStayInDays =
                            'Value must be 0 or greater.';
                    }

                    // hospitalBeds errors
                    if (isNil(hospitalBeds)) {
                        errors.hospitalBeds = 'This is a required field.';
                    } else if (hospitalBeds < 0) {
                        errors.hospitalBeds = 'Value must be 0 or greater.';
                    }

                    return errors;
                }}
                validateOnChange={false}
                onSubmit={(values, {setSubmitting}) => {
                    const {populationObj} = values;
                    const valuesToSet = {
                        ...values,
                        populationCode: populationObj?.code,
                        populationType: populationObj?.type,
                    };

                    setSettings(valuesToSet);
                    setSubmitting(false);
                }}
            >
                {({isSubmitting, isValid, submitForm, values}) => {
                    return (
                        <Form>
                            <ExpansionPanel defaultExpanded>
                                <ExpansionPanelSummary
                                    className={classes.expansionSummary}
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="case-content"
                                    id="case-header"
                                >
                                    <Typography className={classes.heading}>
                                        Case Settings
                                    </Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails
                                    className={classes.expansionDetails}
                                >
                                    <Field
                                        className={classes.field}
                                        component={PopulationAutocomplete}
                                        name="populationObj"
                                        disabled={disableForm}
                                        required
                                    />
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
                                                        enterTouchDelay={0}
                                                        arrow
                                                    >
                                                        <HelpOutlineIcon
                                                            className={
                                                                classes.helpIcon
                                                            }
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
                                        name="doublingTime"
                                        label="Doubling Time"
                                        placeholder="2.3"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip
                                                        title="0.01 and up.  Lower is faster."
                                                        enterTouchDelay={0}
                                                        arrow
                                                    >
                                                        <HelpOutlineIcon
                                                            className={
                                                                classes.helpIcon
                                                            }
                                                        />
                                                    </Tooltip>
                                                </InputAdornment>
                                            ),
                                        }}
                                        inputProps={{
                                            step: '0.01',
                                            min: 0,
                                            decimalScale: 2,
                                            fixedDecimalScale: true,
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
                                                        enterTouchDelay={0}
                                                        arrow
                                                    >
                                                        <HelpOutlineIcon
                                                            className={
                                                                classes.helpIcon
                                                            }
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
                                                        enterTouchDelay={0}
                                                        arrow
                                                    >
                                                        <HelpOutlineIcon
                                                            className={
                                                                classes.helpIcon
                                                            }
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
                                                        enterTouchDelay={0}
                                                        arrow
                                                    >
                                                        <HelpOutlineIcon
                                                            className={
                                                                classes.helpIcon
                                                            }
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
                                                        enterTouchDelay={0}
                                                        arrow
                                                    >
                                                        <HelpOutlineIcon
                                                            className={
                                                                classes.helpIcon
                                                            }
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
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                            <ExpansionPanel>
                                <ExpansionPanelSummary
                                    className={classes.expansionSummary}
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="risk-content"
                                    id="risk-header"
                                >
                                    <Typography className={classes.heading}>
                                        Risk Settings
                                    </Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails
                                    className={classes.expansionDetails}
                                >
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
                                                        enterTouchDelay={0}
                                                        arrow
                                                    >
                                                        <HelpOutlineIcon
                                                            className={
                                                                classes.helpIcon
                                                            }
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
                                        component={TextFieldWithNumberFormat}
                                        name="cutoffRiskPerDay"
                                        label="Risk Per Day"
                                        placeholder="5"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip
                                                        title="The cutoff for the chance you encountered an infected person on a given day."
                                                        enterTouchDelay={0}
                                                        arrow
                                                    >
                                                        <HelpOutlineIcon
                                                            className={
                                                                classes.helpIcon
                                                            }
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
                                                        enterTouchDelay={0}
                                                        arrow
                                                    >
                                                        <HelpOutlineIcon
                                                            className={
                                                                classes.helpIcon
                                                            }
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
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                            <ExpansionPanel>
                                <ExpansionPanelSummary
                                    className={classes.expansionSummary}
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="hospital-content"
                                    id="hospital-header"
                                >
                                    <Typography className={classes.heading}>
                                        Hospital Settings
                                    </Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails
                                    className={classes.expansionDetails}
                                >
                                    <Field
                                        className={classes.field}
                                        component={TextFieldWithNumberFormat}
                                        name="hospitalizationRate"
                                        label="Hospitalization Rate"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip
                                                        title="The percentage of cases requiring hospitalization."
                                                        enterTouchDelay={0}
                                                        arrow
                                                    >
                                                        <HelpOutlineIcon
                                                            className={
                                                                classes.helpIcon
                                                            }
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
                                        name="fatalityRate"
                                        label="Fatality Rate"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip
                                                        title="The percentage of cases resulting in death."
                                                        enterTouchDelay={0}
                                                        arrow
                                                    >
                                                        <HelpOutlineIcon
                                                            className={
                                                                classes.helpIcon
                                                            }
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
                                        component={TextField}
                                        name="hospitalizationDelayInDays"
                                        label="Hospitalization Delay (in days)"
                                        type="number"
                                        placeholder="9"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip
                                                        title="Number of days from onset of symptoms to hospitalization."
                                                        enterTouchDelay={0}
                                                        arrow
                                                    >
                                                        <HelpOutlineIcon
                                                            className={
                                                                classes.helpIcon
                                                            }
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
                                        name="hospitalizationStayInDays"
                                        label="Hospital Stay (in days)"
                                        type="number"
                                        placeholder="10"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip
                                                        title="Number of days for a hospital stay."
                                                        enterTouchDelay={0}
                                                        arrow
                                                    >
                                                        <HelpOutlineIcon
                                                            className={
                                                                classes.helpIcon
                                                            }
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
                                        component={TextFieldWithNumberFormat}
                                        name="hospitalBeds"
                                        label="Hospital Beds"
                                        placeholder="5000"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip
                                                        title="Number of hospital beds in metro area."
                                                        enterTouchDelay={0}
                                                        arrow
                                                    >
                                                        <HelpOutlineIcon
                                                            className={
                                                                classes.helpIcon
                                                            }
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
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                            <br />
                            {isSubmitting && (
                                <Fragment>
                                    <LinearProgress />
                                    <br />
                                </Fragment>
                            )}
                            <Button
                                className={classes.submitButton}
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
