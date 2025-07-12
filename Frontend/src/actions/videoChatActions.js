import SimplePeer from "simple-peer";
import { actionTypes } from "./types";
import { showAlert } from "./alertActions";
import { currentPeerConnection, setCurrentPeerConnection } from "../socket/socketConnection";

export const setLocalStream = (stream) => {
  return {
    type: actionTypes.setLocalStream,
    payload: stream,
  };
};

export const setRemoteStream = (stream) => {
  return {
    type: actionTypes.setRemoteStream,
    payload: stream,
  };
};

export const setCallStatus = (status) => {
  return {
    type: actionTypes.setCallStatus,
    payload: {
      status,
    },
  };
};

export const setCallRequest = (callRequest) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.setCallRequest,
      payload: callRequest,
    });

    if (callRequest?.callerUserId) {
      dispatch({
        type: actionTypes.setOtherUserId,
        payload: {
          otherUserId: callRequest.callerUserId,
        },
      });
    }
  };
};

export const clearVideoChat = (message) => {
  return (dispatch, getState) => {
    const {
      videoChat: { localStream, screenSharingStream },
    } = getState();

    localStream?.getTracks().forEach((track) => track.stop());
    screenSharingStream?.getTracks().forEach((track) => track.stop());

    // If needed, uncomment and use
    // if (currentPeerConnection) {
    //   currentPeerConnection.destroy();
    //   console.log("DESTROYED PEER CONNECTION");
    // }

    // setCurrentPeerConnection(null);

    dispatch({
      type: actionTypes.resetVideoChatState,
    });

    dispatch(showAlert(message));
  };
};

export const setOtherUserId = (otherUserId) => {
  return {
    type: actionTypes.setOtherUserId,
    payload: {
      otherUserId,
    },
  };
};

export const setScreenSharingStream = (stream) => {
  return {
    type: actionTypes.setScreenSharingStream,
    payload: {
      stream,
      isScreenSharing: !!stream,
    },
  };
};

export const setAudioOnly = (audioOnly) => {
  return {
    type: actionTypes.setAudioOnly,
    payload: {
      audioOnly,
    },
  };
};
