import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import webPush from 'web-push';

import authRoutes from './routes/authRoutes.js';
import friendInvitationRoutes from './routes/friendInvitationroutes.js';
import groupChatRoutes from './routes/groupChatRoutes.js';

import { createSocketServer } from './socket/socketServer.js';

const PORT = process.env.PORT || 5000;

// If you ever need to generate VAPID keys:
// const vapidKeys = webPush.generateVAPIDKeys();
// console.log(vapidKeys.publicKey);
// console.log(vapidKeys.privateKey);
// console.log(JSON.stringify(vapidKeys));

webPush.setVapidDetails(
  process.env.WEB_PUSH_CONTACT,
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

const app = express();
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true,
};
app.use(cors(corsOptions));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/invite-friend', friendInvitationRoutes);
app.use('/api/group-chat', groupChatRoutes);

const server = http.createServer(app);

// Socket.IO setup
createSocketServer(server);

const MONGO_URI = process.env.MONGOOSE_URL

mongoose
  .connect(MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`SERVER STARTED ON ${PORT}.....!`);
    });
  })
  .catch((err) => {
    console.log('Database connection failed. Server not started.');
    console.error(err);
  });
