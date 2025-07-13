import jwt from 'jsonwebtoken';
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// In-memory Set for blacklisted tokens
const blacklistedTokens = new Set();

/**
 * Add a token to the blacklist
 * @param {string} token - JWT token to blacklist
 */
export const blacklistToken = (token) => {
  try {
    blacklistedTokens.add(token);
    logger.info(`Token blacklisted: ${token.slice(0, 10)}...`);
  } catch (err) {
    logger.error(`Error blacklisting token: ${err.message}`);
  }
};

/**
 * Middleware to authenticate Socket.IO connections using JWT
 * @param {Object} socket - Socket.IO socket object
 * @param {Function} next - Socket.IO next middleware function
 */
const requireSocketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const clientIp = socket.handshake.address;

    if (!token) {
      logger.warn(`Missing token in Socket.IO connection from IP: ${clientIp}`);
      const error = new Error('Unauthorized. Token required.');
      error.data = { success: false, message: 'Unauthorized. Token required.' };
      error.status = 403;
      return next(error);
    }

    // Check if token is blacklisted
    if (blacklistedTokens.has(token)) {
      logger.warn(`Blacklisted token used in Socket.IO connection from IP: ${clientIp}`);
      const error = new Error('Invalid or expired token');
      error.data = { success: false, message: 'Invalid or expired token' };
      error.status = 403;
      return next(error);
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate payload
    if (!decoded.userId || !decoded.email || !decoded.username) {
      logger.warn(`Invalid JWT payload in Socket.IO connection from IP: ${clientIp}`);
      const error = new Error('Invalid token payload');
      error.data = { success: false, message: 'Invalid token payload' };
      error.status = 403;
      return next(error);
    }

    socket.user = decoded;
    logger.debug(`Authenticated Socket.IO user: ${decoded.userId} from IP: ${clientIp}`);
    return next();
  } catch (err) {
    logger.error(`Socket.IO JWT verification error from IP: ${socket.handshake.address}: ${err.message}`);
    const message =
      err.name === 'TokenExpiredError'
        ? 'Token has expired'
        : 'Invalid or expired token';
    const error = new Error(message);
    error.data = {
      success: false,
      message: process.env.NODE_ENV === 'production' ? message : err.message,
    };
    error.status = 403;
    return next(error);
  }
};

export default requireSocketAuth;