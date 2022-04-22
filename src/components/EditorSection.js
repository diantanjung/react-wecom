import axiosInstance from "../helpers/axiosInstance";
import React, { useState, useEffect } from 'react';
import isAuthenticated from '../utils/isAuthenticated';
import Editor from "@monaco-editor/react";

const EditorSection = ({ filepath, username, activeMenu }) => {
    const [code, setCode] = useState("");
    const [activeMinimap, setActiveMinimap] = useState(true);

    useEffect(() => {
        if(activeMenu == "open"){
            setActiveMinimap(true);
        }else{
            setActiveMinimap(false);
        }
    }, [activeMenu]);

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

    return (
        <Editor
            height="100%"
            theme="vs-dark"
            defaultLanguage="go"
            value={code}
            options={{
                minimap: {
                    enabled: activeMinimap,
                },
            }}
        />
    )
}

export default EditorSection