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
                const regionsToSearch = regions[selectedKey];
                const popsToSearch = [
                    ...regionsToSearch.country,
                    ...regionsToSearch.regions,
                    ...regionsToSearch.states,
                ];
                const region = popsToSearch[0];

                setFieldValue('regionKey', region.key);

                const regionReportedData = RegionUtils.getRegionInfoByKey({
                    countryCode: selectedKey,
                    regionKey: region.key,
                    fromFirstCase: true,
                });

                setFieldValue('population', region ? region.population : 15000);
                setFieldValue(
                    'hospitalBeds',
                    region ? region.hospitalBeds : 7000
                );

                if (regionReportedData) {
                    setFieldValue(
                        'startDate',
                        moment(regionReportedData[0].date)
                    );

                    const baseCases = regionReportedData[0].cases || 1;

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
