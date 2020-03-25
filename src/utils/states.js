import findIndex from 'lodash/findIndex';
import isArray from 'lodash/isArray';
import moment from 'moment';
import statesData from '../data/countries/us.json';

const StatesUtils = {
    getStateInfoByKey(stateKey, {fromFirstCase = false} = {}) {
        const stateInfo = statesData[stateKey];

        if (!isArray(stateInfo)) {
            return;
        }

        let returnedStateInfo = stateInfo.sort((a, b) => {
            return moment(a.date).diff(moment(b.date));
        });

        if (fromFirstCase) {
            const firstCaseIndex = findIndex(
                returnedStateInfo,
                stateReportObj => {
                    return stateReportObj.cases > 0;
                }
            );

            if (firstCaseIndex > 0) {
                returnedStateInfo = returnedStateInfo.slice(firstCaseIndex);
            }
        }

        return returnedStateInfo;
    },
};

export default StatesUtils;
