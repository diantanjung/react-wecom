import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../helpers/axiosInstance";
import isAuthenticated from '../utils/isAuthenticated';

export const addFileItem = createAsyncThunk(
    'filetab/addFileItem',
    async (filepath, thunkAPI) => {
        try {
            let resp = "";
            if (isAuthenticated()) {
                const username = localStorage.username || 'guest';
                resp = await axiosInstance()
                    .post("/opendirfile", JSON.stringify({ "path_str": filepath, "username": username }));
            } else {
                resp = await axiosInstance()
                    .post("/gopendirfile", JSON.stringify({ "path_str": filepath, "username": "guest" }));
            }
            return resp.data;
        } catch (error) {
            return thunkAPI.rejectWithValue('something went wrong');
        }
    }
);


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
            if (state.aktifTabItem.filepath !== payload.filepath) {
                const isExist = state.filetabItems.find((item) => item.filepath === payload.filepath);
                if (isExist) {
                    state.aktifTabItem = state.filetabItems.find((item) => item.filepath === payload.filepath);
                } else {
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
        setCursorDecoration: (state, { payload }) => {
            const curItem = state.filetabItems.find((item) => item.filepath === state.cursor.curPath);
            if (typeof curItem !== 'undefined') {
                curItem.decorations[state.cursor.curLine] = { decoration: payload.curDecor, classNama: "currentBp" };
            }

            const lastItem = state.filetabItems.find((item) => item.filepath === state.cursor.lastPath);
            if (typeof lastItem !== 'undefined') {
                lastItem.decorations[state.cursor.lastLine] = { decoration: payload.lastDecor, classNama: payload.lastClassNama };
            }
        },
        setCursor: (state, { payload }) => {
            state.cursor.lastPath = state.cursor.curPath;
            state.cursor.lastLine = state.cursor.curLine;
            state.cursor.curPath = payload.curPath;
            state.cursor.curLine = payload.curLine;

        },
        clearCursor: (state, { payload }) => {
            state.cursor.lastPath = state.cursor.curPath;
            state.cursor.lastLine = state.cursor.curLine;
            state.cursor.curPath = "";
            state.cursor.curLine = 0;

        },
    },
    extraReducers: {
        [addFileItem.fulfilled]: (state, { payload }) => {
            console.log("get Content File : ", payload);
            if (state.aktifTabItem.filepath !== payload.filepath) {
                const isExist = state.filetabItems.find((item) => item.filepath === payload.filepath);
                if (isExist) {
                    state.aktifTabItem = state.filetabItems.find((item) => item.filepath === payload.filepath);
                } else {
                    state.filetabItems.push({
                        filepath: payload.filepath,
                        dirpath: payload.dirpath,
                        decorations: [],
                        breakpoints: [],
                        code: payload.file_str,
                        language: payload.language
                    });

                    state.aktifTabItem = {
                        filepath: payload.filepath,
                        dirpath: payload.dirpath,
                        decorations: [],
                        breakpoints: [],
                        code: payload.file_str,
                        language: payload.language
                    };
                }
            }
        },
    }
});

// console.log(filetabSlice);
export const { addFiletabItem, setAktifPath, deleteFiletabItem, addBreakpoint, removeBreakpoint, setDecoration, setCursorDecoration, setDecorations, setCursor, clearCursor } =
    filetabSlice.actions;

export default filetabSlice.reducer;
