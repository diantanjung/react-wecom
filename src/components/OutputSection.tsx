import axiosInstance from "../helpers/axiosInstance";
import React, { useEffect, useState } from 'react';

type OutputSectionProps = {
    runpath: string
    username: string
}

type DataResponse = {
    path: string
    message: string
}

const OutputSection = ({ runpath, username }: OutputSectionProps) => {
    const [data, setData] = useState<DataResponse>({path: "", message: ""});
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
                                <th style={{width: "10%"}}>Exe Path</th>
                                <td style={{width: "90%"}}>{data.path}</td>
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