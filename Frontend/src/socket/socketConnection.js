import { io } from 'socket.io-client';
import {
  setFriends,
  setGroupChatList,
  setOnlineUsers,
  setPendingInvitations,
} from '../actions/friendActions';
import {
  addNewMessage,
  setInitialTypingStatus,
  setMessages,
  setTyping,
} from '../actions/chatActions';
import { store } from '../store';
import {
  setCallRequest,
  setCallStatus,
  setOtherUserId,
  setRemoteStream,
  clearVideoChat,
  setAudioOnly,
} from '../actions/videoChatActions';
import {
  getLocalStreamPreview,
  handleParticipantLeftRoom,
  handleSignalingData,
  newPeerConnection,
  prepareNewPeerConnection,
} from './webRTC';
import {
  initialRoomsUpdate,
  newRoomCreated,
  updateActiveRooms,
} from './roomHandler';

let currentPeerConnection = null;
const setCurrentPeerConnection = (peerConnection) => {
  currentPeerConnection = peerConnection;
};

let socket;
const SERVER_URL = 'http://localhost:5000';

const connectWithSocketServer = (userDetails) => {
  socket = io(SERVER_URL, {
    auth: {
      token: userDetails.token,
    },
  });

  socket.on('connect', () => {
    console.log(`Connected with socket.id: ${socket.id}`);
  });

  socket.emit('helloFomClient');

  socket.on('friend-invitations', (data) => store.dispatch(setPendingInvitations(data)));

  socket.on('friends-list', (data) => {
    const typingStatus = data.map((f) => ({ userId: f.id, typing: false }));
    store.dispatch(setInitialTypingStatus(typingStatus));
    store.dispatch(setFriends(data));
  });

  socket.on('online-users', (data) => store.dispatch(setOnlineUsers(data)));
  socket.on('groupChats-list', (data) => store.dispatch(setGroupChatList(data)));

  socket.on('direct-chat-history', ({ messages, participants }) => {
    const chat = store.getState().chat.chosenChatDetails;
    if (chat) {
      const receiverId = chat.userId;
      const senderId = store.getState().auth.userDetails._id;
      if (participants.includes(receiverId) && participants.includes(senderId)) {
        store.dispatch(setMessages(messages));
      }
    }
  });

  socket.on('group-chat-history', ({ messages, groupChatId }) => {
    const chat = store.getState().chat.chosenGroupChatDetails;
    if (chat && chat.groupId === groupChatId) {
      store.dispatch(setMessages(messages));
    }
  });

  socket.on('direct-message', ({ newMessage, participants }) => {
    const chat = store.getState().chat.chosenChatDetails;
    if (chat) {
      const receiverId = chat.userId;
      const senderId = store.getState().auth.userDetails._id;
      if (participants.includes(receiverId) && participants.includes(senderId)) {
        store.dispatch(addNewMessage(newMessage));
      }
    }
  });

  socket.on('group-message', ({ newMessage, groupChatId }) => {
    const chat = store.getState().chat.chosenGroupChatDetails;
    if (chat && chat.groupId === groupChatId) {
      store.dispatch(addNewMessage(newMessage));
    }
  });

  socket.on('notify-typing', ({ senderUserId, typing }) => {
    store.dispatch(setTyping({ typing, userId: senderUserId }));
  });

  socket.on('call-request', (data) => store.dispatch(setCallRequest(data)));
  socket.on('notify-chat-left', () => store.dispatch(clearVideoChat('User left the chat...!')));

  socket.on('room-create', newRoomCreated);
  socket.on('active-rooms', updateActiveRooms);
  socket.on('active-rooms-initial', initialRoomsUpdate);

  socket.on('conn-prepare', ({ connUserSocketId }) => {
    prepareNewPeerConnection(connUserSocketId, false);
    socket.emit('conn-init', { connUserSocketId });
  });

  socket.on('conn-init', ({ connUserSocketId }) => {
    prepareNewPeerConnection(connUserSocketId, true);
  });

  socket.on('conn-signal', handleSignalingData);
  socket.on('room-participant-left', handleParticipantLeftRoom);
};

const sendDirectMessage = (data) => socket.emit('direct-message', data);
const sendGroupMessage = (data) => socket.emit('group-message', data);
const fetchDirectChatHistory = (data) => socket.emit('direct-chat-history', data);
const fetchGroupChatHistory = (data) => socket.emit('group-chat-history', data);
const notifyTyping = (data) => socket.emit('notify-typing', data);

const callRequest = (data) => {
  const peer = newPeerConnection(true);
  setCurrentPeerConnection(peer);

  peer.on('signal', (signal) => {
    socket.emit('call-request', { ...data, signal });
  });

  peer.on('stream', (stream) => store.dispatch(setRemoteStream(stream)));

  socket.on('call-response', (res) => {
    store.dispatch(setCallStatus(res.accepted ? 'accepted' : 'rejected'));
    if (res.accepted && res.signal) {
      store.dispatch(setOtherUserId(res.otherUserId));
      peer.signal(res.signal);
    }
  });

  getLocalStreamPreview(data.audioOnly, () => {
    store.dispatch(setCallStatus('ringing'));
    store.dispatch(setAudioOnly(data.audioOnly));
  });
};

const callResponse = (data) => {
  if (!data.accepted) return store.dispatch(setCallRequest(null));

  const peer = newPeerConnection(false);
  setCurrentPeerConnection(peer);

  peer.on('signal', (signal) => {
    socket.emit('call-response', { ...data, signal });
  });
  peer.on('stream', (stream) => store.dispatch(setRemoteStream(stream)));

  peer.signal(store.getState().videoChat.callRequest.signal);

  getLocalStreamPreview(data.audioOnly, () => {
    store.dispatch(setCallRequest(null));
    store.dispatch(setAudioOnly(data.audioOnly));
  });
};

const notifyChatLeft = (receiverUserId) => socket.emit('notify-chat-left', { receiverUserId });
const createNewRoom = () => socket.emit('room-create');
const joinRoom = (data) => socket.emit('room-join', data);
const leaveRoom = (data) => socket.emit('room-leave', data);
const signalPeerData = (data) => socket.emit('conn-signal', data);

export {
  connectWithSocketServer,
  sendDirectMessage,
  sendGroupMessage,
  fetchDirectChatHistory,
  fetchGroupChatHistory,
  notifyTyping,
  callRequest,
  callResponse,
  notifyChatLeft,
  createNewRoom,
  joinRoom,
  leaveRoom,
  signalPeerData,
  setCurrentPeerConnection,
  currentPeerConnection,
};
