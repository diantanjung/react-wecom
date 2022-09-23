import { configureStore } from '@reduxjs/toolkit';
import filetabReducer from './feature/filetabSlice';

export const store = configureStore({
  reducer: {
    filetabs : filetabReducer
  },
});