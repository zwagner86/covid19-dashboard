import isArray from 'lodash/isArray';
import moment from 'moment';
import statesData from '../data/countries/us.json';

const StatesUtils = {
    getStateInfoByKey(stateKey) {
        const stateInfo = statesData[stateKey];

        if (!isArray(stateInfo)) {
            return;
        }

        return stateInfo.sort((a, b) => {
            return moment(a.date).diff(moment(b.date));
        });
    },
};

export default StatesUtils;
