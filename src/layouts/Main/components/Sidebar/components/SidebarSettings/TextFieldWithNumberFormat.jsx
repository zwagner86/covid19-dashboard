import React from 'react';
import PropTypes from 'prop-types';
import {TextField} from 'formik-material-ui';
import NumberFormat from 'react-number-format';

const NumberFormatCustom = props => {
    const {inputRef, onChange, ...other} = props;
    const {name} = other;
    const otherProps = {};

    if (onChange) {
        otherProps.onValueChange = values => {
            onChange({
                target: {
                    value: values.floatValue,
                    name,
                },
            });
        };
    }

    return <NumberFormat {...other} {...otherProps} getInputRef={inputRef} />;
};

NumberFormatCustom.propTypes = {
    inputRef: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
};

const TextFieldWithNumberFormat = props => {
    const {InputProps = {}, ...other} = props;

    InputProps.inputComponent = NumberFormatCustom;

    return <TextField {...other} InputProps={InputProps} />;
};

TextFieldWithNumberFormat.propTypes = {
    InputProps: PropTypes.object,
};

export default TextFieldWithNumberFormat;
