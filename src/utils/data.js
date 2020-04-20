import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import sample from 'lodash/sample';
import moment from 'moment';
import StorageUtils from './storage';

const sortDailyDataByDate = (data, fromFirstCase) => {
    let returnedDailyData = data.sort((a, b) => {
        return moment(a.date).diff(moment(b.date));
    });

    if (fromFirstCase) {
        const firstCaseIndex = findIndex(returnedDailyData, dailyDataObj => {
            return dailyDataObj.cases > 0;
        });

        if (firstCaseIndex > 0) {
            returnedDailyData = returnedDailyData.slice(firstCaseIndex);
        }
    }

    return returnedDailyData;
};

const DataUtils = {
    getPopTypeData(type) {
        if (type !== 'country' && type !== 'state' && type !== 'metro') {
            throw new Error();
        }

        const typeData = StorageUtils.get(`${type}Data`, 'session');

        return typeData;
    },

    getRandomPopTypeData({type, fromFirstCase}) {
        if (type !== 'country' && type !== 'state' && type !== 'metro') {
            throw new Error();
        }

        const typeData = StorageUtils.get(`${type}Data`, 'session');
        const popData = sample(typeData);

        if (popData) {
            popData.dailyData = sortDailyDataByDate(
                popData.dailyData,
                fromFirstCase
            );
        }

        return popData;
    },

    getDataByPopTypeAndCode({type, code, fromFirstCase = false}) {
        if (type !== 'country' && type !== 'state' && type !== 'metro') {
            throw new Error();
        }

        const typeData = StorageUtils.get(`${type}Data`, 'session');
        let popData = find(typeData, {code});

        if (!popData && code === 'USA') {
            popData = find(typeData, {code: 'United States'});
        }

        if (popData) {
            popData.dailyData = sortDailyDataByDate(
                popData.dailyData,
                fromFirstCase
            );
        }

        return popData;
    },
};

export default DataUtils;
