import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { authReducer } from '../reducers/authReducer';
import { alertReducer } from '../reducers/alertReducer';
import { friendsReducer } from '../reducers/friendsReducer';
import { chatReducer } from '../reducers/chatReducer';
import videoChatReducer from '../reducers/videoChatReducer';
import { roomReducer } from '../reducers/roomReducer';

// Combine reducers into rootReducer
const rootReducer = {
  auth: authReducer,
  alert: alertReducer,
  friends: friendsReducer,
  chat: chatReducer,
  videoChat: videoChatReducer,
  room: roomReducer,
};

// Create Redux store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for non-serializable items like media streams, sockets
    }),
});

// Types for dispatch and state (optional but best for TypeScript)
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
