import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from "react-router-dom";
import axiosInstance from "../helpers/axiosInstance";
import Editor from "@monaco-editor/react";
import { Tab, Table, Tabs } from "react-bootstrap";
import ListTable from "./ListTable";
import './OpenDir.css';

export default function Open() {
    let { username } = useParams();
    const [code, setCode] = useState("");

    const [progress, setProgress] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [field, setField] = useState("");

    let location = useLocation();
    let file = location.pathname.substring(username.length + 3);

    //dir var
    const [data, setData] = useState([]);
    const pathArr = file.split("/");
    let dirLink = "";

    const [isdir, setIsdir] = useState(false);
    const [isrun, setIsrun] = useState(false);

    useEffect(() => {
        (
            async () => {
                if (!pathArr.at(-1).includes(".")) {
                    setIsrun(true);
                    runFile();
                } else {
                    setIsrun(false);
                    openDirFile();
                }

            }
        )();
    }, []);

    const runFile = () => {
        axiosInstance()
            .post("/run", JSON.stringify({ "path_str": file, "username": username }))
            .then((res) => {
                setData(res.data);
            })
            .catch((err) => {
                // if (err){
                //     if (err.response) {
                //         setError(err.response.data.error);
                //     } else {
                //         setError(err.message);
                //     }
                // }
                setIsrun(false);
                openDirFile();
            });
    }

    const openDirFile = () => {
        axiosInstance()
            .post("/opendirfile", JSON.stringify({ "path_str": file, "username": username }))
            .then((res) => {
                if (res.data.is_dir) {
                    setIsdir(true);
                    setData(res.data.dir_list);
                } else {
                    setIsdir(false);
                    setCode(res.data.file_str);
                }

            })
            .catch((err) => {
                if (err.response) {
                    setError(err.response.data.error);
                } else {
                    setError(err.message);
                }
            });
    }



    const setValue = (value, event) => {
        setField(value);
    }

    async function updateFile(e) {
        e.preventDefault();
        setProgress(true);

        let val = {
            "path_str": file,
            "file_str": field
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

    const GridContent = () => (
        <div className="row">
            {
                data && data.length > 0 && data.map((item) =>
                    <div className="card border-0" style={{ width: "15rem" }} key={item.id}>
                        <div className="card-body">
                            {
                                item.isdir ?
                                    <svg aria-label="Directory" aria-hidden="true" height="32" viewBox="0 0 16 16" version="1.1"
                                        width="42" data-view-component="true" fill="currentColor" style={{ color: "#54aeff" }}>
                                        <path
                                            d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3h-6.5a.25.25 0 01-.2-.1l-.9-1.2c-.33-.44-.85-.7-1.4-.7h-3.5z" />
                                    </svg>
                                    :
                                    <svg aria-label="File" aria-hidden="true" height="32" viewBox="0 0 16 16" version="1.1" width="42"
                                        data-view-component="true" className="octicon octicon-file color-icon-tertiary">
                                        <path
                                            d="M3.75 1.5a.25.25 0 00-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V6H9.75A1.75 1.75 0 018 4.25V1.5H3.75zm5.75.56v2.19c0 .138.112.25.25.25h2.19L9.5 2.06zM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25V1.75z"></path>
                                    </svg>
                            }
                            <br />
                            <a href={"/@" + username + dirLink + "/" + item.filename} className="text-center">{item.filename}</a>
                        </div>
                    </div>
                )}
        </div>
    )


    return (
        <div className="container margin-top">
            {
                isrun ?
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
                    :
                    (
                        isdir ?
                            <div>
                                {error !== "" && (
                                    <div className="alert alert-danger" role="alert">
                                        <h5 className="alert-heading">Error!</h5>
                                        {error}
                                    </div>
                                )}
                                <div className="row">
                                    <h5>
                                        {
                                            pathArr && pathArr.length > 0 && pathArr.map(
                                                (item, key) => {
                                                    dirLink += "/" + item;
                                                    return key < pathArr.length - 1 ?
                                                        <span key={key}><a
                                                            href={"/@" + username + dirLink}>{item}</a> / </span>
                                                        :
                                                        <span key={key}><a
                                                            href={"/@" + username + dirLink}>{item}</a> </span>;

                                                })
                                        }
                                    </h5>
                                </div>
                                <div className="margin-top">
                                    <Tabs defaultActiveKey="grid" id="controlled-tab">
                                        <Tab eventKey="grid"
                                            title={<span><i className="fa fa-th-large"></i> Grid</span>}>
                                            <GridContent />
                                        </Tab>
                                        <Tab eventKey="list" title={<span><i className="fa fa-bars"></i> List</span>}>
                                            {/*<ListContent />*/}
                                            <ListTable file={file} />
                                        </Tab>
                                    </Tabs>
                                </div>

                            </div>
                            :
                            <div>
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
                                    {error == "" && (
                                        <div>
                                            <div>
                                                <form>

                                                    <div>
                                                        <label htmlFor="file">{file}</label>
                                                        <Editor
                                                            height="75vh"
                                                            theme="vs-dark"
                                                            defaultLanguage="go"
                                                            value={code}
                                                            onChange={setValue}
                                                        />
                                                    </div>
                                                    <div className='margin-top btn-width'>
                                                        <button disabled={progress} className="btn btn-primary btn-lg btn-block"
                                                            type="submit" onClick={updateFile}>Edit
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                    )
            }

        </div>
    )
}