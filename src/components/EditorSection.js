import axiosInstance from "../helpers/axiosInstance";
import React, { useState, useEffect } from 'react';
import isAuthenticated from '../utils/isAuthenticated';
import Editor from "@monaco-editor/react";

const EditorSection = ({ filepath, username, activeMenu }) => {
    const [code, setCode] = useState("");
    const [activeMinimap, setActiveMinimap] = useState(true);
    const [language, setLanguage] = useState("go");

    useEffect(() => {
        if (activeMenu == "open") {
            setActiveMinimap(true);
        } else {
            setActiveMinimap(false);
        }
    }, [activeMenu]);

    useEffect(() => {
        let sls = filepath.slice(-3);
        if ( sls == ".go") {
            setLanguage("go");
        } else if( sls == ".rs") {
            setLanguage("rust");
        }
    }, [filepath]);

    useEffect(() => {
        (
            async () => {
                if (filepath != '') {
                    if (isAuthenticated()) {
                        openDirFile();
                    } else {
                        gopenDirFile();
                    }
                }
            }
        )();
    }, []);

    const openDirFile = () => {
        axiosInstance()
            .post("/opendirfile", JSON.stringify({ "path_str": filepath, "username": username }))
            .then((res) => {
                setCode(res.data.file_str);
            })
            .catch((err) => {
                if (err.response) {
                    setCode(err.response.data.error);
                } else {
                    setCode(err.message);
                }
            });
    }

    const gopenDirFile = () => {
        axiosInstance()
            .post("/gopendirfile", JSON.stringify({ "path_str": filepath, "username": "guest" }))
            .then((res) => {
                setCode(res.data.file_str);
            })
            .catch((err) => {
                if (err.response) {
                    setCode(err.response.data.error);
                } else {
                    setCode(err.message);
                }
            });
    }

    const updateFile = (newValue, e) => {
        let val = {
            "path_str": filepath,
            "file_str": newValue
        }

        axiosInstance()
            .patch("/open", JSON.stringify(val))
            .then((res) => {
                console.log("data updated");
            })
            .catch((err) => {
                console.log("error updated");
            });
    }

    return (
        <Editor
            height="100%"
            theme="vs-dark"
            defaultLanguage={language}
            value={code}
            onChange={updateFile}
            options={{
                minimap: {
                    enabled: activeMinimap,
                },
            }}
        />
    )
}

export default EditorSection