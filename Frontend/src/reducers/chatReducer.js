import { actionTypes } from "../actions/types";

const ChatTypes = {
  direct: "DIRECT",
  group: "GROUP",
};

const initialState = {
  chosenChatDetails: null,
  chosenGroupChatDetails: null,
  typing: [],
  chatType: ChatTypes.direct,
  messages: [],
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.setChosenChatDetails:
      return {
        ...state,
        chosenGroupChatDetails: null,
        messages: [],
        chosenChatDetails: {
          ...action.payload,
          typing: {
            typing: false,
            userId: "",
          },
        },
      };

    case actionTypes.setChosenGroupChatDetails:
      return {
        ...state,
        chosenChatDetails: null,
        messages: [],
        chosenGroupChatDetails: action.payload,
      };

    case actionTypes.setMessages:
      return {
        ...state,
        messages: action.payload,
      };

    case actionTypes.addNewMessage:
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case actionTypes.setInitialTypingStatus:
      return {
        ...state,
        typing: action.payload,
      };

    case actionTypes.setTyping:
      return {
        ...state,
        typing: state.typing.map((item) =>
          item.userId === action.payload.userId ? action.payload : item
        ),
      };

    case actionTypes.resetChat:
      return {
        ...state,
        chosenChatDetails: null,
        chosenGroupChatDetails: null,
        messages: [],
      };

    default:
      return state;
  }
};

export { chatReducer };
