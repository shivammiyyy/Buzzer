import webPush from 'web-push';
import User from '../models/userModel.js';

const sendPushNotification = async ({ 
  receiver, 
  sender, 
  message, 
  conversationId = null, 
  groupChatId = null 
}) => {
  try {
    if (!receiver?.pushSubscription?.length) {
      console.log('No push subscriptions for user:', receiver?._id);
      return;
    }

    // Create notification payload
    const isGroupMessage = message.type === 'GROUP';
    const title = isGroupMessage 
      ? `${sender.username} in group` 
      : sender.username;

    let body = message.content;
    if (body.length > 100) {
      body = `${body.substring(0, 100)}...`;
    }

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
        {
          action: 'reply',
          title: 'Reply',
          icon: '/reply-icon.png'
        },
        {
          action: 'view',
          title: 'View',
          icon: '/view-icon.png'
        }
      ],
      requireInteraction: false,
      silent: false,
    };

    // Send to all user's devices
    const notificationPromises = receiver.pushSubscription.map(async (sub, index) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.keys.auth,
            p256dh: sub.keys.p256dh,
          },
        };

        await webPush.sendNotification(
          pushSubscription,
          JSON.stringify(notificationPayload),
          {
            TTL: 24 * 60 * 60, // 24 hours
            urgency: 'normal',
            topic: `message-${receiver._id}`,
          }
        );
        
        console.log(`✅ Push notification sent to device ${index + 1}`);
        return { success: true, index };
        
      } catch (error) {
        console.error(`❌ Failed to send push notification to device ${index + 1}:`, error);
        
        // Handle invalid subscriptions
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`🗑️ Removing invalid subscription for device ${index + 1}`);
          return { success: false, index, removeSubscription: true };
        }
        
        return { success: false, index, error: error.message };
      }
    });

    const results = await Promise.allSettled(notificationPromises);
    
    // Remove invalid subscriptions
    const subscriptionsToRemove = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.removeSubscription) {
        subscriptionsToRemove.push(index);
      }
    });

    if (subscriptionsToRemove.length > 0) {
      // Remove invalid subscriptions from database
      receiver.pushSubscription = receiver.pushSubscription.filter(
        (_, index) => !subscriptionsToRemove.includes(index)
      );
      await receiver.save();
      console.log(`🗑️ Removed ${subscriptionsToRemove.length} invalid subscriptions`);
    }

    const successCount = results.filter(
      result => result.status === 'fulfilled' && result.value.success
    ).length;
    
    console.log(`📱 Push notifications: ${successCount}/${receiver.pushSubscription.length} sent successfully`);
    
  } catch (error) {
    console.error('❌ Push notification system error:', error);
  }
};

export default sendPushNotification;