import { actionTypes } from "../actions/types";

const initialState = {
  open: false,
  message: "",
};

export const alertReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.showAlert:
      return {
        open: true,
        message: action.payload,
      };

    case actionTypes.hideAlert:
      return {
        open: false,
        message: "",
      };

    default:
      return state;
  }
};
