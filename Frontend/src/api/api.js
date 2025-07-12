import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
// For production:
// const BASE_URL = 'https://talkhouse-server.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT token automatically to requests if present
api.interceptors.request.use(
  (config) => {
    const userDetails = localStorage.getItem('currentUser');
    if (userDetails) {
      try {
        const token = JSON.parse(userDetails)?.token;
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Failed to parse token:", e);
      }
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// Logout utility
const logOut = () => {
  localStorage.clear();
  window.location.pathname = '/login';
};

// Centralized error handler
const checkForAuthorization = (error) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403) {
    logOut();
  }
};

// === AUTH ===
export const login = async (data) => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error) {
    checkForAuthorization(error);
    return { error: true, message: error.response?.data || error.message };
  }
};

export const register = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error) {
    checkForAuthorization(error);
    return { error: true, message: error.response?.data || error.message };
  }
};

export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    checkForAuthorization(error);
    return {
      error: true,
      statusCode: error?.response?.status,
      message: error?.response?.data || error.message,
    };
  }
};

// === SUBSCRIPTION ===
export const saveUserSubscription = async (data) => {
  try {
    const response = await api.post('/auth/subscribe', data);
    return response.data;
  } catch (error) {
    return { error: true, message: error.response?.data || error.message };
  }
};

export const removeUserSubscription = async (data) => {
  try {
    const response = await api.post('/auth/unsubscribe', data);
    return response.data;
  } catch (error) {
    return { error: true, message: error.response?.data || error.message };
  }
};

// === FRIEND INVITATIONS ===
export const inviteFriendRequest = async (data) => {
  try {
    const response = await api.post('/invite-friend/invite', data);
    return response.data;
  } catch (error) {
    return { error: true, message: error.response?.data || error.message };
  }
};

export const acceptFriendRequest = async (invitationId) => {
  try {
    const response = await api.post('/invite-friend/accept', { invitationId });
    return response.data;
  } catch (error) {
    return { error: true, message: error.response?.data || error.message };
  }
};

export const rejectFriendRequest = async (invitationId) => {
  try {
    const response = await api.post('/invite-friend/reject', { invitationId });
    return response.data;
  } catch (error) {
    return { error: true, message: error.response?.data || error.message };
  }
};

export const removeFriend = async (data) => {
  try {
    const response = await api.post('/invite-friend/remove', data);
    return response.data;
  } catch (error) {
    return { error: true, message: error.response?.data || error.message };
  }
};

// === GROUP CHAT ===
export const createGroupChat = async (name) => {
  try {
    const response = await api.post('/group-chat', { name });
    return response.data;
  } catch (error) {
    return { error: true, message: error.response?.data || error.message };
  }
};

export const addMembersToGroup = async (data) => {
  try {
    const response = await api.post('/group-chat/add', data);
    return response.data;
  } catch (error) {
    return { error: true, message: error.response?.data || error.message };
  }
};

export const leaveGroup = async (data) => {
  try {
    const response = await api.post('/group-chat/leave', data);
    return response.data;
  } catch (error) {
    return { error: true, message: error.response?.data || error.message };
  }
};

export const deleteGroup = async (data) => {
  try {
    const response = await api.post('/group-chat/delete', data);
    return response.data;
  } catch (error) {
    return { error: true, message: error.response?.data || error.message };
  }
};
