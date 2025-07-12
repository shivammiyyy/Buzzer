export const actionTypes = {
openRoom: "OPEN_ROOM",
setRoomDetails: "SET_ROOM_DETAILS",
setActiveRooms: "SET_ACTIVE_ROOMS",
setLocalStreamRoom: "SET_LOCAL_STREAM_ROOM",
setAudioOnlyRoom: "SET_AUDIO_ONLY_ROOM",
setRemoteStreams: "SET_REMOTE_STREAMS",
setScreenSharingStreamRoom: "SET_SCREEN_SHARING_STREAM_ROOM",
setIsUserJoinedWithAudioOnly: "SET_IS_USER_JOINED_WITH_AUDIO_ONLY",
};

export const setOpenRoom = (isUserRoomCreator = false, isUserInRoom = false) => {
return {
type: actionTypes.openRoom,
payload: {
isUserRoomCreator,
isUserInRoom,
},
};
};

export const setRoomDetails = (roomDetails) => {
return {
type: actionTypes.setRoomDetails,
payload: {
roomDetails,
},
};
};

export const setActiveRooms = (activeRooms) => {
return {
type: actionTypes.setActiveRooms,
payload: {
activeRooms,
},
};
};

export const setLocalStreamRoom = (localStreamRoom) => {
return {
type: actionTypes.setLocalStreamRoom,
payload: {
localStreamRoom,
},
};
};

export const setAudioOnlyRoom = (audioOnly) => {
return {
type: actionTypes.setAudioOnlyRoom,
payload: {
audioOnly,
},
};
};

export const setRemoteStreams = (remoteStreams) => {
return {
type: actionTypes.setRemoteStreams,
payload: {
remoteStreams,
},
};
};

export const setScreenSharingStreamRoom = (stream) => {
return {
type: actionTypes.setScreenSharingStreamRoom,
payload: {
isScreenSharingActive: !!stream,
screenSharingStream: stream || null,
},
};
};

export const setIsUserJoinedOnlyWithAudio = (onlyWithAudio) => {
return {
type: actionTypes.setIsUserJoinedWithAudioOnly,
payload: {
isUserJoinedWithOnlyAudio: onlyWithAudio,
},
};
};