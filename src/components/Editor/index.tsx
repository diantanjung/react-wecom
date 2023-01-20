import React, { useEffect, useState } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { extensions } from "./extensions";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  deleteFiletabItem,
  setAktifPath,
} from "../../store/feature/filetabSlice";
import "./Editor.css"

// type EditorProps = {
//   setView: (view: EditorView | null) => void;
// };

export const Editor = () => {
  const editorRef = React.useRef<HTMLElement>(null);
  const [view, setView] = React.useState<EditorView | null>(null);
  const { filetabItems, cursor, aktifTabItem } = useAppSelector(
    (store) => store.filetabs
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (editorRef.current === null) return;

    const EdView = new EditorView({
      state: EditorState.create({
        doc: aktifTabItem.code,
        extensions,
      }),
      parent: editorRef.current,
    });

    setView(EdView);

    return () => {
      EdView.destroy();
      setView(null);
    };
  }, [editorRef.current]);

  useEffect(() => {
    if (view === null) return;
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: aktifTabItem.code,
      },
    });
  }, [aktifTabItem.code]);

  return (
    <>
      <ul className="nav">
        {filetabItems.length > 0 ? (
          filetabItems.map((item, key) => (
            <li
              className={
                "nav-item file-item " +
                (item.filepath == aktifTabItem.filepath && "aktif")
              }
              key={key}
            >
              <span
                onClick={() =>
                  dispatch(setAktifPath({ filepath: item.filepath }))
                }
              >
                {item.filepath}{" "}
              </span>
              <a
                href="#"
                className="btn-close"
                onClick={() =>
                  dispatch(deleteFiletabItem({ filepath: item.filepath }))
                }
              >
                x
              </a>
            </li>
          ))
        ) : (
          <li className="nav-item file-item aktif">
            <span
              onClick={() => dispatch(setAktifPath({ filepath: "Untitled" }))}
            >
              Untitled{" "}
            </span>
            <a
              href="#"
              className="btn-close"
              onClick={() =>
                dispatch(deleteFiletabItem({ filepath: "Untitled" }))
              }
            >
              x
            </a>
          </li>
        )}
      </ul>
      <br />
      <section ref={editorRef} />
    </>
  );
};
