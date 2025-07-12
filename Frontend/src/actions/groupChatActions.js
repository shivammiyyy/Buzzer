import {
  createGroupChat,
  addMembersToGroup,
  leaveGroup,
  deleteGroup,
} from "../api/api";
import { showAlert } from "./alertActions";
import { resetChatAction } from "./chatActions";

export const createGroupChatAction = (name, closeDialogHandler) => {
  return async (dispatch) => {
    const response = await createGroupChat(name);

    if (response === "Group created successfully") {
      closeDialogHandler();
      dispatch(showAlert(response));
    } else {
      dispatch(showAlert(response.message));
    }
  };
};

export const addMembersToGroupAction = (args, closeDialogHandler) => {
  return async (dispatch) => {
    const response = await addMembersToGroup(args);

    if (response === "Members added successfully!") {
      closeDialogHandler();
      dispatch(showAlert(response));
    } else {
      dispatch(showAlert(response.message));
    }
  };
};

export const leaveGroupAction = (args) => {
  return async (dispatch) => {
    const response = await leaveGroup(args);

    if (response === "You have left the group!") {
      dispatch(showAlert(response));
      dispatch(resetChatAction());
    } else {
      dispatch(showAlert(response.message));
    }
  };
};

export const deleteGroupAction = ({ groupChatId, groupChatName }) => {
  return async (dispatch) => {
    const response = await deleteGroup({ groupChatId });

    if (response === "Group deleted successfully!") {
      dispatch(showAlert(`You deleted the "${groupChatName}" group!`));
      dispatch(resetChatAction());
    } else {
      dispatch(showAlert(response.message));
    }
  };
};
