import find from 'lodash/find';
import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import metros, {otherMetro} from '../../../../../../data/metros';
// import {makeStyles} from '@material-ui/styles';
import {MenuItem} from '@material-ui/core';
import {TextField} from 'formik-material-ui';

const MetroSelect = ({field, onSelectChange, ...props}) => {
    const {onChange: onFieldChange, value} = field;
    const {setFieldValue} = props.form;

    const onChange = event => {
        const selectedKey = event.target.value;

        if (onFieldChange) {
            onFieldChange(event);
        }

        if (selectedKey !== value) {
            if (selectedKey === 'other') {
                setFieldValue('population', otherMetro.population); // eslint-disable-line
            } else {
                const metro = find(metros, {key: selectedKey});

                setFieldValue('population', metro ? metro.population : 1);
            }
        }
    };

    field.onChange = onChange;

    const selectProps = {
        field,
        ...props,
    };

    return (
        <Fragment>
            <TextField
                select
                id="metro-area"
                label="City/Country"
                {...selectProps}
            >
                {metros.map(metroObj => {
                    return (
                        <MenuItem key={metroObj.key} value={metroObj.key}>
                            {metroObj.name}
                        </MenuItem>
                    );
                })}
                <MenuItem value={otherMetro.key}>{otherMetro.name}</MenuItem>
            </TextField>
        </Fragment>
    );
};

MetroSelect.propTypes = {
    field: PropTypes.object,
    form: PropTypes.object,
    onSelectChange: PropTypes.func,
};

export default MetroSelect;
