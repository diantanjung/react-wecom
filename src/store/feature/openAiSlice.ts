import { createSlice } from "@reduxjs/toolkit";

interface Openai{
    finalCode: string;
    startPos: number;
    endPos: number;
    cancelCode: string;
    acceptCode: string;

    notifStatus: boolean;
    notifText: string;
}

const initialState = {
    finalCode: "",
    startPos: 0,
    endPos: 0,
    cancelCode: "",
    acceptCode: "",
    notifStatus: false,
    notifText: ""
} as Openai

const openAiSlice = createSlice({
    name: "openai",
    initialState,
    reducers: {
        setFinalCodeCancel: (state) => {
            state.finalCode = state.cancelCode
        },
        setFinalCodeAccept: (state) => {
            state.finalCode = state.acceptCode
        },
        // setEditPos: (state, { payload }) => {
        //     state.startPos = payload.startPos
        //     state.endPos = payload.endPos
        // },
        // setCancelCode: (state, { payload }) => {
        //     state.cancelCode = payload.code
        // },
        // setAcceptCode: (state, { payload }) => {
        //     state.acceptCode = payload.code
        // },
        setResponseOpenAi: (state, { payload }) => {
            state.startPos = payload.startPos
            state.endPos = payload.endPos
            state.acceptCode = payload.acceptCode
            state.cancelCode = payload.cancelCode
        },
        setNotifStatus: (state, { payload }) => {
            state.notifStatus = payload.notifStatus
        },
        setNotifText: (state, { payload }) => {
            state.notifText = payload.notifText
            state.notifStatus = true
        }
    }
})

export const {
    setFinalCodeCancel, setFinalCodeAccept, setResponseOpenAi, setNotifStatus, setNotifText
  } = openAiSlice.actions;
  
  export default openAiSlice.reducer;