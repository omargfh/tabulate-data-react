export function handleData(data) {
    // Checks data is a valid array
    if (!Array.isArray(data)) {
        return [];
    }

    // Group data by occupation
    const groupedData = data.reduce((acc, item) => {
        const occ = item['Detailed Occupation'];
        if (!acc[occ]) {
            acc[occ] = [];
        }
        acc[occ].push(item);
        return acc;
    }, []);

    /* finalize data representation, add percentage change
     * [...,
     *     {
     *        'Detailed Occupation': 'Occupation Name': String,
     *        'Year - XXXX': 'Average Wage': Number,
     *        'Year Change - XXXX': 'Average Wage Percentage Change': Number,
     *        'Min Year': Number,
     *        'Max Year': Number,
     *      }
     * ]
     * */
    const finalData = Object.keys(groupedData).map((occ) => {
        const occData = groupedData[occ];
        const occObj = {};
        occObj['Detailed Occupation'] = occ;
        occObj['Min Year'] = Math.min(...occData.map((item) => item.Year));
        occObj['Max Year'] = Math.max(...occData.map((item) => item.Year));
        occData.forEach((item) => {
            const prevYear = parseInt(item.Year) !== occObj['Min Year'] ? item.Year - 1 : parseInt(item.Year);
            const prevYearData = occData.find((occItem) => parseInt(occItem.Year) === prevYear);
            if (!prevYearData) {
                return;
            }
            occObj[`Year - ${item.Year}`] = item['Average Wage'];
            occObj[`Year Change - ${item.Year}`] =
                percentageChange(item['Average Wage'], prevYearData['Average Wage']);
        });
        return occObj;
    });

    return finalData;
}

const percentageChange = (cur, prev) => {
    return (cur - prev) / prev;
}
