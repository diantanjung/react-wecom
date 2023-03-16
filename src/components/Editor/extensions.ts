import { basicSetup } from "codemirror";
import {EditorView, lineNumbers, gutter, GutterMarker} from "@codemirror/view"
import {StateField, StateEffect, RangeSet, Extension } from "@codemirror/state"
import {HighlightStyle, syntaxHighlighting} from "@codemirror/language"
import {tags} from "@lezer/highlight"
import {parser} from "./parser.js"
import {foldNodeProp, foldInside, indentNodeProp} from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"
import { useAppSelector } from "../../store/store.js";

const { filetabItems, cursor, aktifTabItem } = useAppSelector(
  (store) => store.filetabs
);

const breakpointEffect = StateEffect.define<{pos: number, on: boolean}>({
  map: (val, mapping) => ({pos: mapping.mapPos(val.pos), on: val.on})
})

const breakpointState = StateField.define<RangeSet<GutterMarker>>({
  create() { return RangeSet.empty },
  update(set, transaction) {
    set = set.map(transaction.changes)
    for (let e of transaction.effects) {
      if (e.is(breakpointEffect)) {
        if (e.value.on)
          set = set.update({add: [breakpointMarker.range(e.value.pos)]})
        else
          set = set.update({filter: from => from != e.value.pos})
      }

      if (e.is(cursorEffect)) {
        if (e.value.on)
          set = set.update({add: [cursorMarker.range(e.value.pos)]})
        else{
          set = set.update({filter: from => from != e.value.pos})
          set = set.update({add: [cursorMarker.range(e.value.pos)]})
        }
      }
    }
    return set
  }
})

export function toggleBreakpoint(view: EditorView, pos: number) {
  let breakpoints = view.state.field(breakpointState)
  let hasBreakpoint = false
  breakpoints.between(pos, pos, () => {hasBreakpoint = true})
  console.log("pos", pos)
  console.log("hasBreakpoint", hasBreakpoint)
  view.dispatch({
    effects: breakpointEffect.of({pos, on: !hasBreakpoint})
  })
}

const breakpointMarker = new class extends GutterMarker {
  toDOM() { return document.createTextNode("🔴") }
}

//cursor
const cursorEffect = StateEffect.define<{pos: number, on: boolean}>({
  map: (val, mapping) => ({pos: mapping.mapPos(val.pos), on: val.on})
})

const cursorMarker = new class extends GutterMarker {
  toDOM() { return document.createTextNode("▶️") }
}

export function toggleCursor(view: EditorView, pos: number) {
  let breakpoints = view.state.field(breakpointState)
  let hasBreakpoint = false
  breakpoints.between(pos, pos, () => {hasBreakpoint = true})
  view.dispatch({
    effects: cursorEffect.of({pos, on: !hasBreakpoint})
  })
}


const breakpointGutter = [
  breakpointState,
  gutter({
    class: "cm-breakpoint-gutter",
    markers: v => v.state.field(breakpointState),
    initialSpacer: () => breakpointMarker,
    domEventHandlers: {
      mousedown(view, line) {
        console.log("line number", view.state.doc.lineAt(line.from).number);
        
        toggleBreakpoint(view, line.from)
        return true
      }
    }
  }),
  EditorView.baseTheme({
    ".cm-breakpoint-gutter .cm-gutterElement": {
      color: "red",
      paddingLeft: "5px",
      cursor: "default"
    }
  })
]


const darkTheme =  EditorView.theme({
  "&": {
    color: "white",
    backgroundColor: "#034"
  },
  ".cm-content": {
    caretColor: "#0e9",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#0e9"
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "#074"
  },
  ".cm-gutters": {
    backgroundColor: "#045",
    color: "#ddd",
    border: "none"
  },
  ".cm-content, .cm-gutter": {minHeight: "1000px"}
}, {dark: true})

const myHighlightStyle = HighlightStyle.define([
  {tag: tags.keyword, color: "#fc6"},
  {tag: tags.comment, color: "#37d0ff", fontStyle: "italic"},
  {tag: tags.string, color: "#A4BE7B"},
  {tag: tags.null, color: "#5D3891"},

])

let parserWithMetadata = parser.configure({
  props: [
    styleTags({
      Identifier: t.variableName,
      Boolean: t.bool,
      String: t.string,
      LineComment: t.lineComment,
      "( )": t.paren
    }),
    indentNodeProp.add({
      Application: context => context.column(context.node.from) + context.unit
    }),
    foldNodeProp.add({
      Application: foldInside
    })
  ]
})

export const extensions = [
  basicSetup,
  lineNumbers(),
  syntaxHighlighting(myHighlightStyle),
  darkTheme,
  breakpointGutter,
];
