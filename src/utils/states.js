import isArray from 'lodash/isArray';
import statesData from '../data/countries/us.json';

const StatesUtils = {
    getStateInfoByKey(stateKey) {
        const stateInfo = statesData[stateKey];

        if (!isArray(stateInfo)) {
            return;
        }

        const sortedStateInfo = stateInfo.sort((a, b) => a.date - b.date);

        return sortedStateInfo;
    },
};

export default StatesUtils;
