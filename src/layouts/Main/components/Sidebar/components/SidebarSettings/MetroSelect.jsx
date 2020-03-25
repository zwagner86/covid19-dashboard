import find from 'lodash/find';
import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import states from '../../../../../../data/regions/usa/states';
// import {makeStyles} from '@material-ui/styles';
import {MenuItem} from '@material-ui/core';
import {TextField} from 'formik-material-ui';
import StatesUtils from '../../../../../../utils/states';

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
                setFieldValue('population', 15000); // eslint-disable-line
            } else {
                const state = find(states, {key: selectedKey});
                const stateReportedData = StatesUtils.getStateInfoByKey(
                    selectedKey,
                    {fromFirstCase: true}
                );

                setFieldValue('population', state ? state.population : 15000);
                setFieldValue(
                    'hospitalBeds',
                    state ? state.hospitalBeds : 7000
                );

                if (stateReportedData) {
                    setFieldValue(
                        'startDate',
                        moment(stateReportedData[0].date)
                    );

                    const baseCases = stateReportedData[0].cases || 1;

                    setFieldValue('baseCases', baseCases);
                }
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
                {states.map(stateObj => {
                    return (
                        <MenuItem key={stateObj.key} value={stateObj.key}>
                            {stateObj.name}
                        </MenuItem>
                    );
                })}
                <MenuItem value="other">Other</MenuItem>
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
