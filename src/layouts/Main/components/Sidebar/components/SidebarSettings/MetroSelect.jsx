import find from 'lodash/find';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
// import regions from '/data/regions';
import {makeStyles} from '@material-ui/styles';
import {ListSubheader, MenuItem} from '@material-ui/core';
import {TextField} from 'formik-material-ui';
import RegionUtils from '/utils/region';

const useStyles = makeStyles(theme => ({
    listGrouping: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
}));

const MetroSelect = ({field, selectedCountry, onSelectChange, ...props}) => {
    const classes = useStyles();
    const {onChange: onFieldChange, value} = field;
    const {setFieldValue} = props.form;
    const countryRegions = RegionUtils.getRegionsGroupedByType(selectedCountry);

    const onChange = event => {
        const selectedKey = event.target.value;

        if (onFieldChange) {
            onFieldChange(event);
        }

        if (selectedKey !== value) {
            if (selectedKey === 'other') {
                setFieldValue('population', 15000); // eslint-disable-line
            } else {
                const regionsToSearch = RegionUtils.getRegionsGroupedByType(
                    selectedCountry.toLowerCase() || 'usa'
                );
                const popsToSearch = [
                    ...regionsToSearch.region,
                    ...regionsToSearch.state,
                ];
                const region = find(popsToSearch, {code: selectedKey});
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
        <TextField select id="metro-area" label="State/Region" {...selectProps}>
            {countryRegions && !isEmpty(countryRegions.country) && (
                <ListSubheader className={classes.listGrouping}>
                    Country
                </ListSubheader>
            )}
            {countryRegions && !isEmpty(countryRegions.country) && (
                <MenuItem key="all" value="all">
                    {countryRegions.country[0].name || 'All'}
                </MenuItem>
            )}
            {countryRegions && !isEmpty(countryRegions.state) && (
                <ListSubheader className={classes.listGrouping}>
                    States
                </ListSubheader>
            )}
            {countryRegions &&
                !isEmpty(countryRegions.state) &&
                countryRegions.state.map(stateObj => {
                    return (
                        <MenuItem key={stateObj.code} value={stateObj.code}>
                            {stateObj.name || stateObj.code}
                        </MenuItem>
                    );
                })}
            {countryRegions && !isEmpty(countryRegions.region) && (
                <ListSubheader className={classes.listGrouping}>
                    Regions
                </ListSubheader>
            )}
            {countryRegions &&
                !isEmpty(countryRegions.region) &&
                countryRegions.region.map(regionObj => {
                    return (
                        <MenuItem key={regionObj.code} value={regionObj.code}>
                            {regionObj.name || regionObj.code}
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
