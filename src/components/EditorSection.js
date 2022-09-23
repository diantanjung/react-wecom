import axiosInstance from "../helpers/axiosInstance";
import React, { useState, useEffect, useRef } from 'react';
import isAuthenticated from '../utils/isAuthenticated';
import Editor from "@monaco-editor/react";
import './Editor.css'
import { useSelector, useDispatch } from 'react-redux'
import { deleteFiletabItem, setDecoration, addBreakpoint, removeBreakpoint, setDecorations, setAktifPath } from "../feature/filetabSlice";

const EditorSection = ({ activeMenu }) => {
    const dispatch = useDispatch();
    const { filetabItems, cursor, aktifPath } = useSelector((store) => store.filetabs);
    const [activeMinimap, setActiveMinimap] = useState(true);

    let aktifTabItem = {
        filepath: "Untitled",
        dirpath: "",
        decorations: [],
        breakpoints: [],
        code: " ",
        language: "go"
    }

    if (filetabItems.length > 0) {
        aktifTabItem = filetabItems.find((item) => item.filepath === aktifPath);
    }

    const monacoObjects = useRef(null);

    useEffect(() => {
        if (activeMenu == "open") {
            setActiveMinimap(true);
        } else {
            setActiveMinimap(false);
        }
    }, [activeMenu]);

    const applyDecoration = (r, c) => [
        {
            range: r,
            options: {
                isWholeLine: true,
                glyphMarginClassName: c
            },
        },
    ]


    const updateFile = async (newValue, e) => {
        const val = {
            "path_str": aktifPath,
            "file_str": newValue
        }

        await axiosInstance()
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
    ];

    const handleEditorDidMount = (editor, monaco) => {
        monacoObjects.current = {
            editor,
            monaco
        };

        // setTimeout(function () {
        //     if (monacoObjects.current != null) {
        //         let maxline = monacoObjects.current.editor.getModel().getLineCount();
        //         console.log("test 6 model", monacoObjects.current.editor.getModel());
        //         console.log("test 6", maxline);
        //     }
        // }, 5000);

        if (monacoObjects.current != null) {
            // let { monaco, editor } = monacoObjects.current;
            // if (aktifTabItem.decorations.length > 0) {
            //     console.log("decoration > 0 ");
            //     aktifTabItem.decorations.forEach((item, index) => {
            //         console.log("index ", index, "classnama", item.classNama);
            //         let r = new monaco.Range(index, 1, index, 1);
            //         editor.deltaDecorations(
            //             [],
            //             applyDecoration(r, item.classNama)
            //         );
            //     });
            // } else {
            //     console.log("decoration == 0 ");
            //     let maxline = editor.getModel().getLineCount();
            //     console.log("maxline", maxline);
            //     const rmax = new monaco.Range(1, 1, maxline, 1);
            //     const btnMargin = editor.deltaDecorations(
            //         [],
            //         applyDecoration(rmax, 'btnMarginCls')
            //     );
            //     console.log("btnMargin ", btnMargin);
            //     // dispatch(setDecorations({ filepath: aktifPath, maxline: maxline, decoration: btnMargin, classNama: 'btnMarginCls' }));
            // }

            // console.log("editor model 2 : ", editor.getModel());

            // editor.onMouseDown(function (e) {
            //     var clsName = e.target.element.classList[2];
            //     var lineNum = parseInt(e.target.position.lineNumber);
            //     if (!monacoObjects.current) return;
            //     const { monaco, editor } = monacoObjects.current;
            //     var r = new monaco.Range(lineNum, 1, lineNum, 1);
            //     if (clsName == 'btnMarginCls') {
            //         // bpdecor[lineNum] = editor.deltaDecorations(
            //         //     [],
            //         //     applyDecoration(r, 'breakPointCls')
            //         // );
            //         // setBpdecor(bpdecor);
            //         // saveBpLocal(lineNum);
            //         const decoration = editor.deltaDecorations(
            //             [],
            //             applyDecoration(r, 'breakPointCls')
            //         );
            //         dispatch(setDecoration({ filepath: aktifFile, line: lineNum, decoration, classNama: 'breakPointCls' }));
            //         dispatch(addBreakpoint({ filepath: aktifFile, line: lineNum }));
            //     } else if (clsName == 'breakPointCls') {
            //         // bpdecor[lineNum] = editor.deltaDecorations(
            //         //     [bpdecor[lineNum]],
            //         //     applyDecoration(r, 'btnMarginCls')
            //         // );
            //         // setBpdecor(bpdecor);
            //         // removeBpLocal(lineNum);
            //         const filetabItem = filetabItems.find((item) => item.filepath === aktifFile);
            //         const rmdecor = editor.deltaDecorations(
            //             [filetabItem.decorations[lineNum]],
            //             applyDecoration(r, 'btnMarginCls')
            //         );
            //         // setTimeout(() => {
            //         //     console.log(filetabItem.decorations);
            //         // }, 5000);

            //         dispatch(setDecoration({ filepath: aktifFile, line: lineNum, decoration: rmdecor, classNama: 'btnMarginCls' }));
            //         dispatch(removeBreakpoint({ filepath: aktifFile, line: lineNum }));
            //     }
            // });
        }

    }

    const clickFile = (filepath) => {
        dispatch(setAktifPath({ filepath }));
    }

    const clickClose = (filepath) => {
        dispatch(deleteFiletabItem({ filepath }));
    }

    return (
        <>
            <ul className="nav">
                {filetabItems.length > 0 ?
                    filetabItems.map((item, key) =>
                        <li className={"nav-item file-item " + (item.filepath == aktifPath && 'aktif')} key={key}>
                            <span onClick={() => clickFile(item.filepath)}>{item.filepath} </span>
                            <a href="#" className="btn-close" onClick={() => clickClose(item.filepath)}>x</a>
                        </li>
                    ) :
                    <li className="nav-item file-item aktif">
                        <span onClick={() => clickFile("Untitled")}>Untitled </span>
                        <a href="#" className="btn-close" onClick={() => clickClose("Untitled")}>x</a>
                    </li>
                }
            </ul>
            <br />
            <Editor
                height="80vh"
                theme="vs-dark"
                path={aktifTabItem.filepath}
                defaultLanguage={aktifTabItem.language}
                defaultValue={aktifTabItem.code}
                onMount={handleEditorDidMount}
            />

        </>

    )
}

export default EditorSection