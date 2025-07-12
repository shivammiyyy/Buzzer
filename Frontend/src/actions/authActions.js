import { login, register, getMe } from "../api/api";
import { showAlert } from "./alertActions";
import { resetChatAction } from "./chatActions";
import { resetFriendsAction } from "./friendActions";
import { actionTypes } from "./types";
import { unsubscribeUserToPush } from "../notifications";

export const loginUser = (credentials) => {
  return async (dispatch) => {
    const response = await login(credentials);

    if ("error" in response) {
      dispatch({
        type: actionTypes.authError,
        payload: response.message,
      });

      dispatch(showAlert(response.message));
    } else {
      localStorage.setItem("currentUser", JSON.stringify(response.userDetails));
      dispatch({
        type: actionTypes.authenticate,
        payload: response.userDetails,
      });

      dispatch(
        showAlert(`Hi, ${response.userDetails.username} 👋. Welcome back.`)
      );
    }
  };
};

export const registerUser = (credentials) => {
  return async (dispatch) => {
    const response = await register(credentials);

    if ("error" in response) {
      dispatch({
        type: actionTypes.authError,
        payload: response.message,
      });

      dispatch(showAlert(response.message));
    } else {
      localStorage.setItem("currentUser", JSON.stringify(response.userDetails));
      dispatch({
        type: actionTypes.authenticate,
        payload: response.userDetails,
      });

      dispatch(
        showAlert(
          `Hi 👋 ${response.userDetails.username}. Welcome to TalkHouse.`
        )
      );
    }
  };
};

export const autoLogin = () => {
  return async (dispatch) => {
    dispatch({
      type: actionTypes.authLoading,
      payload: true,
    });

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const response = await getMe();

    if (response.statusCode === 401 || response.statusCode === 403) {
      localStorage.clear();
      dispatch({
        type: actionTypes.authLoading,
        payload: false,
      });
    } else {
      if (currentUser.token) {
        dispatch({
          type: actionTypes.authenticate,
          payload: {
            ...response.me,
            token: currentUser.token,
          },
        });
      }
    }
  };
};

export const logoutUser = () => {
  return async (dispatch) => {
    unsubscribeUserToPush(() => {
      localStorage.removeItem("currentUser");
    });

    dispatch({ type: actionTypes.logout });
    dispatch(resetChatAction());
    dispatch(resetFriendsAction());
    dispatch({ type: actionTypes.resetChat });
  };
};