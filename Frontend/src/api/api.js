import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000,
});

// Request Interceptor for Authorization Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 404:
          return Promise.reject(new Error('Resource not found'));
        default:
          return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// ✅ Auth API
export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ✅ User API
export const userApi = {
  updateProfile: (data) => api.put('/users/profile', data),
  savePushSubscription: (subscription) => api.post('/users/push-subscription', { subscription }),
  searchUsers: (query) => api.get(`/users?search=${encodeURIComponent(query)}`),
};

// ✅ Friend API
export const friendApi = {
  inviteFriend: (email) => api.post('/friends/invitations', { email }),
  acceptInvitation: (invitationId) => api.post('/friends/invitations/accept', { invitationId }),
  rejectInvitation: (invitationId) => api.post('/friends/invitations/reject', { invitationId }),
  removeFriend: (friendId) => api.post('/friends/friends/remove', { friendId }),
  getInvitations: () => api.get('/friends/invitations'), // make sure this is supported
};

// ✅ Group Chat API
export const groupChatApi = {
  createGroup: (data) => api.post('/groupChat/create', data),
  addMembers: (data) => api.post('/groupChat/add-members', data),
  leaveGroup: (groupChatId) => api.post('/groupChat/leave', { groupChatId }),
  deleteGroup: (groupChatId) => api.post('/groupChat/delete', { groupChatId }),
};

// ✅ Recommendation API
export const recommendationApi = {
  getRecommendations: (limit = 10) => api.get(`/recommendations?limit=${encodeURIComponent(limit)}`),
};

export default api;
