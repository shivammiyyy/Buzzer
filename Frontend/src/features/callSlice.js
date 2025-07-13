import { createSlice } from '@reduxjs/toolkit';

const callSlice = createSlice({
  name: 'call',
  initialState: {
    incomingCall: null,
    callStatus: 'idle', // 'idle' | 'incoming' | 'in-call'
    peer: null,
    localStream: null,
    remoteStream: null,
  },
  reducers: {
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
      state.callStatus = 'incoming';
    },
    acceptCall: (state) => {
      state.callStatus = 'in-call';
    },
    endCall: (state) => {
      state.callStatus = 'idle';
      state.incomingCall = null;
      state.peer = null;
      state.remoteStream = null;
    },
    setPeer: (state, action) => {
      state.peer = action.payload;
    },
    setLocalStream: (state, action) => {
      state.localStream = action.payload;
    },
    setRemoteStream: (state, action) => {
      state.remoteStream = action.payload;
    },
  },
});

export const {
  setIncomingCall,
  acceptCall,
  endCall,
  setPeer,
  setLocalStream,
  setRemoteStream,
} = callSlice.actions;

export default callSlice.reducer;
