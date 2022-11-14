import { useState, useMemo } from 'react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    useSortBy
} from '@tanstack/react-table';
import { handleData } from '../helpers/handleData';

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

const createColumns = () => {
    const columnHelper = createColumnHelper();

    const columns = [
        columnHelper.accessor('Detailed Occupation', {
            cell: info => <span title={info.getValue()}>{info.getValue()}</span>,
            header: () => <span aria-label='Occupation' title='Occupation'>Occupation</span>,
            footer: info => <span aria-label='Occupation' title='Occupation'>Occupation</span>
        })
    ];

    const minYear = 2014;
    const maxYear = 2020;
    for (let i = maxYear; i >= minYear; i--) {
        columns.push(
            columnHelper.accessor(row => {
                const info = row[`Year - ${i}`];
                const change = row[`Year Change - ${i}`] ? row[`Year Change - ${i}`] : 0;
                if (info) {
                    return intl.format(info) + '%' + change;
                }
                return 'N/A%0';
            }, {
                id: `Year - ${i}`,
                cell: info => {
                    let [value, change] = info.getValue().split('%');
                    if (change) {
                        change = parseFloat(change);
                        const changeClass = change > 0 ? 'change-increase' : (change < 0 ? 'change-decrease' : 'change-none');
                        return (
                            <span
                                className={['table-cell', 'table-' + changeClass, value === 'N/A' ? 'table-change-na' : ""].join(' ')}
                                title={prcnt.format(change)}>
                                <span className="cell-value">{value}</span>
                            </span>
                        );
                    }
                    return (
                        <span className='table-cell' title='0%'>
                            <span className="cell-value" title={value}>{value}</span>
                        </span>
                    );
                },
                header: () => <span title={`Year ${i}`}>{i}</span>,
                footer: info => <span>{i}</span>,
                sortingFn: (a, b) => {
                    a = a.original[`Year - ${i}`];
                    b = b.original[`Year - ${i}`];
                    return a < b ? -1 : (b < a ? 1 : 0);
                }
            })
        );
    }

    return columns;
}

function TabulatedData({dataRaw, loading, error}) {
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

    return (
        <div className="table-container">
            <table>
                <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                        <th key={header.id} {...{
                            className: (header.column.getCanSort() ? 'cursor-pointer select-none column-sortable' : "") + ({'asc': ' column-asec', 'desc': ' column-desc'}[header.column.getIsSorted()] ?? ""),
                            onClick: header.column.getToggleSortingHandler(),
                        }} aria-sort={{'asc': 'ascending', 'desc': 'descending'}[header.column.getIsSorted()] ?? "other"}>
                        {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </th>
                    ))}
                    </tr>
                ))}
                </thead>
                <tbody>
                {loading && <tr><td colSpan="100%" className="loading">Loading</td></tr>}
                {error && <tr><td colSpan="100%" className="error">An Error Has Ocurred</td></tr>}
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
                    </tr>
                ))}
                </tbody>
                <tfoot>
                {table.getFooterGroups().map(footerGroup => (
                    <tr key={footerGroup.id}>
                    {footerGroup.headers.map(header => (
                        <th key={header.id}>
                        {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.footer,
                                header.getContext()
                            )}
                        </th>
                    ))}
                    </tr>
                ))}
                </tfoot>
            </table>
        </div>
    )
};

export default TabulatedData