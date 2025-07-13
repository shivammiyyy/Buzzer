import { io } from 'socket.io-client';

const socket = io(
  import.meta.env.MODE === 'production' ? window.location.origin : 'http://localhost:5000',
  {
    autoConnect: false,
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 3,
  }
);

// 🔌 General connection events
socket.on('connect_error', (err) => {
  console.error('Socket connection error [Socket ID: %s]: %s', socket.id || 'N/A', err.message);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected [Socket ID: %s]', socket.id || 'N/A');
});

/**
 * Connect to the socket with a JWT token
 * @param {string} token - JWT token for authentication
 */
export const connectSocket = (token) => {
  if (token && !socket.connected) {
    socket.auth = { token: `Bearer ${token}` };
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const on = (event, callback) => socket.on(event, callback);
export const emit = (event, data) => socket.emit(event, data);
export const off = (event, callback) => socket.off(event, callback);

// ✅ WebRTC Call Events
export const callEvents = {
  createRoom: () => emit('room-create'),
  joinRoom: (roomId) => emit('room-join', { roomId }),
  leaveRoom: (roomId) => emit('room-leave', { roomId }),
  initConnection: (targetSocketId) => emit('conn-init', { targetSocketId }),
  sendSignal: (targetSocketId, signal) => emit('conn-signal', { targetSocketId, signal }),
  endCall: (roomId) => emit('call-end', { roomId }),

  requestCall: (data) => emit('call-request', data),
  onCallRequest: (callback) => on('call-request', callback),

  respondCall: (data) => emit('call-response', data),
  onCallResponse: (callback) => on('call-response', callback),

  onRoomCreate: (callback) => on('room-create', callback),
  onRoomJoin: (callback) => on('room-join', callback),
  onRoomLeave: (callback) => on('room-leave', callback),
  onSignalingData: (callback) => on('conn-signal', callback),
  onInitConnection: (callback) => on('conn-init', callback),
  onCallUpdate: (callback) => on('call-update', callback),
  onICEServers: (callback) => on('ice-servers', callback),
  onCallEnd: (callback) => on('call-end', callback),
};

// ✅ Chat Events
export const chatEvents = {
  sendMessage: (receiverUserId, message) => emit('direct-message', { receiverUserId, message }),
  onMessageReceived: (callback) => on('direct-message', callback),
  getChatHistory: (receiverUserId) => emit('direct-chat-history', { receiverUserId }),
  onChatHistory: (callback) => on('direct-chat-history', callback),
};

// ✅ Group Chat Events
export const groupChatEvents = {
  sendMessage: (groupChatId, message) => emit('group-message', { groupChatId, message }),
  onMessageReceived: (callback) => on('group-message', callback),
  getGroupChatHistory: (groupChatId) => emit('group-chat-history', { groupChatId }),
  onGroupChatHistory: (callback) => on('group-chat-history', callback),
};

// ✅ Typing & Chat Leave
export const miscChatEvents = {
  notifyTyping: (data) => emit('notify-typing', data),
  onTyping: (callback) => on('notify-typing', callback),
  notifyChatLeft: (data) => emit('notify-chat-left', data),
};

// ✅ Friend Recommendations
export const friendEvents = {
  requestRecommendations: () => emit('friend-recommendations-update'),
  onRecommendationsUpdate: (callback) => on('friend-recommendations-update', callback),
};

// ✅ Notifications
export const notificationEvents = {
  onNotification: (callback) => on('push-notification', callback),
};

// ✅ Online Users
export const onlineUserEvents = {
  onUpdate: (callback) => on('online-users', callback),
};

// ✅ WebRTC Signaling (generic export)
export const signalPeerData = (data) => emit('conn-signal', data);

export default socket;

let currentPeerConnection = null; // for local WebRTC peer mgmt (optional)
