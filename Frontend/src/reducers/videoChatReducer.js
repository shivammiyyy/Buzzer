import SimplePeer from "simple-peer";
import { actionTypes } from "../actions/types";

const initialState = {
  localStream: null,
  remoteStream: null,
  otherUserId: null, // id of the other user in the call
  audioOnly: false,
  screenSharingStream: null,
  screenSharing: false,
  callRequest: null,
  callStatus: null,
};

const videoChatReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.setLocalStream:
      return {
        ...state,
        localStream: action.payload,
      };

    case actionTypes.setRemoteStream:
      return {
        ...state,
        remoteStream: action.payload,
      };

    case actionTypes.setCallRequest:
      return {
        ...state,
        callRequest: action.payload,
      };

    case actionTypes.setCallStatus:
      return {
        ...state,
        callStatus: action.payload.status,
      };

    case actionTypes.setOtherUserId:
      return {
        ...state,
        otherUserId: action.payload.otherUserId,
      };

    case actionTypes.resetVideoChatState:
      return initialState;

    case actionTypes.setScreenSharingStream:
      return {
        ...state,
        screenSharingStream: action.payload.stream,
        screenSharing: action.payload.isScreenSharing,
      };

    case actionTypes.setAudioOnly:
      return {
        ...state,
        audioOnly: action.payload.audioOnly,
      };

    default:
      return state;
  }
};

export default videoChatReducer;
