import axiosInstance from "../helpers/axiosInstance";
import React, { useState, useEffect, useRef } from 'react';
import isAuthenticated from '../utils/isAuthenticated';
import Editor from "@monaco-editor/react";
import './Editor.css'

const EditorSection = ({ filepath, username, activeMenu, breakpoints, setBreakpoints, curbp, lastbp }) => {
    const [code, setCode] = useState("");
    const [activeMinimap, setActiveMinimap] = useState(true);
    const [language, setLanguage] = useState("go");

    const monacoObjects = useRef(null);

    // var breakPoint = [];
    const [bpdecor, setBpdecor] = useState([]);

    useEffect(() => {
        if (activeMenu == "open") {
            setActiveMinimap(true);
        } else {
            setActiveMinimap(false);
        }
    }, [activeMenu]);

    useEffect(() => {
        // let bpTemp = [];
        if (monacoObjects.current && curbp > 0) {
            const { monaco, editor } = monacoObjects.current;
            let r = new monaco.Range(curbp, 1, curbp, 1);
            bpdecor[curbp] = editor.deltaDecorations(
                [],
                applyDecoration(r, 'currentBp')
            );
            setBpdecor(bpdecor);
            if (lastbp > 0) {
                let rl = new monaco.Range(lastbp, 1, lastbp, 1);
                bpdecor[lastbp] = editor.deltaDecorations(
                    [bpdecor[lastbp]],
                    applyDecoration(rl, 'breakPointCls')
                );
                setBpdecor(bpdecor);
            }

        }
    }, [curbp]);

    useEffect(() => {
        let sls = filepath.slice(-3);
        if (sls == ".go") {
            setLanguage("go");
        } else if (sls == ".rs") {
            setLanguage("rust");
        } else if (sls == ".rkt") {
            setLanguage("racket");
        }
    }, [filepath]);

    useEffect(() => {
        localStorage.bps = JSON.stringify([]);
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



    const currentBp = (r) => [
        {
            range: r,
            options: {
                isWholeLine: true,
                glyphMarginClassName: 'currentBp'
            },
        },
    ]

    const applyDecoration = (r, c) => [
        {
            range: r,
            options: {
                isWholeLine: true,
                glyphMarginClassName: c
            },
        },
    ]

    const handleEditorDidMount = (editor, monaco) => {
        let maxline = editor.getModel().getLineCount();
        // var breakPoint = [];
        const rmax = new monaco.Range(1, 1, maxline, 1);
        var btnMargin = editor.deltaDecorations(
            [],
            applyDecoration(rmax, 'btnMarginCls')
        );

        editor.onMouseDown(function (e) {
            var clsName = e.target.element.classList[2];
            var lineNum = parseInt(e.target.position.lineNumber);
            if (!monacoObjects.current) return;
            const { monaco, editor } = monacoObjects.current;
            var r = new monaco.Range(lineNum, 1, lineNum, 1);
            if (clsName == 'btnMarginCls') {
                bpdecor[lineNum] = editor.deltaDecorations(
                    [],
                    applyDecoration(r, 'breakPointCls')
                );
                setBpdecor(bpdecor);
                saveBpLocal(lineNum);
            } else if (clsName == 'breakPointCls') {
                bpdecor[lineNum] = editor.deltaDecorations(
                    [bpdecor[lineNum]],
                    applyDecoration(r, 'btnMarginCls')
                );
                setBpdecor(bpdecor);
                removeBpLocal(lineNum);

            }
        });

        monacoObjects.current = {
            editor,
            monaco
        };
    }

    const saveBreakpoints = (bp) => {
        setBreakpoints(bp);
    }

    const removeBp = (lineNum) => {
        var index = breakpoints.indexOf(lineNum);
        if (index !== -1) {
            setBreakpoints([
                ...breakpoints.splice(index, 1)
            ]);
        }
        // setBreakpoints([
        //     ...breakpoints.slice(0, index),
        //     ...breakpoints.slice(index + 1)
        // ]);
    }

    const saveBpLocal = (line) => {
        var bps = [];
        if (localStorage.bps) {
            bps = JSON.parse(localStorage.bps);
            bps.push(line);
        } else {
            bps[0] = line;
        }
        localStorage.bps = JSON.stringify(bps);
        saveBreakpoints(bps);
    }

    const removeBpLocal = (line) => {
        if (localStorage.bps) {
            var bps = JSON.parse(localStorage.bps);
            var index = bps.indexOf(line);
            if (index > -1) {
                bps.splice(index, 1);
            }
            localStorage.bps = JSON.stringify(bps);
            saveBreakpoints(bps);
        }
    }
    const changeBp = (n) => {

    }

    return (
        <>
            <Editor
                height="100%"
                theme="vs-dark"
                defaultLanguage={language}
                value={code}
                onChange={updateFile}
                onMount={handleEditorDidMount}
                options={{
                    minimap: {
                        enabled: activeMinimap
                    },
                    glyphMargin: true
                }}
            />
        </>

    )
}

export default EditorSection