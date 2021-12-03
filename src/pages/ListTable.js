import {Table} from "react-bootstrap";
import React, { useMemo, useState, useEffect } from 'react';
import { useTable, useExpanded } from 'react-table';
import {
    useQuery,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
} from 'react-query';
import axiosInstance from "../helpers/axiosInstance";

const FetchData = (path) => axiosInstance().post("/opendir", JSON.stringify({"path_str" : path}));


const insertIntoTable = ({ existingRows, subRowsToInsert, path }) => {
    const id = path[0];

    const isBaseCase = path.length === 1;

    if (isBaseCase) {
        return existingRows.map((row, index) => {
            const isMatchedRowWithoutSubRows = index === Number(id) && !row.subRows;

            if (isMatchedRowWithoutSubRows) {
                return {
                    ...row,
                    subRows: subRowsToInsert
                }
            }

            return row;
        });
    }

    return existingRows.map((row, index) => {
        const isMatchedRowWithSubRows = index === Number(id) && row.subRows;

        if (isMatchedRowWithSubRows) {
            const [, ...updatedPath] = path;

            return {
                ...row,
                subRows: insertIntoTable({
                    existingRows: row.subRows,
                    subRowsToInsert,
                    path: updatedPath
                })
            }
        }

        return row;
    });
}

const recursivelyUpdateTable = ({ tableData, childData, id }) => {
    return insertIntoTable({
        existingRows: tableData,
        subRowsToInsert: childData,
        path: id.split('.')
    });
}

const TableQuery = ({file}) => {

    const queryClient = useQueryClient();

    const [tableData, setTableData] = useState(null);
    const [isRowLoading, setIsRowLoading] = React.useState({});

    const handleClickRow = async ({ id, original }) => {
        setIsRowLoading({ [id]: true });
        const { data: childData } = await FetchData(original.path);

        setIsRowLoading({ [id]: false })

        if (tableData) {
            const updatedTableData = recursivelyUpdateTable({ tableData, childData, id });

            setTableData(updatedTableData);
        }
    }

    const {
        data: apiResponse,
        isLoading,
        status,
    } = useQuery(['discussionGroups', file], () => FetchData(file), { enabled: !tableData });

    useEffect(() => {
        setTableData(apiResponse?.data);
    }, [apiResponse])

    if (isLoading || !tableData) {
        return <div>Loading...</div>
    }

    if (status === 'error') {
        return <div>Error get data.</div>
    }

    return (
        <TableInstance
            tableData={tableData}
            onClickRow={handleClickRow}
            isRowLoading={isRowLoading}
        />
    );
}

const TableInstance = ({ tableData, onClickRow, isRowLoading }) => {
    const [columns, data] = useMemo(
        () => {
            const columns = [
                {
                    Header: 'Filename',
                    accessor: 'filename',
                    width: '70%',
                    Cell: ({ row, isLoading, isExpanded }) => {
                        const toggleRowExpandedProps = row.getToggleRowExpandedProps();

                        const onClick = async event => {
                            if (!isLoading && row.original.isdir) {
                                if (!isExpanded) {
                                    await onClickRow(row);
                                }
                                toggleRowExpandedProps.onClick(event);
                            }
                        }

                        // if (isLoading) {
                        //     return <span>🔄</span>
                        // }

                        return (
                            <span
                                {...row.getToggleRowExpandedProps({
                                    style: {
                                        paddingLeft: `${row.depth}rem`,
                                    },
                                })}
                                onClick={onClick}
                            >
                {
                    row.original.isdir ? (row.isExpanded ? '▼' : '▶') : <span style={{paddingLeft:`1rem`}}></span>

                } {row.original.filename} </span>

                        )
                    },
                },
                // {
                //     Header: 'Is Directory',
                //     accessor: 'isdir',
                //     Cell: props => <div> { props.value ? 'true' : 'false' } </div>
                // },
                {
                    Header: 'Size(B)',
                    accessor: 'size',
                    width: '15%'
                },
                {
                    Header: 'Modified Time',
                    accessor: 'mod_time',
                    width: '15%'
                }
            ];
            return [columns, tableData];
        },
        [tableData]
    );

    const tableInstance = useTable(
        { columns, data, autoResetExpanded: false },
        useExpanded
    );

    return (
        <TableLayout
            {...tableInstance}
            isRowLoading={isRowLoading}
        />
    );
}

const TableLayout = ({
                         getTableProps,
                         getTableBodyProps,
                         headerGroups,
                         rows,
                         prepareRow,
                         isRowLoading,
                         state: { expanded }
                     }) => {
    return (
        <Table {...getTableProps()}>
            <thead>
            {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                        <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                    ))}
                </tr>
            ))}
            </thead>
            <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
                prepareRow(row)

                return (
                    <tr {...row.getRowProps()}>
                        {row.cells.map(cell => {
                            return <td {...cell.getCellProps(
                                {
                                    style: {
                                        width: cell.column.width,
                                    },
                                }
                            )} >
                                {cell.render('Cell', {
                                    isLoading: isRowLoading[row.id],
                                    isExpanded: expanded[row.id],
                                })}
                            </td>
                        })}
                    </tr>
                )
            })}
            </tbody>
        </Table>
    );
}

const client = new QueryClient();

const ListTable = ({file}) => {
    return (
        <QueryClientProvider client={client}>
            <TableQuery file={file} />
        </QueryClientProvider>
    );
}

export default ListTable;
