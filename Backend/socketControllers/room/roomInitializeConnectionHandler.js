import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

/**
 * Handle WebRTC connection initialization
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} data - Data containing connUserSocketId
 */
const roomInitializeConnectionHandler = async (socket, data) => {
  try {
    const { connUserSocketId } = data;

    if (!connUserSocketId) {
      logger.warn(`Invalid connUserSocketId for conn-init: ${connUserSocketId}`);
      socket.emit('room-error', { success: false, message: 'Invalid connection user' });
      return;
    }

    socket.to(connUserSocketId).emit('conn-init', {
      success: true,
      connUserSocketId: socket.id,
    });
    logger.info(`Connection initialized: ${socket.id} to ${connUserSocketId}`);
  } catch (err) {
    logger.error(`Conn-init error for socket ${socket.id}:`, err);
    socket.emit('room-error', {
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

export default roomInitializeConnectionHandler;