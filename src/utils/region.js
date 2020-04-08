import findIndex from 'lodash/findIndex';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';
import moment from 'moment';
import usaStatesData from '/data/countries/us_states.json';

const sortDataByDate = (data, fromFirstCase) => {
    let returnedRegionInfo = data.sort((a, b) => {
        return moment(a.date).diff(moment(b.date));
    });

    if (fromFirstCase) {
        const firstCaseIndex = findIndex(
            returnedRegionInfo,
            regionReportObj => {
                return regionReportObj.cases > 0;
            }
        );

        if (firstCaseIndex > 0) {
            returnedRegionInfo = returnedRegionInfo.slice(firstCaseIndex);
        }
    }

    return returnedRegionInfo;
};

const RegionUtils = {
    getRegionInfoByKey({
        countryCode = 'usa',
        regionKey = 'IL',
        fromFirstCase = false,
    } = {}) {
        const formattedCC = countryCode.toLowerCase();
        let dataSource = usaStatesData;

        switch (formattedCC) {
            case 'usa':
                dataSource = usaStatesData;
                break;
            default:
                dataSource = usaStatesData;
                break;
        }

        const region = dataSource[regionKey];

        if (isEmpty(region) || !isArray(region.dailyData)) {
            return region;
        }

        const returnRegion = region;

        returnRegion.dailyData = sortDataByDate(
            region.dailyData,
            fromFirstCase
        );

        return returnRegion;
    },
    getRegionsGroupedByType(countryCode) {
        const formattedCC = countryCode.toLowerCase();
        let dataSource = usaStatesData;

        switch (formattedCC) {
            case 'usa':
                dataSource = usaStatesData;
                break;
            default:
                dataSource = usaStatesData;
                break;
        }

        return reduce(
            dataSource,
            (result, value, key) => {
                if (
                    value.type === 'country' ||
                    value.type === 'state' ||
                    value.type === 'region'
                ) {
                    result[value.type].push(value);
                }

                return result;
            },
            {country: [], state: [], region: []}
        );
    },
    sortRegionDailyDataByDate(region, fromFirstCase = false) {
        if (isEmpty(region) || !isArray(region.dailyData)) {
            return region;
        }

        return sortDataByDate(region.dailyData, fromFirstCase);
    },
};

export default RegionUtils;
