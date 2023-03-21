import React, { useEffect, useMemo } from "react";
import {
  EditorState,
  Compartment,
  StateField,
  StateEffect,
  RangeSet,
  Extension,
} from "@codemirror/state";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  addBreakpoint,
  deleteFiletabItem,
  removeBreakpoint,
  setAktifPath,
} from "../../store/feature/filetabSlice";
import "./Editor.css";
import { go } from "@codemirror/legacy-modes/mode/go";
import { rust } from "@codemirror/legacy-modes/mode/rust";
import {
  EditorView,
  lineNumbers,
  gutter,
  GutterMarker,
  ViewPlugin,
  ViewUpdate
} from "@codemirror/view";
import {
  StreamLanguage,
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { basicSetup } from "codemirror";
import { useSelector } from "react-redux";

// import { extensions, toggleCursor } from "./extensions";

// type EditorProps = {
//   setView: (view: EditorView | null) => void;
// };

const breakpointMarker = new (class extends GutterMarker {
  toDOM() {
    return document.createTextNode("🔴");
  }
})();

//cursor
const cursorEffect = StateEffect.define<{ curpos: number; lastpos: number, on:boolean }>({
  map: (val, mapping) => ({
    curpos: mapping.mapPos(val.curpos),
    lastpos: mapping.mapPos(val.lastpos),
    on: val.on
  }),
});

const cursorMarker = new (class extends GutterMarker {
  toDOM() {
    return document.createTextNode("▶️");
  }
})();

const breakpointClickEffect = StateEffect.define<{ pos: number; on: boolean }>({
  map: (val, mapping) => ({ pos: mapping.mapPos(val.pos), on: val.on }),
});

interface Breakpoint {
  pos: number[];
  linenumber: number[];
}

const breakpointLoadEffect = StateEffect.define<{ pos: number[] }>({
  map: (val, mapping) => ({ pos: val.pos.map((item) => mapping.mapPos(item)) }),
});

// const breakpointLoadEffect2 = StateEffect.define<{ bp: Breakpoint[] }>({
//   map: (val, mapping) => ({ bp: val.bp.map( item => ({pos: mapping.mapPos(item.pos), linenumber:item.linenumber} as Breakpoint) ) }),
// });


export const Editor = () => {
  const editorRef = React.useRef<HTMLElement>(null);
  const [view, setView] = React.useState<EditorView | null>(null);
  const { filetabItems, cursor, aktifTabItem } = useAppSelector(
    (store) => store.filetabs
  );
  const dispatch = useAppDispatch();

  const breakpointState = useMemo<StateField<RangeSet<GutterMarker>>>(
    () =>
      StateField.define<RangeSet<GutterMarker>>({
        create() {
          return RangeSet.empty;
        },
        update(set, transaction) {
          set = set.map(transaction.changes);
          for (let e of transaction.effects) {
            if (e.is(breakpointClickEffect)) {
              if (e.value.on)
                set = set.update({
                  add: [breakpointMarker.range(e.value.pos)],
                });
              else set = set.update({ filter: (from) => from != e.value.pos });
            }

            if (e.is(cursorEffect)) {
              let addMarker = [cursorMarker.range(e.value.curpos)];
              if (e.value.lastpos > 0 && e.value.on) {
                  addMarker.unshift(breakpointMarker.range(e.value.lastpos));
              }

              set = set.update({
                filter: (from) =>
                  from != e.value.curpos && from != e.value.lastpos,
                add: addMarker,
              });
            }

            if (e.is(breakpointLoadEffect)) {
              set = set.update({
                filter: (from) => !e.value.pos.includes(from),
                add: e.value.pos.map((item) => breakpointMarker.range(item)),
              });
            }
          }
          return set;
        },
      }),
    []
  );

  const toggleCursor = (
    view: EditorView,
    currentLn: number,
    lastLn: number
  ) => {
    console.log("currentLn lastLn", currentLn, lastLn);
    
    if (currentLn < 1) return false;
    const curPos = view.state.doc.line(currentLn).from;
    let lastPos = -1;
    let hasBreakpoint = false;
    if (lastLn > 0) {
      lastPos = view.state.doc.line(lastLn).from;
      hasBreakpoint = aktifTabItem.bppos.includes(lastPos);
    }
    console.log("curPos lastpos hasBreakpoint", curPos, lastPos, hasBreakpoint);
    view.dispatch({
      effects: [cursorEffect.of({ curpos: curPos, lastpos: lastPos, on: hasBreakpoint }), EditorView.scrollIntoView(curPos, {
        y: 'center',
      }), ],
      selection: {anchor:curPos, head: curPos},
      // scrollIntoView: true
    });
    view.focus();
  };

  function toggleBreakpoint(view: EditorView, pos: number) {
    let breakpoints = view.state.field(breakpointState);
    let hasBreakpoint = false;
    breakpoints.between(pos, pos, () => {
      hasBreakpoint = true;
    });
    if (hasBreakpoint) {
      dispatch(
        removeBreakpoint({
          bppos: pos,
          bpln: view.state.doc.lineAt(pos).number,
        })
      );
    } else {
      dispatch(
        addBreakpoint({
          bppos: pos,
          bpln: view.state.doc.lineAt(pos).number,
        })
      );
    }

    view.dispatch({
      effects: breakpointClickEffect.of({ pos, on: !hasBreakpoint }),
    });
  }

  const loadBreakpoint = (view: EditorView, pos: number[]) => {
    view.dispatch({
      effects: breakpointLoadEffect.of({ pos }),
    });
  };

  const breakpointGutter = [
    breakpointState,
    gutter({
      class: "cm-breakpoint-gutter",
      markers: (v) => {
        return v.state.field(breakpointState);
      },
      initialSpacer: () => breakpointMarker,
      domEventHandlers: {
        mousedown(view, line) {
          // if (view.state.doc.lineAt(line.from).number == cursor.curLine)
          toggleBreakpoint(view, line.from);
          return true;
        },
      },
    }),
    EditorView.baseTheme({
      ".cm-breakpoint-gutter .cm-gutterElement": {
        color: "red",
        paddingLeft: "5px",
        cursor: "default",
      },
    }),
  ];

  const darkTheme = EditorView.theme(
    {
      "&": {
        color: "white",
        backgroundColor: "#034",
      },
      ".cm-content": {
        caretColor: "#0e9",
      },
      "&.cm-focused .cm-cursor": {
        borderLeftColor: "#0e9",
      },
      "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "#074",
      },
      ".cm-gutters": {
        backgroundColor: "#045",
        color: "#ddd",
        border: "none",
      },
      ".cm-content, .cm-gutter": { minHeight: "1000px" },
    },
    { dark: true }
  );

  const myHighlightStyle = HighlightStyle.define([
    { tag: tags.keyword, color: "#fc6" },
    { tag: tags.comment, color: "#37d0ff", fontStyle: "italic" },
    { tag: tags.string, color: "#A4BE7B" },
    { tag: tags.null, color: "#5D3891" },
  ]);

  const languageConf = new Compartment();

  const autoLanguage = EditorState.transactionExtender.of((tr) => {
    if (!tr.docChanged) return null;

    // if(tr.newDoc.sliceString(0, 10) !== aktifTabItem.code.slice(0, 10)) return null;

    // let docIsGo = aktifTabItem.language === "go";
    const docIsGo = /func +[a-z]+\(\) +{/g.test(tr.newDoc.sliceString(0, 100));
    // let stateIsGo = tr.startState.facet(language) === StreamLanguage.define(go);
    // if (docIsGo == stateIsGo) return null;

    console.log("auto lang");

    return {
      effects: languageConf.reconfigure(
        docIsGo ? StreamLanguage.define(go) : StreamLanguage.define(rust)
      ),
    };
  });

  const extensions = useMemo<Extension[]>(
    () => [
      basicSetup,
      lineNumbers(),
      syntaxHighlighting(myHighlightStyle),
      darkTheme,
      breakpointGutter,
      languageConf.of(StreamLanguage.define(go)),
      autoLanguage,
    ],
    []
  );

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
    console.log("code changed", view);
    if (view === null) return;

    let activeState = EditorState.create({
      doc: aktifTabItem.code,
      extensions,
    });

    view.setState(activeState);

    loadBreakpoint(view, aktifTabItem.bppos);
  }, [aktifTabItem.code]);

  useEffect(() => {
    if (view === null) return;
    // console.log("pos", view.state.doc.line(10).from, line.from);
    // toggleCursor(view, view.state.doc.line(cursor.curLine).from, view.state.doc.line(cursor.lastLine).from);
    toggleCursor(view, cursor.curLine, cursor.lastLine);
  }, [cursor.curPath, cursor.curLine]);

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
