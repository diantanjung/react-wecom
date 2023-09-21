import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

interface Attachment {
    message: string;
    filepath: string
  }

interface Message{
    role: string;
    content: string;
    attachments: Attachment[]
}

interface Msg{
    role: string;
    content: string;
}

interface Openai{
    finalCode: string
    startPos: number
    endPos: number
    cancelCode: string
    acceptCode: string

    notifStatus: boolean
    messages:Message[]

    codeMessages: Message[]

    isChatLoading: boolean
}

const initialState = {
    finalCode: "",
    startPos: 0,
    endPos: 0,
    cancelCode: "",
    acceptCode: "",
    notifStatus: false,
    notifText: "",
    messages: [],
    codeMessages: [],
    isChatLoading: false
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
        // setMessage: (state, { payload }) => {
        //     state.messages.push(payload.message)
        //     if(state.messages.length > 7){
        //         state.messages.shift();
        //         state.messages.shift();
        //     }
        // },
    },
    extraReducers: (builder) => {
        builder.addCase(setMessage.fulfilled, (state, { meta, payload }) => {
            state.isChatLoading = false;
            state.messages.push(meta.arg.message);
            state.messages.push(payload);
        })

        builder.addCase(setMessage.pending, (state) => {
            state.isChatLoading = true;
        })

        builder.addCase(generateCode.fulfilled, (state, { meta, payload }) => {
            state.codeMessages.push(meta.arg.message);
            state.codeMessages.push(payload);
        })
    }
})

interface MessageInput {
    with_context: boolean
    message: Message
}
  
export const setMessage = createAsyncThunk<
    Message,
    MessageInput,
    {state: RootState}
    >(
    "openai/setMessage",
    async (params, thunkAPI) => {
        let newMessages;
        if (params.with_context){
            const { messages } = thunkAPI.getState().openai;
            newMessages = [...messages, params.message]
        }else{
            newMessages = [params.message]
        }

        //limit messages
        newMessages = newMessages.slice(-6);

        let aiMessages:Msg[] = [];
        newMessages.map((msg) => {
            aiMessages.push({role: msg.role, content: msg.attachments + msg.content})
        })
        
        try {
            const baseURL = "https://api.openai.com/v1/chat/completions";

            const resp = await axios
            .post(baseURL, {
            model: 'gpt-3.5-turbo',
            max_tokens: 500,
            temperature: 0.0,
            messages: aiMessages
                // {'role': 'user', 'content': "Answer in Source Code. " + search + " : " + doc}
                // {'role': 'user', 'content': search + " : " + doc}
            // ],
            }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}` 
            }
            })
            return { role: resp.data.choices[0].message.role, content: resp.data.choices[0].message.content, attachments:[]};
        } catch (error) {
            return thunkAPI.rejectWithValue("something went wrong");
        }
    }
);

export const generateCode = createAsyncThunk<
    Message,
    MessageInput,
    {state: RootState}
    >(
    "openai/generateCode",
    async (params, thunkAPI) => {
        let newMessages;
        if (params.with_context){
            const { codeMessages } = thunkAPI.getState().openai;
            newMessages = [...codeMessages, params.message]
        }else{
            newMessages = [params.message]
        }

        //limit messages
        newMessages = newMessages.slice(-4);
        
        try {
            const baseURL = "https://api.openai.com/v1/chat/completions";

            const resp = await axios
            .post(baseURL, {
            model: 'gpt-3.5-turbo',
            max_tokens: 500,
            temperature: 0.0,
            messages: newMessages
                // {'role': 'user', 'content': "Answer in Source Code. " + search + " : " + doc}
                // {'role': 'user', 'content': search + " : " + doc}
            // ],
            }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}` 
            }
            })
            return { role: resp.data.choices[0].message.role, content: resp.data.choices[0].message.content, attachments:[]};
        } catch (error) {
            return thunkAPI.rejectWithValue("something went wrong");
        }
    }
);


export const {
    setFinalCodeCancel, setFinalCodeAccept, setResponseOpenAi, setNotifStatus
  } = openAiSlice.actions;
  
  export default openAiSlice.reducer;