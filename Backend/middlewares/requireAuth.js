import jwt from 'jsonwebtoken';
import winston from 'winston';
import { blacklistToken } from './requireSocketAuth.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// In-memory Set for blacklisted tokens (shared with requireSocketAuth.js)
const blacklistedTokens = new Set();

/**
 * Middleware to authenticate requests using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireAuth = async (req, res, next) => {
  try {
    // Restrict token source to Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn(`Missing or invalid Authorization header from IP: ${req.ip}`);
      return res.status(401).json({ success: false, message: 'Unauthorized. Bearer token required.' });
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted
    if (blacklistedTokens.has(token)) {
      logger.warn(`Blacklisted token used from IP: ${req.ip}`);
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate payload
    if (!decoded.userId || !decoded.email || !decoded.username) {
      logger.warn(`Invalid JWT payload from IP: ${req.ip}`);
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    req.user = decoded;
    logger.debug(`Authenticated user: ${decoded.userId} from IP: ${req.ip}`);
    next();
  } catch (err) {
    logger.error(`JWT verification error from IP: ${req.ip}: ${err.message}`);
    const message =
      err.name === 'TokenExpiredError'
        ? 'Token has expired'
        : 'Invalid or expired token';
    return res.status(401).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? message : err.message,
    });
  }
};

// Export blacklistToken for consistency with requireSocketAuth.js
export { blacklistToken };

export default requireAuth;