import React, { useState, useEffect } from 'react';
import axiosInstance from "../helpers/axiosInstance";
import { useParams, useHistory } from "react-router-dom"
import isAuthenticated from "../utils/isAuthenticated";

export default function Run() {
    const history = useHistory();
  if (!isAuthenticated()) {
    history.push("/login");
  }
    let { dir, cmd } = useParams();
    const [data, setData] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        (
            async () => {
                axiosInstance()
                    .get("/run/" + dir + "/" + cmd)
                    .then((res) => {
                        setData(res.data);
                    })
                    .catch((err) => {
                        setError(err.message);
                    });
            }
        )();
    }, []);
    return (
        <div>
            {error !== "" && (
                <div className="alert alert-danger" role="alert">
                    <h5 className="alert-heading">Error!</h5>
                    {error}
                </div>
            )}
            <table className="table">
                <thead>
                    <tr>
                        <th>Path</th>
                        <td>{data.path}</td>
                    </tr>
                    <tr>
                        <th>Command</th>
                        <td>{data.command}</td>
                    </tr>
                    <tr>
                        <th>Message</th>
                        <td>{data.message}</td>
                    </tr>
                </thead>
            </table>

        </div>
    );
}