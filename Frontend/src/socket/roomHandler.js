import {
  setOpenRoom,
  setRoomDetails,
  setActiveRooms,
  setLocalStreamRoom,
  setRemoteStreams,
  setScreenSharingStreamRoom,
  setIsUserJoinedOnlyWithAudio,
} from "../actions/roomActions.js";

import { store } from "../store/index.js";
import * as socketConnection from "./socketConnection.js";
import { closeAllConnections, getLocalStreamPreview } from "./webRTC.js";

export const createNewRoom = () => {
  const successCallbackFunc = () => {
    store.dispatch(setOpenRoom(true, true));

    const audioOnly = store.getState().room.audioOnly;
    store.dispatch(setIsUserJoinedOnlyWithAudio(audioOnly));
    socketConnection.createNewRoom();
  };

  const audioOnly = store.getState().room.audioOnly;
  getLocalStreamPreview(audioOnly, successCallbackFunc, true);
};

export const newRoomCreated = (data) => {
  const { roomDetails } = data;
  store.dispatch(setRoomDetails(roomDetails));
};

export const updateActiveRooms = (data) => {
  const { activeRooms } = data;
  console.log("Active ROOMS", activeRooms);

  const {
    friends: { friends },
    auth: { userDetails },
    room: { roomDetails },
  } = store.getState();

  const rooms = [];
  const userId = userDetails?._id;

  activeRooms.forEach((room) => {
    const isRoomCreatedByMe = room.roomCreator.userId === userId;

    if (isRoomCreatedByMe) {
      rooms.push(room);
    } else {
      friends.forEach((f) => {
        if (f.id === room.roomCreator.userId) {
          rooms.push(room);
        }
      });
    }

    if (room.roomId === roomDetails?.roomId) {
      store.dispatch(setRoomDetails(room));
    }
  });

  store.dispatch(setActiveRooms(rooms));
};

export const initialRoomsUpdate = (data) => {
  const { activeRooms } = data;
  store.dispatch(setActiveRooms(activeRooms));
};

export const joinRoom = (room) => {
  const successCallbackFunc = () => {
    store.dispatch(setRoomDetails(room));
    store.dispatch(setOpenRoom(false, true));

    const audioOnly = store.getState().room.audioOnly;
    store.dispatch(setIsUserJoinedOnlyWithAudio(audioOnly));
    socketConnection.joinRoom({ roomId: room.roomId });
  };

  const audioOnly = store.getState().room.audioOnly;
  getLocalStreamPreview(audioOnly, successCallbackFunc, true);
};

export const leaveRoom = () => {
  const roomId = store.getState().room.roomDetails?.roomId;

  const localStream = store.getState().room.localStreamRoom;
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    store.dispatch(setLocalStreamRoom(null));
  }

  const screenSharingStream = store.getState().room.screenSharingStream;
  if (screenSharingStream) {
    screenSharingStream.getTracks().forEach((track) => track.stop());
    store.dispatch(setScreenSharingStreamRoom(null));
  }

  store.dispatch(setRemoteStreams([]));
  closeAllConnections();

  if (roomId) {
    socketConnection.leaveRoom({ roomId });
  }

  store.dispatch(setRoomDetails(null));
  store.dispatch(setOpenRoom(false, false));
};
