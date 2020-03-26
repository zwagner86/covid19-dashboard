import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import regions from '/data/regions';
// import {makeStyles} from '@material-ui/styles';
import {ListSubheader, MenuItem} from '@material-ui/core';
import {TextField} from 'formik-material-ui';
import RegionUtils from '/utils/region';

const MetroSelect = ({field, selectedCountry, onSelectChange, ...props}) => {
    const {onChange: onFieldChange, value} = field;
    const {setFieldValue} = props.form;
    const countryRegions = regions[selectedCountry];

    const onChange = event => {
        const selectedKey = event.target.value;

        if (onFieldChange) {
            onFieldChange(event);
        }

        if (selectedKey !== value) {
            if (selectedKey === 'other') {
                setFieldValue('population', 15000); // eslint-disable-line
            } else {
                const regionsToSearch =
                    regions[selectedCountry.toLowerCase()] || regions.usa;
                const popsToSearch = [
                    ...regionsToSearch.regions,
                    ...regionsToSearch.states,
                ];
                const region = find(popsToSearch, {key: selectedKey});
                const regionReportedData = RegionUtils.getRegionInfoByKey({
                    countryCode: selectedCountry,
                    regionKey: selectedKey,
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
        <TextField select id="metro-area" label="City/Region" {...selectProps}>
            {countryRegions && !isEmpty(countryRegions.country) && (
                <ListSubheader>
                    {countryRegions.name || selectedCountry.toUpperCase()}
                </ListSubheader>
            )}
            {countryRegions &&
                !isEmpty(countryRegions.country) &&
                countryRegions.country.map(countryObj => {
                    return (
                        <MenuItem key={countryObj.key} value={countryObj.key}>
                            {countryObj.name}
                        </MenuItem>
                    );
                })}
            {countryRegions && !isEmpty(countryRegions.states) && (
                <ListSubheader>States</ListSubheader>
            )}
            {countryRegions &&
                !isEmpty(countryRegions.states) &&
                countryRegions.states.map(stateObj => {
                    return (
                        <MenuItem key={stateObj.key} value={stateObj.key}>
                            {stateObj.name}
                        </MenuItem>
                    );
                })}
            {countryRegions && !isEmpty(countryRegions.regions) && (
                <ListSubheader>Regions</ListSubheader>
            )}
            {countryRegions &&
                !isEmpty(countryRegions.regions) &&
                countryRegions.regions.map(stateObj => {
                    return (
                        <MenuItem key={stateObj.key} value={stateObj.key}>
                            {stateObj.name}
                        </MenuItem>
                    );
                })}
            <MenuItem value="other">Other</MenuItem>
        </TextField>
    );
};

MetroSelect.propTypes = {
    field: PropTypes.object,
    form: PropTypes.object,
    selectedCountry: PropTypes.string,
    onSelectChange: PropTypes.func,
};

export default MetroSelect;
