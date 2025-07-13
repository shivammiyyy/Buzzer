import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice.js';
import chatReducer from '../features/chatSlice.js';
import callReducer from '../features/callSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    call: callReducer,
  },
});

export default store;
