import axiosInstance from "../helpers/axiosInstance";
import React, { useState, useEffect, useRef } from 'react';
import isAuthenticated from '../utils/isAuthenticated';
import Editor from "@monaco-editor/react";
import './Editor.css'
import { useSelector, useDispatch } from 'react-redux'
import { deleteFiletabItem, setDecoration, addBreakpoint, removeBreakpoint, setDecorations, setAktifPath } from "../feature/filetabSlice";

const EditorSection = ({ activeMenu }) => {
    const dispatch = useDispatch();
    const { filetabItems, cursor, aktifTabItem } = useSelector((store) => store.filetabs);
    const [activeMinimap, setActiveMinimap] = useState(true);


    const monacoObjects = useRef(null);

    useEffect(() => {
        if (activeMenu == "open") {
            setActiveMinimap(true);
        } else {
            setActiveMinimap(false);
        }
    }, [activeMenu]);

    const handleEditorDidMount = (editor, monaco) => {
        monacoObjects.current = {
            editor,
            monaco
        };

        if (monacoObjects.current != null) {
            let { monaco, editor } = monacoObjects.current;
            const decors = [];
            if (aktifTabItem.decorations.length > 0) {
                for (let index = 1; index < aktifTabItem.decorations.length; index++) {
                    decors[index] = {
                        decoration: editor.deltaDecorations(
                            [],
                            applyDecoration(new monaco.Range(index, 1, index, 1), aktifTabItem.decorations[index].classNama)
                        ),
                        classNama: aktifTabItem.decorations[index].classNama
                    };
                }
            } else {
                const maxline = editor.getModel().getLineCount();
                for (let index = 1; index <= maxline; index++) {
                    decors[index] = {
                        decoration: editor.deltaDecorations(
                            [],
                            applyDecoration(new monaco.Range(index, 1, index, 1), 'btnMarginCls')
                        ),
                        classNama: 'btnMarginCls'
                    };
                }
            }
            dispatch(setDecorations({ decorations: decors }));
        }

    }

    useEffect(() => {
        if (monacoObjects.current != null && aktifTabItem.decorations.length > 0) {
            let { monaco, editor } = monacoObjects.current;
            // console.log("aktifTabItem", aktifTabItem);
            editor.onMouseDown(function (e) {
                var clsName = e.target.element.className;
                var lineNum = parseInt(e.target.position.lineNumber);
                if (!monacoObjects.current) return;
                if (typeof aktifTabItem.decorations[lineNum] !== 'undefined') {
                    var r = new monaco.Range(lineNum, 1, lineNum, 1);
                    if (clsName.includes("btnMarginCls")) {
                        // console.log("on click btnMarginCls");
                        const breakPoint = editor.deltaDecorations(
                            [aktifTabItem.decorations[lineNum].decoration],
                            applyDecoration(r, 'breakPointCls')
                        );
                        dispatch(addBreakpoint({ line: lineNum, decoration: breakPoint, classNama: 'breakPointCls' }));
                    } else if (clsName.includes('breakPointCls')) {
                        // console.log("on click breakPointCls");
                        const btnMargin = editor.deltaDecorations(
                            [aktifTabItem.decorations[lineNum].decoration],
                            applyDecoration(r, 'btnMarginCls')
                        );
                        dispatch(removeBreakpoint({ line: lineNum, decoration: btnMargin, classNama: 'btnMarginCls' }));
                    }
                }
            });
        }
    }, [aktifTabItem.decorations]);

    useEffect(() => {
        // console.log("change aktifTabItem.filepath", monacoObjects.current);
        if (monacoObjects.current != null && aktifTabItem.decorations.length > 0) {
            // console.log("load decorations", aktifTabItem.decorations.length);
            let { monaco, editor } = monacoObjects.current;
            const decors = [];
            for (let index = 1; index < aktifTabItem.decorations.length; index++) {
                decors[index] = {
                    decoration: editor.deltaDecorations(
                        [],
                        applyDecoration(new monaco.Range(index, 1, index, 1), aktifTabItem.decorations[index].classNama)
                    ),
                    classNama: aktifTabItem.decorations[index].classNama
                };
            }
            dispatch(setDecorations({ decorations: decors }));
        }
    }, [aktifTabItem.filepath]);

    const applyDecoration = (r, c) => [
        {
            range: r,
            options: {
                isWholeLine: true,
                // glyphMarginClassName: c,
                marginClassName: c,
            },
        },
    ]


    const updateFile = async (newValue, e) => {
        const val = {
            "path_str": aktifTabItem.filepath,
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
                        <li className={"nav-item file-item " + (item.filepath == aktifTabItem.filepath && 'aktif')} key={key}>
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