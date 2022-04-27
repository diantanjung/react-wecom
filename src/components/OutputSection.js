import axiosInstance from "../helpers/axiosInstance";
import React, { useEffect, useState } from 'react';

const OutputSection = ({ runpath, username }) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        (
            async () => {
                console.log(runpath);
                if (runpath != '') {
                    runFile();
                }
            }
        )();
    }, []);

    const runFile = () => {
        axiosInstance()
            .post("/run", JSON.stringify({ "path_str": runpath, "username": username }))
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
            <h3>Run Binary File</h3>
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
                                <th width="10%">Exe Path</th>
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

export default OutputSection