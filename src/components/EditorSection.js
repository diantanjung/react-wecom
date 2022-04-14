import axiosInstance from "../helpers/axiosInstance";
import React, { useState, useEffect } from 'react';
import Editor from "@monaco-editor/react";

const EditorSection = ({ filepath, username }) => {
    const [code, setCode] = useState("");

    useEffect(() => {
        (
            async () => {
                if (filepath != '') {
                    openDirFile();
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

    return (
        <Editor
            height="100%"
            theme="vs-dark"
            defaultLanguage="go"
            value={code}
            options={{
                minimap: {
                    enabled: false,
                },
            }}
        />
    )
}

export default EditorSection