import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import webPush from 'web-push';
import winston from 'winston';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import { createServer } from 'http';
import { createSocketServer } from './socket/socketServer.js';
import authRouter from './routes/authRoutes.js';
import friendRouter from './routes/friendInvitationRoutes.js';
import groupChatRouter from './routes/groupChatRoutes.js';
import recommendationRouter from './routes/recommendationRoutes.js';
import userRouter from './routes/userRoutes.js';
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

/**
 * Initialize Express server with MongoDB and Socket.IO
 */
const initializeServer = async () => {
  const app = express();
  const httpServer = createServer(app);
  const PORT = process.env.PORT || 5000;

  // Configure Web Push
  webPush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  // Configure CORS
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    })
  );

  // Security middlewares
  app.use(helmet());
  app.use(mongoSanitize());
  app.use(express.json({ limit: '10kb' }));

  // Compression
  app.use(compression());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    message: { success: false, message: 'Too many requests, please try again later' },
  });
  app.use(limiter);

  // Stricter rate limit for auth routes
  const authLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 20,
    message: { success: false, message: 'Too many auth requests, please try again later' },
  });
  app.use('/api/auth', authLimiter);

  // Routes
  app.use('/api/auth', authRouter);
  app.use('/api/friends', friendRouter);
  app.use('/api/groupChat', groupChatRouter);
  app.use('/api/recommendations', recommendationRouter);
  app.use('/api/users', userRouter);

  // Health check
  app.get('/health', async (req, res) => {
    try {
      await mongoose.connection.db.admin().ping();
      res.status(200).json({ success: true, status: 'OK', timestamp: new Date() });
    } catch (err) {
      logger.error('Health check failed:', err);
      res.status(500).json({ success: false, message: 'Database unavailable' });
    }
  });

  // Error handling
  app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}, Stack: ${err.stack}`);
    res.status(err.status || 500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  });

  // MongoDB connection
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection failed:', err);
    process.exit(1);
  }

  // Start server
  const io = createSocketServer(httpServer, [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    {
    urls: 'turn:relay.metered.ca:80',
    username: 'demo',
    credential: 'demo',
  },
  ]);
  app.set('socketio', io); // Set Socket.IO instance for controllers

  httpServer.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}...`);
  });

  // Graceful shutdown
  const gracefulShutdown = async () => {
    logger.info('Shutting down server...');
    httpServer.close(async () => {
      await mongoose.connection.close();
      logger.info('Server shutdown complete');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  return app;
};

// Clustering for multi-core support
if (cluster.isPrimary) {
  const numCPUs = availableParallelism();
  logger.info(`Primary process starting ${numCPUs} workers...`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died with code ${code}, signal ${signal}. Restarting...`);
    cluster.fork();
  });
} else {
  initializeServer();
}

export default initializeServer;