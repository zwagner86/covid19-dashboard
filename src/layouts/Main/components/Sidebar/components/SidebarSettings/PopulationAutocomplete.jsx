import find from 'lodash/find';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {makeStyles} from '@material-ui/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {TextField} from 'formik-material-ui';
import DataUtils from '/utils/data';

const useStyles = makeStyles(theme => ({
    listGrouping: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    groupLabel: {
        textTransform: 'capitalize',
    },
}));

const PopulationAutocomplete = ({field, ...props}) => {
    delete field.onChange;

    const classes = useStyles();
    const {value, ...restFieldProps} = field;
    const {disabled} = props;
    const {setFieldValue} = props.form;
    const countryData = DataUtils.getPopTypeData('country');
    const stateData = DataUtils.getPopTypeData('state');
    const metroData = DataUtils.getPopTypeData('metro');
    const options = countryData.concat(stateData, metroData);
    const defaultValue = find(options, {
        type: value.type,
        code: value.code,
    });

    const onChange = (event, selectedValue) => {
        if (selectedValue) {
            setFieldValue('populationObj', {
                type: selectedValue.type,
                code: selectedValue.code,
            });

            if (
                selectedValue.type !== defaultValue.type ||
                selectedValue.name !== defaultValue.name
            ) {
                if (selectedValue.doublingTime) {
                    setFieldValue('doublingTime', selectedValue.doublingTime);
                }

                setFieldValue(
                    'population',
                    selectedValue.population ? selectedValue.population : 15000
                );
                setFieldValue(
                    'hospitalBeds',
                    selectedValue.beds ? selectedValue.beds : 7000
                );

                setFieldValue(
                    'startDate',
                    moment(selectedValue.dailyData[0].date)
                );

                setFieldValue(
                    'baseCases',
                    selectedValue.dailyData[0].positive || 1
                );
            }
        }
    };

    restFieldProps.value = defaultValue;

    const selectProps = {
        field: restFieldProps,
        ...props,
    };

    return (
        <Autocomplete
            id="population-autocomplete"
            classes={{
                groupLabel: classes.groupLabel,
            }}
            value={defaultValue}
            options={options}
            groupBy={option => option.type}
            getOptionLabel={option => option.name || option.code}
            getOptionSelected={(option, secondOption) => {
                return (
                    option.type === secondOption.type &&
                    option.name === secondOption.name
                );
            }}
            renderInput={params => {
                return (
                    <TextField
                        id="population-obj"
                        {...params}
                        {...selectProps}
                        label="Population Area"
                    />
                );
            }}
            onChange={onChange}
            disabled={disabled}
        />
    );
};

PopulationAutocomplete.propTypes = {
    field: PropTypes.object,
    form: PropTypes.object,
    disabled: PropTypes.bool,
};

export default PopulationAutocomplete;
