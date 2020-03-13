const status = ['Active', 'Expired', 'Confirmed Fraud', 'Reissued'];

export const generateTableRows = numRows => {
    const tableData = [];

    for (let index = 0; index < numRows; index++) {
        tableData.push({
            token: `${Math.floor(Math.random() * 2500) + 1}....abcdef`,
            score: Math.floor(Math.random() * 100) + 1,
            spendingLimit: Math.floor(Math.random() * 200) + 1,
            expirationDate: '2023-12-31',
            status: status[Math.floor(Math.random() * 3)],
            reissued: Math.floor(Math.random() * 150) + 1,
            alertId: `Alert: ${Math.floor(Math.random() * 10000) + 1}`,
            alertDate: '2019-12-28',
            recommendedDate: '2020-01-10',
            lastDownload: '2019-06-20 17:05:43',
        });
    }

    const sortedData = tableData.sort((a, b) => {
        return b.score - a.score;
    });

    return sortedData;
};
