import mongoose from 'mongoose';
import Joi from 'joi';
import User from '../models/userModel.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

// Validation schema
const recommendationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(10),
});

/**
 * Get recommended friends for the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getRecommendedFriends = async (req, res) => {
  try {
    const { error, value } = recommendationSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { limit } = value;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.warn(`Invalid user ID: ${userId}`);
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await User.findById(userId)
      .populate('friends', '_id username email')
      .populate('groupChats', 'participants')
      .lean();

    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get friends of friends
    const friendsOfFriends = new Set();
    for (const friend of user.friends) {
      const friendData = await User.findById(friend._id)
        .populate('friends', '_id username email')
        .lean();
      friendData.friends.forEach((f) => {
        if (f._id.toString() !== userId && !user.friends.some((u) => u._id.toString() === f._id.toString())) {
          friendsOfFriends.add(JSON.stringify({ id: f._id, username: f.username, email: f.email }));
        }
      });
    }

    // Get users from group chats
    const groupMembers = new Set();
    for (const group of user.groupChats) {
      for (const p of group.participants) {
        if (p.toString() !== userId && !user.friends.some((f) => f._id.toString() === p.toString())) {
          const participant = await User.findById(p).select('_id username email').lean();
          if (participant) {
            groupMembers.add(JSON.stringify({ id: p, username: participant.username, email: participant.email }));
          }
        }
      }
    }

    // Combine and limit recommendations
    const recommendations = [...friendsOfFriends, ...groupMembers]
      .map((item) => JSON.parse(item))
      .slice(0, limit);

    logger.info(`Fetched ${recommendations.length} friend recommendations for user ${userId}`);
    return res.status(200).json({ success: true, data: { recommendations } });
  } catch (err) {
    logger.error(`Get recommended friends error for user ${req.user.userId}:`, err);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};