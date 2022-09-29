import { createSlice } from '@reduxjs/toolkit';
import isAuthenticated from '../utils/isAuthenticated';

const initialState = {
    filetabItems: [],
    cursor: {
        curPath: "",
        curLine: 0,
        lastPath: "",
        lastLine: 0
    },
    aktifTabItem: {
        filepath: "Untitled-1",
        dirpath: "",
        decorations: [],
        breakpoints: [],
        code: " ",
        language: "go"
    }
};

const filetabSlice = createSlice({
    name: 'filetabs',
    initialState,
    reducers: {
        addFiletabItem: (state, { payload }) => {
            const isExist = state.filetabItems.find((item) => item.filepath === payload.filepath);
            if (!isExist) {
                state.filetabItems.push({
                    filepath: payload.filepath,
                    dirpath: payload.dirpath,
                    decorations: [],
                    breakpoints: [],
                    code: payload.code,
                    language: payload.language
                });

                state.aktifTabItem = {
                    filepath: payload.filepath,
                    dirpath: payload.dirpath,
                    decorations: [],
                    breakpoints: [],
                    code: payload.code,
                    language: payload.language
                };
            }
        },
        setAktifPath: (state, { payload }) => {
            state.aktifTabItem = state.filetabItems.find((item) => item.filepath === payload.filepath);
        },
        deleteFiletabItem: (state, { payload }) => {
            state.filetabItems = state.filetabItems.filter((item) => item.filepath !== payload.filepath);
            const maxIdx = state.filetabItems.length - 1;
            if (maxIdx >= 0) {
                state.aktifTabItem = state.filetabItems[maxIdx];
            }
        },
        addBreakpoint: (state, { payload }) => {
            // const filetabItem = state.filetabItems.find((item) => item.filepath === payload.filepath);
            if (state.aktifTabItem.breakpoints.indexOf(payload.line) === -1) {
                state.aktifTabItem.breakpoints.push(payload.line);
            }
            state.aktifTabItem.decorations[payload.line] = { decoration: payload.decoration, classNama: payload.classNama };
            
            const itemIndex = state.filetabItems.findIndex((item) => item.filepath === state.aktifTabItem.filepath);
            state.filetabItems[itemIndex] = state.aktifTabItem;
            
        },
        removeBreakpoint: (state, { payload }) => {
            state.aktifTabItem.breakpoints = state.aktifTabItem.breakpoints.filter((item) => item !== payload.line);
            state.aktifTabItem.decorations[payload.line] = { decoration: payload.decoration, classNama: payload.classNama };
            
            const itemIndex = state.filetabItems.findIndex((item) => item.filepath === state.aktifTabItem.filepath);
            state.filetabItems[itemIndex] = state.aktifTabItem;
        },
        setDecoration: (state, { payload }) => {
            state.aktifTabItem.decorations[payload.line] = { decoration: payload.decoration, classNama: payload.classNama };
            
            const itemIndex = state.filetabItems.findIndex((item) => item.filepath === state.aktifTabItem.filepath);
            state.filetabItems[itemIndex] = state.aktifTabItem;
        },
        setDecorations: (state, { payload }) => {
            state.aktifTabItem.decorations = payload.decorations;
            
            const itemIndex = state.filetabItems.findIndex((item) => item.filepath === state.aktifTabItem.filepath);
            state.filetabItems[itemIndex] = state.aktifTabItem;
        },
        setCursor: (state, { payload }) => {
            state.cursor.curPath = payload.curPath;
            state.cursor.curLine = payload.curLine;
            state.cursor.lastPath = payload.lastPath;
            state.cursor.lastLine = payload.lastLine;
        },
    },
});

// console.log(filetabSlice);
export const { addFiletabItem, setAktifPath, deleteFiletabItem, addBreakpoint, removeBreakpoint, setDecoration, setDecorations, setCursor } =
    filetabSlice.actions;

export default filetabSlice.reducer;
