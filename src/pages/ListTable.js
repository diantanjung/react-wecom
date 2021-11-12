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
import {useLocation} from "react-router-dom";

const ListTable1 = ({data, dirLink}) => {
    return (
        <div className="row margin-top">
            <Table hover>
                <thead>
                <tr>
                    <th colSpan="2">File Name</th>
                    <th>Size(B)</th>
                    <th>Modified Time</th>
                </tr>
                </thead>
                <tbody>
                {
                    data && data.length>0 && data.map((item) =>
                        <tr key={item.id}>
                            <td width="2%">
                                {
                                    item.isdir ?
                                        <svg aria-label="Directory" aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1"
                                             width="16" data-view-component="true" fill="currentColor" style={{color: "#54aeff"}}>
                                            <path
                                                d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3h-6.5a.25.25 0 01-.2-.1l-.9-1.2c-.33-.44-.85-.7-1.4-.7h-3.5z"/>
                                        </svg>
                                        :
                                        <svg aria-label="File" aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16"
                                             data-view-component="true" className="octicon octicon-file color-icon-tertiary">
                                            <path
                                                d="M3.75 1.5a.25.25 0 00-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V6H9.75A1.75 1.75 0 018 4.25V1.5H3.75zm5.75.56v2.19c0 .138.112.25.25.25h2.19L9.5 2.06zM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25V1.75z"></path>
                                        </svg>
                                }
                            </td>
                            <td width="66%">
                                <a href={
                                    item.isdir ?
                                        "/opendir" + dirLink + "/" + item.filename
                                        :
                                        "/editfile" + dirLink + "/" + item.filename
                                } className="text-center">
                                    {item.filename}
                                </a>
                            </td>
                            <td width="10%">{item.size}</td>
                            <td width="20%">{item.mod_time}</td>
                        </tr>
                    )
                }
                </tbody>
            </Table>
        </div>
    );
};

const FetchData = (path) => axiosInstance().post("/opendir", JSON.stringify({"path_str" : path}));


const insertIntoTable = ({ existingRows, subRowsToInsert, path }) => {
    const id = path[0];
    let updatedRows;

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

                        if (isLoading) {
                            return <span>🔄</span>
                        }

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
                    Header: 'Size',
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
