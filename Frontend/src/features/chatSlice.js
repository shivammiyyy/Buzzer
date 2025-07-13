import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: {},
    currentChat: null,
    messages: [],
  },
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearChat: (state) => {
      state.currentChat = null;
      state.messages = [];
    },
  },
});

export const { setCurrentChat, setMessages, addMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
