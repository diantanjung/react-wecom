import React, {useEffect, useState} from 'react';
import Editor from "@monaco-editor/react";
import axiosInstance from "../helpers/axiosInstance";
import {useLocation} from "react-router-dom";

export default function OpenFile() {

    // let {file } = useParams();
    const [code, setCode] = useState("");

    const [progress, setProgress] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [field, setField] = useState("");

    let location = useLocation();
    let file = location.pathname.substring(10);

    useEffect(() => {
        (
            async () => {
                axiosInstance()
                    .post("/open", JSON.stringify({"path_str" : file}))
                    .then((res) => {
                        setCode(res.data.file_str);
                    })
                    .catch((err) => {
                        if (err.response) {
                            setError(err.response.data.error);
                        } else {
                            setError(err.message);
                        }
                    });
            }
        )();
    }, []);

    const setValue = (value, event) => {
        setField(value);
    }

    async function updateFile(e) {
        e.preventDefault();
        setProgress(true);

        let val = {
            "path_str" : file,
            "file_str" : field
        }

        axiosInstance()
            .patch("/open", JSON.stringify(val))
            .then((res) => {
                setSuccess(true);
                setError("");
            })
            .catch((err) => {
                if (err.response) {
                    setError(err.response.data.error);
                } else {
                    setError(err.message);
                }
                setSuccess(false);
            });

        setProgress(false)
    }

    return (
        <div className="container">
            <h5>Edit File</h5>
            <div>
                {success && (
                    <div className="alert alert-success" role="alert">
                        <h5 className="alert-heading">Success!</h5>
                        Success edit code.
                    </div>
                )}
                {error !== "" && (
                    <div className="alert alert-danger" role="alert">
                        <h5 className="alert-heading">Error!</h5>
                        {error}
                    </div>
                )}
                <div className="row">
                    <div>
                        <form>

                            <div className="mb-3">
                                <label htmlFor="file">{file}</label>
                                <Editor
                                    height="75vh"
                                    theme="vs-dark"
                                    defaultLanguage="go"
                                    value={code}
                                    onChange={setValue}
                                />
                            </div>
                            <button disabled={progress} className="btn btn-primary btn-lg btn-block" type="submit" onClick={updateFile}>Edit</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}