import React, {useEffect, useState} from 'react';
import Editor from "@monaco-editor/react";
import axiosInstance from "../helpers/axiosInstance";
import {useLocation} from "react-router-dom";

export default function RunFile() {

    const [data, setData] = useState([]);
    const [error, setError] = useState("");

    const location = useLocation();
    const file = location.pathname.substring(5);

    useEffect(() => {
        (
            async () => {
                axiosInstance()
                    .post("/run", JSON.stringify({"path_str" : file}))
                    .then((res) => {
                        setData(res.data);
                    })
                    .catch((err) => {
                        if (err){
                            if (err.response) {
                                setError(err.response.data.error);
                            } else {
                                setError(err.message);
                            }
                        }
                    });
            }
        )();
    }, []);


    return (
        <div className="container margin-top">
            <div>
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
                                <th>Message</th>
                                <td>{data.message}</td>
                            </tr>
                            </thead>
                        </table>
                    </div>
                }

            </div>
        </div>
    );
}