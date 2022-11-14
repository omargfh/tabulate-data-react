# Tabulate Data in React using TanStack (React)
## Description
First, this code begins by fetching average income data in the United States from [Data USA](datausa.io)'s public API.
```js
useEffect(() => {
      if (fetches) {
        return;
      }
      else {
        fetches++;
      }
      fetch(endpoints.datausa_wages)
          .then((res) => res.json())
          .then((data) => {
              setData(data.data);
              setLoading(false);
          })
          .catch((err) => {
            console.log(err);
              setError(true);
              setLoading(false);
          })
  }, []);
```

Then, it groups the resulting data by occupation, then loops through each occupation to extract the median income and compute the percentage change between each two consecutive years.

```js
const groupedData = data.reduce((acc, item) => {
    const occ = item['Detailed Occupation'];
    if (!acc[occ]) {
        acc[occ] = [];
    }
    acc[occ].push(item);
    return acc;
}, []);

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
```

Third, it memoizes this data and builds the render column interface required to implement an instance of TanStack table.

```js
const data = useMemo(() => handleData(dataRaw), [dataRaw]);
const columns = useMemo(() => createColumns(), []);
const [sorting, setSorting] = useState([]);
const table = useReactTable({
    data,
    columns,
    state: {
        sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
}, useSortBy);
```

It also uses the Javascript Internationalization API to render dollar-values and percentages.
```js
const intl = new Intl['NumberFormat']('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const prcnt = new Intl['NumberFormat']('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
```

Fourth, it render the TanStack instance as per documentation (see `./src/components/TabulatedData.js`).

Additionally, it also uses `SortingState` from `@tanstack/react-table` to implement sorting using a custom function.
```js
sortingFn: (a, b) => {
    a = a.original[`Year - ${i}`];
    b = b.original[`Year - ${i}`];
    return a < b ? -1 : (b < a ? 1 : 0);
}
```
This ensures that N/A values are always toward the end of the sorted list.

Finally, *for the visual highlight part*, the table uses text if the mean income for a specific occupation increased from the year prior. A red text is used in the opposite scenario, while a black text indicates lack of data to compare against.
```css
span.table-cell.table-change-increase {
    color: #12a812;
}

span.table-cell.table-change-decrease {
    color: #e11616;
}

span.table-cell.table-change-none {
    color: rgb(67, 67, 67);
}

span.table-cell.table-change-na {
    color: #888!important;
    font-style: italic;
}
```

The code also encapsulates the table in a dummy article.