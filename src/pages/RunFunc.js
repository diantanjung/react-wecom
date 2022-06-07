import axiosInstance from "../helpers/axiosInstance";
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from "react-router-dom";


const RunFunc = () => {
    let { username } = useParams();
    let query = useQuery();
    let args = {}

    let location = useLocation();
    let runpath = location.pathname.substring(username.length + 3);

    query.forEach(
        (val, key) => {
            args[key] = val;
        }
    );

    console.log(args);
    
    const [data, setData] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        (
            async () => {
                if (runpath != '') {
                    runFunc();
                }
            }
        )();
    }, []);

    const runFunc = () => {
        axiosInstance()
            .get('/runfunc', {
                params: {
                    args: args,
                    path_str: runpath,
                    username: username,
                }
            })
            // .post("/runfunc", JSON.stringify({ "path_str": runpath, "username": username }))
            .then((res) => {
                setData(res.data);
            })
            .catch((err) => {
                if (err) {
                    if (err.response) {
                        setError(err.response.data.error);
                    } else {
                        setError(err.message);
                    }
                }
            });
    }

    return (
        <div className="container margin-top">
            <h3>Run Function</h3>
            {error !== "" ?
                <div className="alert alert-danger" role="alert">
                    <h5 className="alert-heading">Error!</h5>
                    {error}
                </div>
                :
                <div className="row">
                    <table className="table">
                        <thead>
                            <tr>
                                <th width="10%">Function</th>
                                <td width="90%">{data.path}</td>
                            </tr>
                            <tr>
                                <th>Output</th>
                                <td>{data.message}</td>
                            </tr>
                        </thead>
                    </table>
                </div>
            }

        </div>
    )
}

function useQuery() {
    const { search } = useLocation();
  
    return React.useMemo(() => new URLSearchParams(search), [search]);
  }

export default RunFunc