import React, { createElement, useEffect, useMemo } from "react";
import { EditorState, Compartment, StateField, StateEffect, RangeSet, Extension} from "@codemirror/state";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { addBreakpoint, deleteFiletabItem, goDefinition, removeBreakpoint, setAktifPath } from "../../store/feature/filetabSlice";
import "./Editor.css";
import { go } from "@codemirror/legacy-modes/mode/go";
import { rust } from "@codemirror/legacy-modes/mode/rust";
import { EditorView, lineNumbers, gutter, GutterMarker, keymap, Decoration, WidgetType } from "@codemirror/view";
import { StreamLanguage, HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { basicSetup } from "codemirror";
import {indentWithTab} from "@codemirror/commands"
import {solarizedLight } from "@uiw/codemirror-theme-solarized"
import { KBarProvider, KBarPortal, KBarPositioner, KBarAnimator, KBarSearch } from "kbar";
import axios from "axios";
import { ColorRing } from  'react-loader-spinner'
import {  setFinalCodeAccept, setFinalCodeCancel, setResponseOpenAi } from "../../store/feature/openAiSlice";
const Diff = require('diff');

const editorCache = new Map();

const breakpointMarker = new (class extends GutterMarker {
  toDOM() {
    return document.createTextNode("🔴");
  }
})();

const cursorCurEffect = StateEffect.define<{ curpos: number }>({
  map: (val, mapping) => ({ curpos: mapping.mapPos(val.curpos) }),
});

const cursorLastEffect = StateEffect.define<{ lastpos: number; on: boolean }>({
  map: (val, mapping) => ({ lastpos: mapping.mapPos(val.lastpos), on: val.on }),
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


const changedLineGutterMarker = /*@__PURE__*/new class extends GutterMarker {
  constructor() {
      super();
      this.elementClass = "cm-changedLineGutter";
  }
};

const greenHighlightMark = Decoration.line({
  attributes: {style: 'background-color: #c7e7c7;'}, // green
});

const redHighlightMark = Decoration.line({
  attributes: {style: 'background-color: #fdd3ce'}, // red
});

const brType = new class extends WidgetType {
  toDOM() {
    let br = document.createElement('br');
    return br;
  }
}

const br = Decoration.widget({
  widget: brType
});

const greeHighlight = StateEffect.define<{pos: number[]}>();
const redHighlight = StateEffect.define<{pos: number[]}>();
const clearEffect = StateEffect.define<{pos: number}>();
const buttonForm = StateEffect.define<{pos: number}>();

export const Editor = () => {
  const editorRef = React.useRef<HTMLElement>(null);
  // const [view, setView] = React.useState<EditorView | null>(null);
  const [views, setViews] = React.useState<Map<string, EditorView>>();
  const { filetabItems, cursor, aktifTabItem, } = useAppSelector(
    (store) => store.filetabs
  );
  const { finalCode, endPos, startPos } = useAppSelector(
    (store) => store.openai
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
              // console.log("run breakpointClickEffect");
              if (e.value.on)
                set = set.update({
                  add: [breakpointMarker.range(e.value.pos)],
                });
              else set = set.update({ filter: (from) => from != e.value.pos });
            }

            if (e.is(cursorCurEffect)) {
              // console.log("run cursorCurEffect");
              // if (e.value.lastpos > 0 && e.value.on) {
              //   addMarker.unshift(breakpointMarker.range(e.value.lastpos));
              // }

              set = set.update({
                filter: (from) => from != e.value.curpos,
                add: [cursorMarker.range(e.value.curpos)],
              });
            }

            if (e.is(cursorLastEffect)) {
              // console.log("run cursorLastEffect");
              set = set.update({
                filter: (from) => from != e.value.lastpos,
                add: e.value.on
                  ? [breakpointMarker.range(e.value.lastpos)]
                  : [],
              });
            }

            if (e.is(breakpointLoadEffect)) {
              // console.log("run breakpointLoadEffect");
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

  useEffect(() => {

    if (startPos == undefined || startPos < 0) return;
    if (endPos == undefined || endPos < 0) return;
    if (finalCode == undefined || finalCode == "") return;

    let curEditor = editorCache.get(aktifTabItem.filepath);
    curEditor.dispatch({
      changes: [
        {from:  startPos, to: endPos}, 
        {from:  startPos, to: endPos, insert: finalCode + "\n"} 
      ],
      effects: [clearEffect.of({pos: 0})]
    })
  },[finalCode]);
  
  
  class cancelBtnTypeCls extends WidgetType {
    
    constructor(readonly checked: boolean) { super() }

    eq(other: cancelBtnTypeCls) { return  true }

    toDOM() {
      let btn = document.createElement('button');
      btn.innerHTML = `<i class="fa fa-times"></i>`;
      btn.className = "btn btn-danger btn-sm btn-circle"; 
      let br = document.createElement('br');
      btn.parentNode?.insertBefore(br, btn.nextSibling);
      btn.onclick = function()
      {
        dispatch(
          setFinalCodeCancel()
        )
      }
      return btn;
    }
  }

  const cancelBtnType = new cancelBtnTypeCls(true)

  const cancelBtn = Decoration.widget({
    widget: cancelBtnType,
  });

  const acceptBtnType = new class extends WidgetType {
    toDOM() {
      let btn = document.createElement('button');
      btn.innerHTML = `<i class="fa fa-check"></i>`;
      btn.className = "btn btn-primary btn-sm btn-circle"; 
      btn.onclick = function()
      {
        dispatch(
          setFinalCodeAccept()
        )
      }
      return btn;
    }
  }
  
  const acceptBtn = Decoration.widget({
    widget: acceptBtnType
  });

const lineHighlightField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(lines, tr) {
    lines = lines.map(tr.changes);
    for (let e of tr.effects) {
      if (e.is(buttonForm)) {
        // console.log("buttonForm effect");
        // lines = Decoration.none;
        lines = lines.update({add: [acceptBtn.range(e.value.pos), cancelBtn.range(e.value.pos), br.range(e.value.pos)]});
      }

      if (e.is(greeHighlight)) {
        // console.log("greeHighlight effect");
        const greenDecor = e.value.pos.map((item) => {
          return greenHighlightMark.range(item)
        });
        lines = lines.update({add: greenDecor});
      }

      if (e.is(redHighlight)) {
        // console.log("redHighlight effect");
        const redDecor = e.value.pos.map((item) => {
          return redHighlightMark.range(item)
        });
        lines = lines.update({add: redDecor});
      }

      if(e.is(clearEffect)){
        lines = Decoration.none;
      }
    }
    return lines;
  },
  provide: (f) => EditorView.decorations.from(f),
});

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
          // console.log("test click dom get position gutter1", view.state.selection.main.head);
          // console.log("test click dom get position gutter2", line.from);
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
      ".cm-content, .cm-gutter": { minHeight: "1000px",  },
      ".cm-gutter": { cursor: "default",},
    },
    { dark: true }
  );

  const costumeTheme = EditorView.theme(
    {
      "&": {
        backgroundImage: "url(\"/bg-vintage-paper-2.jpg\")",
        backgroundRepeat: "repeat",
        minHeight: "90vh"
        // backgroundColor: "#034",
        // background: "none",
      },
      // ".cm-gutter": { cursor: "default",},
      ".cm-changedLineGutter": { background: "#e43" },
      ".cm-btn-form": { background: "#e43" },
      ".btn-circle": {
        width: "30px",
        height: "30px",
        padding: "6px 0px",
        borderRadius: "15px",
        textAlign: "center",
        fontSize: "12px",
        lineHeight: "1.42857",
        marginRight: "5px",
      }
    },
    { dark: false }
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

    return {
      effects: languageConf.reconfigure(
        docIsGo ? StreamLanguage.define(go) : StreamLanguage.define(rust)
      ),
    };
  });

  const extensions = useMemo<Extension[]>(
    () => [
      basicSetup,
      lineNumbers({
        domEventHandlers: {
          mousedown(view, line) {
            // if (view.state.doc.lineAt(line.from).number == cursor.curLine)
            // console.log("test click dom get position gutter1", view.state.selection.main.head);
            // console.log("test click dom get position gutter2", line.from);
            toggleBreakpoint(view, line.from);
            return true;
          },
        },
      }),
      // syntaxHighlighting(myHighlightStyle),
      // darkTheme,
      lineHighlightField,
      costumeTheme,
      solarizedLight,
      breakpointGutter,
      languageConf.of(StreamLanguage.define(go)),
      autoLanguage,
      keymap.of([indentWithTab]),
      EditorView.clickAddsSelectionRange.of(event => event.altKey)
      // noctisLilac,
      // EditorView.domEventHandlers({
      //   mousedown(event, view) {
      //     // console.log("test click dom event.ctrlKey", event.ctrlKey);
      //     console.log("Offset:", view.posAtCoords({x: event.pageX, y: event.pageY}));
      //     return true;
      //   },
      // }),
    ],
    []
  );

  // const getEditor = () => {
  //   let editor = editorCache.get(aktifTabItem.filepath);
  //   if (!editor) {
  //     // Cache miss --> mint a new editor.
  //     editor = new EditorView({
  //       state: EditorState.create({
  //         doc: aktifTabItem.code,
  //         extensions,
  //       }),
  //     });

  //     // Populate the cache.
  //     editorCache.set(aktifTabItem.filepath, editor);
  //   }

  //   return editor;
  // };

  useEffect(() => {
    if (editorRef.current === null) return;
    
    let editor = editorCache.get(aktifTabItem.filepath);
    if (!editor) {
      // Cache miss --> mint a new editor.
      editor = new EditorView({
        state: EditorState.create({
          doc: aktifTabItem.code,
          extensions,
        }),
      });

      // Populate the cache.
      editorCache.set(aktifTabItem.filepath, editor);
    }

    editor.state.allowMultipleSelection = false;

    const pos = editor.state.doc.line(aktifTabItem.cursorln).from;
    editor.dispatch({
      effects: [
        EditorView.scrollIntoView(pos, {
          y: "center",
        }),
      ],
      selection: { anchor: pos, head: pos },
      // scrollIntoView: true
    });
    editor.focus();

    editorRef.current.appendChild(editor.dom);
    loadBreakpoint(editor, aktifTabItem.bppos);

    return () => {
      if (editorRef.current === null) return;
      editorRef.current.removeChild(editor.dom);
    };
  }, [editorRef.current, aktifTabItem.code]);

  useEffect(() => {
    // console.log("pos", view.state.doc.line(10).from, line.from);
    // toggleCursor(view, view.state.doc.line(cursor.curLine).from, view.state.doc.line(cursor.lastLine).from);
    const curEditor = editorCache.get(cursor.curPath);
    const lastEditor = editorCache.get(cursor.lastPath);

    if (cursor.curLine < 1) return;
    const curPos = curEditor.state.doc.line(cursor.curLine).from;

    if (lastEditor) {
      let lastPos = -1;
      let hasBreakpoint = false;
      if (cursor.lastLine > 0) {
        lastPos = lastEditor.state.doc.line(cursor.lastLine).from;
        const lastItem = filetabItems.find(
          (item) => item.filepath === cursor.lastPath
        );
        if(lastItem){
          hasBreakpoint = lastItem.bppos.includes(lastPos);
          // console.log("dispatch last editor", cursor.lastPath, cursor.lastLine, hasBreakpoint);
          
          lastEditor.dispatch({
            effects: [
              cursorLastEffect.of({
                lastpos: lastPos,
                on: hasBreakpoint,
              }),
            ],
          });
        }
      }
    }

    curEditor.dispatch({
      effects: [
        cursorCurEffect.of({
          curpos: curPos,
        }),
        EditorView.scrollIntoView(curPos, {
          y: "center",
        }),
      ],
      selection: { anchor: curPos, head: curPos },
      // scrollIntoView: true
    });
    curEditor.focus();
  }, [cursor.curPath, cursor.curLine]);

  useEffect(() => {
    let editor = editorCache.get(aktifTabItem.filepath);
    const pos = editor.state.doc.line(aktifTabItem.cursorln).from;
    editor.dispatch({
      effects: [
        EditorView.scrollIntoView(pos, {
          y: "center",
        }),
      ],
      selection: { anchor: pos, head: pos },
      // scrollIntoView: true
    });
    editor.focus();
  }, [aktifTabItem.cursorln]);

  const handleClickEditor = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    let curEditor = editorCache.get(aktifTabItem.filepath);

    if(curEditor == null) {
      return;
    }
    
    if(e.ctrlKey){
      const offset = curEditor.posAtCoords({x: e.pageX, y: e.pageY}) + 16;
      dispatch(
        goDefinition({
          filepath: aktifTabItem.filepath,
          offset: offset,
        })
      )

      // console.log("habis then:", aktifTabItem.filepath);
      // curEditor = editorCache.get(aktifTabItem.filepath);
      // curEditor.dispatch({
      //   effects: [
      //     EditorView.scrollIntoView(1, {
      //       y: "center",
      //     }),
      //   ],
      //   selection: { anchor: 1, head: 1 },
      //   // scrollIntoView: true
      // });
      // curEditor.focus();
    }
  }

  const baseURL = "https://api.openai.com/v1/chat/completions";
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  const handleKeyUp = (event: any) => {

    if (event.key === 'Enter') {
      if (editorRef.current === null) return;
      let curEditor = editorCache.get(aktifTabItem.filepath);
      const from =  curEditor.state.selection.ranges[0].from || 0 
      const to =  curEditor.state.selection.ranges[0].to || 0
      const doc = curEditor.state.sliceDoc(from,to)
      
      setLoading(true);
      
      axios
        .post(baseURL, {
          model: 'gpt-3.5-turbo',
          max_tokens: 300,
          temperature: 0.0,
          messages: [
            // {'role': 'user', 'content': "Answer in Source Code. " + search + " : " + doc}
            {'role': 'user', 'content': search + " : " + doc}
          ],
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}` 
          }
        })
        .then((response) => {
          setSearch('');
          console.log("response: ", response.data);
          
          const diff = Diff.diffLines(doc, response.data.choices[0].message.content);
          const mergedText = "\n" + diff.map((item:any) => item.value).join("");
          
          curEditor.dispatch({
            changes: {from:  from, to: to, insert: mergedText + "\n"}
          })

          let countTemp = curEditor.state.doc.lineAt(from).number;
          const lenMergedText = mergedText.split(/\r\n|\r|\n/).length;
          const endPosition = curEditor.state.doc.line(countTemp + lenMergedText).from;

          dispatch(
            setResponseOpenAi({
              acceptCode: response.data.choices[0].message.content,
              cancelCode: doc,
              startPos: from,
              endPos: endPosition
            })
          );

          if(from < to){
            let removeLines = [];
            let addLines= [];
            

            let removeTemp = [];
            let addTemp = [];
            
            for (let i = 0; i < diff.length; i++) {
              const item = diff[i];
              if (item.removed === true){
                for (let j = 1; j <= item.count; j++) {
                  removeLines.push(curEditor.state.doc.line(countTemp + j).from);
                  removeTemp.push(countTemp + j);
                }
              }
              if (item.added === true){
                for (let j = 1; j <= item.count; j++) {
                  addLines.push(curEditor.state.doc.line(countTemp + j).from);
                  addTemp.push(countTemp + j);
                }
              }
              countTemp = countTemp + item.count;
            }

            curEditor.dispatch({
              effects: [greeHighlight.of({pos: addLines}), redHighlight.of({pos: removeLines}), buttonForm.of({pos: from})]
            });

            
            
          }
        })
        .finally(() => {
          setLoading(false);
          
          // const evt = new KeyboardEvent("keydown",{
          //   'key': 'Escape'
          // });
          // const evt = new Event("click");
          // dispatchEvent(evt);
        });
    }
  }

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  return (
    <KBarProvider>
      <KBarPortal>
        <KBarPositioner>
          <KBarAnimator >
            <KBarSearch  
              className="input-bar"
              defaultPlaceholder="Type text to search"
              value={search} disabled={loading}
              onChange={onChangeInput}
              onKeyDownCapture={handleKeyUp}
              />
            <ColorRing
              visible={loading}
              height="50"
              width="50"
              ariaLabel="blocks-loading"
              wrapperStyle={{
                position: 'absolute',
                right: '4px',
                top: '-5px'
              }}
              wrapperClass="blocks-wrapper"
              colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
            />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
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
      <section ref={editorRef} onClick={(e) => handleClickEditor(e)} />
    </KBarProvider>
  );
};
