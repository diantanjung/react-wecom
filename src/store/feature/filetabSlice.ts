import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import isAuthenticated from "../../utils/isAuthenticated";

export interface FileTabItem {
  filepath: string;
  dirpath: string;
  bppos: number[];
  bpln: number[];
  code: string;
  language: string;
  cursorln: number;
}

interface FileTabItems {
  filetabItems: FileTabItem[];
  cursor: {
    curPath: string;
    curLine: number;
    lastPath: string;
    lastLine: number;
  };
  startDir: string;
  aktifTabItem: FileTabItem;
}

const initialState = {
  filetabItems: [{
    filepath: "Untitled-1",
    dirpath: "",
    bppos: [],
    bpln: [],
    code: " ",
    language: "html",
    cursorln: 1,
  }],
  cursor: {
    curPath: "",
    curLine: 0,
    lastPath: "",
    lastLine: 0,
  },
  startDir: "",
  aktifTabItem: {
    filepath: "Untitled-1",
    dirpath: "",
    bppos: [],
    bpln: [],
    code: " ",
    language: "html",
    cursorln: 1,
  },
} as FileTabItems;

const filetabSlice = createSlice({
  name: "filetabs",
  initialState,
  reducers: {
    addFiletabItem: (state, { payload }) => {
      if (state.aktifTabItem.filepath !== payload.filepath) {
        const isExist = state.filetabItems.find(
          (item) => item.filepath === payload.filepath
        );
        if (isExist) {
          state.aktifTabItem = state.filetabItems.find(
            (item) => item.filepath === payload.filepath
          ) as FileTabItem;
        } else {
          state.filetabItems.push({
            filepath: payload.filepath,
            dirpath: payload.dirpath,
            bppos: [],
            bpln: [],
            code: payload.code,
            language: payload.language,
            cursorln: 1,
          });

          state.aktifTabItem = {
            filepath: payload.filepath,
            dirpath: payload.dirpath,
            bppos: [],
            bpln: [],
            code: payload.code,
            language: payload.language,
            cursorln: 1,
          };
        }
      }
    },
    addFiletabItemModel: (state, { payload }) => {
      if (state.aktifTabItem.filepath !== payload.filepath) {
        const isExist = state.filetabItems.find(
          (item) => item.filepath === payload.filepath
        );
        if (!isExist) {
          state.filetabItems.push({
            filepath: payload.filepath,
            dirpath: payload.dirpath,
            bppos: [],
            bpln: [],
            code: payload.code,
            language: payload.language,
            cursorln: 1,
          });
        }
      }
    },
    setAktifPath: (state, { payload }) => {
      state.aktifTabItem = state.filetabItems.find(
        (item) => item.filepath === payload.filepath
      ) as FileTabItem;
    },
    deleteFiletabItem: (state, { payload }) => {
      state.filetabItems = state.filetabItems.filter(
        (item) => item.filepath !== payload.filepath
      );
      const maxIdx = state.filetabItems.length - 1;
      if (maxIdx >= 0) {
        state.aktifTabItem = state.filetabItems[maxIdx];
      }else{
        state.filetabItems.push({
          filepath: "Untitled-1",
          dirpath: "",
          bppos: [],
          bpln: [],
          code: "",
          language: "go",
          cursorln: 1,
        });

        state.aktifTabItem = {
          filepath: "Untitled-1",
          dirpath: "",
          bppos: [],
          bpln: [],
          code: "",
          language: "go",
          cursorln: 1,
        }
      }
    },
    addBreakpoint: (state, { payload }) => {
      // const filetabItem = state.filetabItems.find((item) => item.filepath === payload.filepath);
      if (state.aktifTabItem.bppos.indexOf(payload.bppos) === -1) {
        state.aktifTabItem.bppos.push(payload.bppos);
      }

      if (state.aktifTabItem.bpln.indexOf(payload.bpln) === -1) {
        state.aktifTabItem.bpln.push(payload.bpln);
      }

      const itemIndex = state.filetabItems.findIndex(
        (item) => item.filepath === state.aktifTabItem.filepath
      );
      state.filetabItems[itemIndex] = state.aktifTabItem;
    },
    removeBreakpoint: (state, { payload }) => {
      state.aktifTabItem.bppos = state.aktifTabItem.bppos.filter(
        (item) => item !== payload.bppos
      );

      state.aktifTabItem.bpln = state.aktifTabItem.bpln.filter(
        (item) => item !== payload.bpln
      );

      const itemIndex = state.filetabItems.findIndex(
        (item) => item.filepath === state.aktifTabItem.filepath
      );
      state.filetabItems[itemIndex] = state.aktifTabItem;
    },
    setDecoration: (state, { payload }) => {

      const itemIndex = state.filetabItems.findIndex(
        (item) => item.filepath === state.aktifTabItem.filepath
      );
      state.filetabItems[itemIndex] = state.aktifTabItem;
    },
    setDecorations: (state, { payload }) => {
      const itemIndex = state.filetabItems.findIndex(
        (item) => item.filepath === state.aktifTabItem.filepath
      );
      state.filetabItems[itemIndex] = state.aktifTabItem;
    },
    // setCursor: (state, { payload }) => {
    //   state.cursor.lastPath = state.cursor.curPath;
    //   state.cursor.lastLine = state.cursor.curLine;
    //   state.cursor.curPath = payload.curPath;
    //   state.cursor.curLine = payload.curLine;
    // },
    clearCursor: (state, { payload }) => {
      state.cursor.lastPath = state.cursor.curPath;
      state.cursor.lastLine = state.cursor.curLine;
      state.cursor.curPath = "";
      state.cursor.curLine = 0;
    },
    setStartDir: (state, { payload }) => {
      state.startDir = payload.startDir;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addFileItem.fulfilled, (state, { payload }) => {
      if (state.aktifTabItem.filepath !== payload.filepath) {
        const isExist = state.filetabItems.find(
          (item) => item.filepath === payload.filepath
        );
        if (isExist) {
          state.aktifTabItem = state.filetabItems.find(
            (item) => item.filepath === payload.filepath
          ) as FileTabItem;
        } else {
          state.filetabItems.push({
            filepath: payload.filepath,
            dirpath: payload.dirpath,
            bppos: [],
            bpln: [],
            code: payload.file_str,
            language: payload.language,
            cursorln: 1,
          });

          state.aktifTabItem = {
            filepath: payload.filepath,
            dirpath: payload.dirpath,
            bppos: [],
            bpln: [],
            code: payload.file_str,
            language: payload.language,
            cursorln: 1,
          };
        }
      }
    });

    builder.addCase(setCursor.fulfilled, (state, { payload }) => {
      state.cursor.lastPath = state.cursor.curPath;
      state.cursor.lastLine = state.cursor.curLine;
      state.cursor.curPath = payload.filepath;
      state.cursor.curLine = payload.curLine;

      if (state.aktifTabItem.filepath !== payload.filepath) {
        const isExist = state.filetabItems.find(
          (item) => item.filepath === payload.filepath
        );
        if (isExist) {
          state.aktifTabItem = state.filetabItems.find(
            (item) => item.filepath === payload.filepath
          ) as FileTabItem;
        } else {
          state.filetabItems.push({
            filepath: payload.filepath,
            dirpath: payload.dirpath,
            bppos: [],
            bpln: [],
            code: payload.file_str,
            language: payload.language,
            cursorln: 1,
          });

          state.aktifTabItem = {
            filepath: payload.filepath,
            dirpath: payload.dirpath,
            bppos: [],
            bpln: [],
            code: payload.file_str,
            language: payload.language,
            cursorln: 1,
          };
        }
      }
    });

    builder.addCase(goDefinition.fulfilled, (state, { payload }) => {
      if (state.aktifTabItem.filepath !== payload.filepath) {
        const isExist = state.filetabItems.find(
          (item) => item.filepath === payload.filepath
        );
        if (isExist) {
          state.aktifTabItem = state.filetabItems.find(
            (item) => item.filepath === payload.filepath
          ) as FileTabItem;
        } else {
          state.filetabItems.push({
            filepath: payload.filepath,
            dirpath: payload.dirpath,
            bppos: [],
            bpln: [],
            code: payload.file_str,
            language: payload.language,
            cursorln: payload.line_number,
          });

          state.aktifTabItem = {
            filepath: payload.filepath,
            dirpath: payload.dirpath,
            bppos: [],
            bpln: [],
            code: payload.file_str,
            language: payload.language,
            cursorln: payload.line_number,
          };
        }
      }else{
        state.aktifTabItem.cursorln = payload.line_number;
      }
    });
  },
});

export const addFileItem = createAsyncThunk(
  "filetabs/addFileItem",
  async (filepath: string, thunkAPI) => {
    try {
      if (isAuthenticated()) {
        const username = localStorage.username || "guest";
        const resp = await axiosInstance().post(
          "/opendirfile",
          JSON.stringify({ path_str: filepath, username: username })
        );
        
        return resp.data;
      } else {
        const resp = await axiosInstance().post(
          "/gopendirfile",
          JSON.stringify({ path_str: filepath, username: "guest" })
        );
        // const data = resp.data.json();
        return resp.data;
      }
    } catch (error) {
      return thunkAPI.rejectWithValue("something went wrong");
    }
  }
);

interface setCursorParams {
  curPath: string
  curLine: number
}

export const setCursor = createAsyncThunk(
  "filetabs/setCursor",
  async (params: setCursorParams, thunkAPI) => {
    try {
      const {curPath, curLine} = params;
      if (isAuthenticated()) {
        const username = localStorage.username || "guest";
        const resp = await axiosInstance().post(
          "/opendirfile",
          JSON.stringify({ path_str: curPath, username: username })
        );
        resp.data.curLine = curLine;
        return resp.data;
      } else {
        const resp = await axiosInstance().post(
          "/gopendirfile",
          JSON.stringify({ path_str: curPath, username: "guest" })
        );
        // const data = resp.data.json();
        resp.data.curLine = curLine;
        return resp.data;
      }
    } catch (error) {
      return thunkAPI.rejectWithValue("something went wrong");
    }
  }
);

interface goDefinitionParams {
  filepath: string
  offset: number
}

export const goDefinition = createAsyncThunk(
  "filetabs/goDefinition",
  async (params: goDefinitionParams, thunkAPI) => {
    try {
      const {filepath, offset} = params;
      if (isAuthenticated()) {
        const username = localStorage.username || "guest";
        const resp = await  axiosInstance().post(
          "/rungodef",
          JSON.stringify({ path_str: filepath, offset: offset, username: username })
        )
        return resp.data;
      } else {
        const resp = await axiosInstance().post(
          "/grungodef",
          JSON.stringify({ path_str: filepath, offset: offset, username: "guest" })
        );
        // const data = resp.data.json();
        return resp.data;
      }
    } catch (error) {
      return thunkAPI.rejectWithValue("something went wrong");
    }
  }
);

// console.log(filetabSlice);
export const {
  addFiletabItem,
  addFiletabItemModel,
  setAktifPath,
  deleteFiletabItem,
  addBreakpoint,
  removeBreakpoint,
  setDecoration,
  setDecorations,
  // setCursor,
  clearCursor,
  setStartDir,
} = filetabSlice.actions;

export default filetabSlice.reducer;
