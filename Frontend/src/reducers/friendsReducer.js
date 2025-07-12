import { actionTypes } from "../actions/types";

const initialState = {
  friends: [],
  pendingInvitations: [],
  onlineUsers: [],
  groupChatList: [],
};

const friendsReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.setPendingInvitations:
      return {
        ...state,
        pendingInvitations: action.payload,
      };

    case actionTypes.setFriends:
      return {
        ...state,
        friends: action.payload,
      };

    case actionTypes.setOnlineUsers:
      return {
        ...state,
        onlineUsers: action.payload,
      };

    case actionTypes.setGroupChatList:
      return {
        ...state,
        groupChatList: action.payload,
      };

    case actionTypes.resetFriends:
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

export { friendsReducer };
