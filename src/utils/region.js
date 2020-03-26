import findIndex from 'lodash/findIndex';
import isArray from 'lodash/isArray';
import moment from 'moment';
import usaData from '../data/countries/us.json';

const RegionUtils = {
    getRegionInfoByKey({
        countryCode = 'usa',
        regionKey = 'IL',
        fromFirstCase = false,
    } = {}) {
        const formattedCC = countryCode.toLowerCase();
        let dataSource = usaData;

        switch (formattedCC) {
            case 'usa':
                dataSource = usaData;
                break;
            default:
                dataSource = usaData;
                break;
        }

        const regionInfo = dataSource[regionKey];

        if (!isArray(regionInfo)) {
            return;
        }

        let returnedRegionInfo = regionInfo.sort((a, b) => {
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
    },
};

export default RegionUtils;
