import { actionTypes } from "./types";

export const setChosenChatDetails = (chatDetails) => {
  return {
    type: actionTypes.setChosenChatDetails,
    payload: chatDetails,
  };
};

export const setChosenGroupChatDetails = (chatDetails) => {
  return {
    type: actionTypes.setChosenGroupChatDetails,
    payload: chatDetails,
  };
};

export const setMessages = (messages) => {
  return {
    type: actionTypes.setMessages,
    payload: messages,
  };
};

export const addNewMessage = (message) => {
  return {
    type: actionTypes.addNewMessage,
    payload: message,
  };
};

export const setTyping = (typing) => {
  return {
    type: actionTypes.setTyping,
    payload: typing,
  };
};

export const setInitialTypingStatus = (typing) => {
  return {
    type: actionTypes.setInitialTypingStatus,
    payload: typing,
  };
};

export const resetChatAction = () => {
  return {
    type: actionTypes.resetChat,
  };
};