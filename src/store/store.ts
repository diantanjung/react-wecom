import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import filetabReducer from "./feature/filetabSlice";
import openAiSlice from "./feature/openAiSlice";

export const store = configureStore({
  reducer: {
    filetabs: filetabReducer,
    openai: openAiSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch: () => typeof store.dispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
