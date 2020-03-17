import React from 'react';
import PropTypes from 'prop-types';
import {TextField} from 'formik-material-ui';
import MaskedInput from 'react-text-mask';

const MaskedTextField = props => {
    const {inputRef, ...other} = props;

    return (
        <MaskedInput
            {...other}
            ref={ref => {
                inputRef(ref ? ref.inputElement : null);
            }}
        />
    );
};

MaskedTextField.propTypes = {
    inputRef: PropTypes.func.isRequired,
};

const TextFieldWithMask = props => {
    const {InputProps = {}, ...other} = props;

    InputProps.inputComponent = MaskedTextField;

    return <TextField {...other} InputProps={InputProps} />;
};

TextFieldWithMask.propTypes = {
    InputProps: PropTypes.object,
    mask: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
    guide: PropTypes.bool,
    placeholderChar: PropTypes.string,
    pipe: PropTypes.func,
    showMask: PropTypes.bool,
};

export default TextFieldWithMask;
