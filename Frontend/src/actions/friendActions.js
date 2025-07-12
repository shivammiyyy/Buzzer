import {
  acceptFriendRequest,
  inviteFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from "../api/api";
import { showAlert } from "./alertActions";
import { resetChatAction } from "./chatActions";
import { actionTypes } from "./types";

export const inviteFriend = (email, closeDialogHandler) => {
  return async (dispatch) => {
    const response = await inviteFriendRequest({ email });

    if (response === "Invitation has been sent successfully") {
      closeDialogHandler();
      dispatch(showAlert(response));
    } else {
      dispatch(showAlert(response.message));
    }
  };
};

export const setPendingInvitations = (pendingInvitations) => {
  return {
    type: actionTypes.setPendingInvitations,
    payload: pendingInvitations,
  };
};

export const setFriends = (friends) => {
  return {
    type: actionTypes.setFriends,
    payload: friends,
  };
};

export const setOnlineUsers = (onlineUsers) => {
  return {
    type: actionTypes.setOnlineUsers,
    payload: onlineUsers,
  };
};

export const setGroupChatList = (chatList) => {
  return {
    type: actionTypes.setGroupChatList,
    payload: chatList,
  };
};

export const rejectInvitation = (invitationId) => {
  return async (dispatch) => {
    const response = await rejectFriendRequest(invitationId);

    if (response === "Invitation rejected successfully!") {
      dispatch(showAlert(response));
    } else {
      dispatch(showAlert(response.message));
    }
  };
};

export const acceptInvitation = (invitationId) => {
  return async (dispatch) => {
    const response = await acceptFriendRequest(invitationId);

    if (response === "Invitation accepted successfully!") {
      dispatch(showAlert(response));
    } else {
      dispatch(showAlert(response.message));
    }
  };
};

export const removeFriendAction = ({ friendId, friendName }) => {
  return async (dispatch) => {
    const response = await removeFriend({ friendId });

    if (response === "Friend removed successfully!") {
      dispatch(showAlert(`You removed ${friendName} from your list of friends!`));
      dispatch(resetChatAction());
    } else {
      dispatch(showAlert(response.message));
    }
  };
};

export const resetFriendsAction = () => {
  return {
    type: actionTypes.resetFriends,
  };
};