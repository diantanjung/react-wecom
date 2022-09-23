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
    aktifPath:""
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

                state.aktifPath = payload.filepath;
            }
        },
        setAktifPath: (state, { payload }) => {
            state.aktifPath = payload.filepath;
        },
        deleteFiletabItem: (state, { payload }) => {
            state.filetabItems = state.filetabItems.filter((item) => item.filepath !== payload.filepath);
            const maxIdx = state.filetabItems.length - 1; 
            if(maxIdx >= 0){
                state.aktifPath = state.filetabItems[maxIdx].filepath;
            }
        },
        addBreakpoint: (state, { payload }) => {
            const filetabItem = state.filetabItems.find((item) => item.filepath === payload.filepath);
            filetabItem.breakpoints.push(payload.line);
        },
        removeBreakpoint: (state, { payload }) => {
            const filetabItem = state.filetabItems.find((item) => item.filepath === payload.filepath);
            filetabItem.breakpoints = filetabItem.breakpoints.filter((item) => item !== payload.line);

        },
        setDecoration: (state, { payload }) => {
            const filetabItem = state.filetabItems.find((item) => item.filepath === payload.filepath);
            filetabItem.decorations[payload.line] = { decoration: payload.decoration, classNama: payload.classNama };
        },
        setDecorations: (state, { payload }) => {
            const filetabItem = state.filetabItems.find((item) => item.filepath === payload.filepath);
            for (let index = 1; index <= payload.maxline; index++) {
                filetabItem.decorations[index] = { decoration: payload.decoration, classNama: payload.classNama };
            }
        },
        setCursor: (state, { payload }) => {
            state.cursor.curPath = payload.curPath;
            state.cursor.curLine = payload.curLine;
            state.cursor.lastPath = payload.lastPath;
            state.cursor.lastLine = payload.lastLine;
        },
    },
});

console.log(filetabSlice);
export const { addFiletabItem, setAktifPath, deleteFiletabItem, addBreakpoint, removeBreakpoint, setDecoration, setDecorations, setCursor } =
    filetabSlice.actions;

export default filetabSlice.reducer;
