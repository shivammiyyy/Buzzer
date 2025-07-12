// src/actions/types.js
import SimplePeer from "simple-peer";

export const actionTypes = {
  authenticate: "authenticate",
  logout: "logout",
  authError: "authError",
  authLoading: "authLoading",

  showAlert: "showAlert",
  hideAlert: "hideAlert",

  setFriends: "setFriends",
  setPendingInvitations: "setPendingInvitations",
  setOnlineUsers: "setOnlineUsers",
  setGroupChatList: "setGroupChatList",
  resetFriends: "resetFriends",

  setChatType: "setChatType",
  setChosenChatDetails: "setChosenChatDetails",
  setMessages: "setMessages",
  addNewMessage: "addNewMessage",
  resetChat: "resetChat",
  setChosenGroupChatDetails: "setChosenGroupChatDetails",

  setTyping: "setTyping",
  setInitialTypingStatus: "setInitialTypingStatus",

  setLocalStream: "setLocalStream",
  setRemoteStream: "setRemoteStream",
  setOtherUserId: "setOtherUserId",
  setAudioOnly: "setAudioOnly",
  setScreenSharingStream: "setScreenSharingStream",
  setScreenSharing: "setScreenSharing",
  setCallRequest: "setCallRequest",
  setCallStatus: "setCallStatus",
  resetVideoChatState: "resetVideoChatState",

  openRoom: "openRoom",
  setRoomDetails: "setRoomDetails",
  setActiveRooms: "setActiveRooms",
  setLocalStreamRoom: "setLocalStreamRoom",
  setRemoteStreams: "setRemoteStreams",
  setAudioOnlyRoom: "setAudioOnlyRoom",
  setScreenSharingStreamRoom: "setScreenSharingStreamRoom",
  setIsUserJoinedWithAudioOnly: "setIsUserJoinedWithAudioOnly",
};

export const CallStatus = {
  RINGING: "ringing",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  LEFT: "left",
};

// Used by reducers and components if needed
export const ActionTypeGroups = {
  AuthActions: [
    actionTypes.authenticate,
    actionTypes.authError,
    actionTypes.logout,
    actionTypes.authLoading,
  ],
  AlertActions: [actionTypes.showAlert, actionTypes.hideAlert],
  FriendsActions: [
    actionTypes.setPendingInvitations,
    actionTypes.setFriends,
    actionTypes.setOnlineUsers,
    actionTypes.setGroupChatList,
    actionTypes.resetFriends,
  ],
  ChatActions: [
    actionTypes.setChosenChatDetails,
    actionTypes.setChosenGroupChatDetails,
    actionTypes.setMessages,
    actionTypes.addNewMessage,
    actionTypes.setTyping,
    actionTypes.setInitialTypingStatus,
    actionTypes.resetChat,
  ],
  VideoChatActions: [
    actionTypes.setLocalStream,
    actionTypes.setRemoteStream,
    actionTypes.setCallRequest,
    actionTypes.setCallStatus,
    actionTypes.resetVideoChatState,
    actionTypes.setOtherUserId,
    actionTypes.setScreenSharingStream,
    actionTypes.setAudioOnly,
  ],
  RoomActions: [
    actionTypes.setIsUserJoinedWithAudioOnly,
    actionTypes.setActiveRooms,
    actionTypes.setAudioOnlyRoom,
    actionTypes.setLocalStreamRoom,
    actionTypes.setRemoteStreams,
    actionTypes.setOpenRoom,
    actionTypes.setRoomDetails,
    actionTypes.setScreenSharingStreamRoom,
  ],
};
