import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import axiosInstance from "../helpers/axiosInstance";
import isAuthenticated from "../utils/isAuthenticated";
import Editor from "@monaco-editor/react";


export default function EditCode() {
    const history = useHistory();
    if (!isAuthenticated()) {
        history.push("/login");
    }
    let { dir, cmd } = useParams();
    const [code, setCode] = useState([]);

    const [progress, setProgress] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [gomod, setGomod] = useState("");
    const [main, setMain] = useState("");

    useEffect(() => {
        (
            async () => {
                axiosInstance()
                    .get("/command/" + dir + "/" + cmd)
                    .then((res) => {
                        setCode(res.data);
                        setMain(res.data.main_str);
                        setGomod(res.data.gomod_str);
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
    
    const setMainValue = (value, event) => {
        setMain(value);
    }

    const setGomodValue = (value, event) => {
        setGomod(value);
    }

    async function updateCode(e) {
        e.preventDefault();
        setProgress(true);

        let field = {
            "main_str" : main,
            "gomod_str" : gomod,
        }

        axiosInstance()
            .patch("/command/" + dir + "/" + cmd, JSON.stringify(field))
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
        <div>
            <div className="text-center">
                <h4>Edit Code</h4>
            </div>

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
                            <label htmlFor="gomod">go.mod</label>
                            <Editor
                                height="30vh"
                                theme="vs-dark"
                                defaultLanguage="go"
                                value={code.gomod_str}
                                onChange={setGomodValue}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="gomod">main.go</label>
                            <Editor
                                height="90vh"
                                theme="vs-dark"
                                defaultLanguage="go"
                                value={code.main_str}
                                onChange={setMainValue}
                            />
                        </div>
                        <button disabled={progress} className="btn btn-primary btn-lg btn-block" type="submit" onClick={updateCode}>Edit</button>
                    </form>
                </div>
            </div>
        </div>

    );
}