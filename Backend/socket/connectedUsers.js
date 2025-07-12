const connectedUsers = new Map();
let io = null;

export const addNewConnectedUser = ({ socketId, userId }) => {
  connectedUsers.set(socketId, { userId });
};

export const removeConnectedUser = ({ socketId }) => {
  if (connectedUsers.has(socketId)) {
    connectedUsers.delete(socketId);
  }
};

export const getActiveConnections = (userId) => {
  const activeConnections = [];

  connectedUsers.forEach((value, key) => {
    if (value.userId === userId) {
      activeConnections.push(key);
    }
  });

  return activeConnections;
};

export const getOnlineUsers = () => {
  const onlineUsers = [];

  connectedUsers.forEach((value, key) => {
    onlineUsers.push({
      userId: value.userId,
      socketId: key,
    });
  });

  return onlineUsers;
};

export const setServerSocketInstance = (ioInstance) => {
  io = ioInstance;
};

export const getServerSocketInstance = () => {
  return io;
};
