import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

/**
 * Handle WebRTC signaling data exchange
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} data - Data containing connUserSocketId and signal
 */
const roomSignalingDataHandler = async (socket, data) => {
  try {
    const { connUserSocketId, signal } = data;

    if (!connUserSocketId || !signal) {
      logger.warn(`Invalid signaling data: connUserSocketId=${connUserSocketId}, signal=${JSON.stringify(signal)}`);
      socket.emit('room-error', { success: false, message: 'Invalid signaling data' });
      return;
    }

    socket.to(connUserSocketId).emit('conn-signal', {
      success: true,
      signal,
      connUserSocketId: socket.id,
    });
    logger.info(`Signaling data sent from ${socket.id} to ${connUserSocketId}`);
  } catch (err) {
    logger.error(`Signaling data error for socket ${socket.id}:`, err);
    socket.emit('room-error', {
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

export default roomSignalingDataHandler;