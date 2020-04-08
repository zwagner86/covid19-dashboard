import get from 'lodash/get';
import keys from 'lodash/keys';
import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import regions from '/data/regions';
// import {makeStyles} from '@material-ui/styles';
import {MenuItem} from '@material-ui/core';
import {TextField} from 'formik-material-ui';
import RegionUtils from '/utils/region';

const CountrySelect = ({field, onSelectChange, ...props}) => {
    const {onChange: onFieldChange, value} = field;
    const {setFieldValue} = props.form;
    const regionsArray = keys(regions);

    const onChange = event => {
        const selectedKey = event.target.value;

        if (onFieldChange) {
            onFieldChange(event);
        }

        if (selectedKey !== value) {
            if (selectedKey === 'other') {
                setFieldValue('population', 15000);
                setFieldValue('regionKey', 'other');
            } else {
                const regionsToSearch = RegionUtils.getRegionsGroupedByType(
                    selectedKey
                );
                const popsToSearch = [
                    ...regionsToSearch.country,
                    ...regionsToSearch.region,
                    ...regionsToSearch.state,
                ];
                const region = popsToSearch[1];

                setFieldValue('regionKey', region.code);

                const sortedRegionDailyData = RegionUtils.sortRegionDailyDataByDate(
                    region,
                    true
                );

                const doublingTime = get(region, 'doublings.positive[0].dt');

                if (doublingTime) {
                    setFieldValue('doublingTime', doublingTime);
                }

                setFieldValue('population', region ? region.population : 15000);
                setFieldValue('hospitalBeds', region ? region.beds : 7000);

                if (sortedRegionDailyData) {
                    setFieldValue(
                        'startDate',
                        moment(sortedRegionDailyData[0].date)
                    );

                    setFieldValue(
                        'baseCases',
                        sortedRegionDailyData[0].positive || 1
                    );
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
            <TextField select id="country" label="Country" {...selectProps}>
                {regionsArray.map(region => {
                    return (
                        <MenuItem key={region} value={region}>
                            {regions[region].name}
                        </MenuItem>
                    );
                })}
                <MenuItem value="other">Other</MenuItem>
            </TextField>
        </Fragment>
    );
};

CountrySelect.propTypes = {
    field: PropTypes.object,
    form: PropTypes.object,
    onSelectChange: PropTypes.func,
};

export default CountrySelect;
