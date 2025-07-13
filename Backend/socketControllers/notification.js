import dotenv from 'dotenv';
dotenv.config(); // Ensure .env is loaded before using env vars

import webPush from 'web-push';
import winston from 'winston';
import User from '../models/userModel.js';

// Validate VAPID environment variables
if (
  !process.env.VAPID_PUBLIC_KEY ||
  !process.env.VAPID_PRIVATE_KEY ||
  !process.env.VAPID_EMAIL
) {
  throw new Error('Missing VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, or VAPID_EMAIL in .env');
}

// Setup winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

// Setup web-push with VAPID keys
webPush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send push notification to a user
 * @param {Object} param - Notification details
 * @param {Object} param.sender - Sender user document
 * @param {Object} param.receiver - Receiver user document
 * @param {Object} param.message - Message document
 * @param {string} [param.conversationId] - Conversation ID
 * @param {string} [param.groupChatId] - Group chat ID
 */
const sendPushNotification = async ({
  sender,
  receiver,
  message,
  conversationId = null,
  groupChatId = null
}) => {
  try {
    if (!receiver?.pushSubscription?.length) {
      logger.info(`No push subscriptions found for user: ${receiver?._id}`);
      return;
    }

    const isGroupMessage = message.type === 'GROUP';
    const title = isGroupMessage
      ? `${sender.username} in group`
      : sender.username;
    const body =
      message.content.length > 100
        ? `${message.content.substring(0, 100)}...`
        : message.content;

    const notificationPayload = {
      title,
      body,
      tag: message._id.toString(),
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        messageId: message._id,
        senderId: sender._id,
        senderUsername: sender.username,
        type: message.type,
        conversationId,
        groupChatId,
        url: isGroupMessage
          ? `/group/${groupChatId}`
          : `/chat/${sender._id}`,
        timestamp: new Date().toISOString(),
      },
      actions: [
        { action: 'reply', title: 'Reply', icon: '/reply-icon.png' },
        { action: 'view', title: 'View', icon: '/view-icon.png' },
      ],
      requireInteraction: false,
      silent: false,
    };

    const notificationPromises = receiver.pushSubscription.map(
      async (sub, index) => {
        try {
          await webPush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            JSON.stringify(notificationPayload),
            {
              TTL: 24 * 60 * 60, // 1 day
              urgency: 'normal',
              topic: `message-${receiver._id}`,
            }
          );
          logger.info(
            `Push notification sent to device ${index + 1} for user ${receiver._id}`
          );
          return { success: true, index };
        } catch (error) {
          logger.error(
            `Failed to send push notification to device ${index + 1}:`,
            error
          );
          if (error.statusCode === 410 || error.statusCode === 404) {
            return { success: false, index, removeSubscription: true };
          }
          return { success: false, index, error: error.message };
        }
      }
    );

    const results = await Promise.allSettled(notificationPromises);
    const subscriptionsToRemove = results
      .map((result, index) =>
        result.status === 'fulfilled' && result.value.removeSubscription
          ? index
          : null
      )
      .filter((index) => index !== null);

    if (subscriptionsToRemove.length > 0) {
      receiver.pushSubscription = receiver.pushSubscription.filter(
        (_, index) => !subscriptionsToRemove.includes(index)
      );
      await receiver.save();
      logger.info(
        `Removed ${subscriptionsToRemove.length} invalid subscriptions for user ${receiver._id}`
      );
    }

    const successCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;
    logger.info(
      `Push notifications: ${successCount}/${receiver.pushSubscription.length} sent for user ${receiver._id}`
    );
  } catch (err) {
    logger.error(
      `Push notification system error for user ${receiver?._id}:`,
      err
    );
  }
};

export default sendPushNotification;
