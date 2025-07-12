import User from '../models/userModel.js';
import FriendInvitation from '../models/friendInviteModel.js';
import { asyncHandler } from '../middlewares/validation.js';

/**
 * Get friend recommendations based on mutual friends and common interests
 */
export const getFriendRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { limit = 10, page = 1 } = req.query;

  const user = await User.findById(userId).populate('friends', '_id');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const friendIds = user.friends.map(friend => friend._id);
  const blockedUserIds = user.blockedUsers || [];

  // Get pending invitations to exclude them
  const pendingInvitations = await FriendInvitation.find({
    $or: [
      { senderId: userId },
      { receiverId: userId }
    ]
  });

  const pendingUserIds = pendingInvitations.map(inv => 
    inv.senderId.toString() === userId ? inv.receiverId : inv.senderId
  );

  // Find users with mutual friends
  const mutualFriendsRecommendations = await User.aggregate([
    {
      $match: {
        _id: { 
          $nin: [
            ...friendIds, 
            ...blockedUserIds, 
            ...pendingUserIds.map(id => id), 
            userId
          ] 
        },
        'privacy.allowFriendRequests': true,
      }
    },
    {
      $addFields: {
        mutualFriendsCount: {
          $size: {
            $setIntersection: ['$friends', friendIds]
          }
        }
      }
    },
    {
      $match: {
        mutualFriendsCount: { $gt: 0 }
      }
    },
    {
      $sort: { mutualFriendsCount: -1, createdAt: -1 }
    },
    {
      $limit: parseInt(limit) * parseInt(page)
    },
    {
      $skip: (parseInt(page) - 1) * parseInt(limit)
    },
    {
      $lookup: {
        from: 'users',
        localField: 'friends',
        foreignField: '_id',
        as: 'friendsDetails'
      }
    },
    {
      $addFields: {
        mutualFriends: {
          $filter: {
            input: '$friendsDetails',
            cond: { $in: ['$$this._id', friendIds] }
          }
        }
      }
    },
    {
      $project: {
        username: 1,
        email: 1,
        avatar: 1,
        bio: 1,
        status: 1,
        mutualFriendsCount: 1,
        mutualFriends: {
          $map: {
            input: '$mutualFriends',
            as: 'friend',
            in: {
              _id: '$$friend._id',
              username: '$$friend.username',
              avatar: '$$friend.avatar'
            }
          }
        }
      }
    }
  ]);

  // If we don't have enough mutual friends recommendations, 
  // get some random active users
  let additionalRecommendations = [];
  if (mutualFriendsRecommendations.length < parseInt(limit)) {
    const remainingLimit = parseInt(limit) - mutualFriendsRecommendations.length;
    
    additionalRecommendations = await User.find({
      _id: { 
        $nin: [
          ...friendIds, 
          ...blockedUserIds, 
          ...pendingUserIds,
          ...mutualFriendsRecommendations.map(u => u._id),
          userId
        ] 
      },
      'privacy.allowFriendRequests': true,
      status: { $in: ['online', 'away'] }, // Prefer active users
    })
    .select('username email avatar bio status lastSeen')
    .sort({ lastSeen: -1, createdAt: -1 })
    .limit(remainingLimit);

    // Add mutualFriendsCount: 0 for consistency
    additionalRecommendations = additionalRecommendations.map(user => ({
      ...user.toObject(),
      mutualFriendsCount: 0,
      mutualFriends: []
    }));
  }

  const recommendations = [
    ...mutualFriendsRecommendations,
    ...additionalRecommendations
  ];

  res.status(200).json({
    success: true,
    message: 'Friend recommendations retrieved successfully',
    data: {
      recommendations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: recommendations.length,
      }
    },
  });
});

/**
 * Get users by search query
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { query, limit = 10, page = 1 } = req.query;
  const userId = req.user.userId;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters long',
    });
  }

  const user = await User.findById(userId);
  const friendIds = user.friends || [];
  const blockedUserIds = user.blockedUsers || [];

  // Search users by username or email
  const searchResults = await User.find({
    $and: [
      {
        $or: [
          { username: { $regex: query.trim(), $options: 'i' } },
          { email: { $regex: query.trim(), $options: 'i' } }
        ]
      },
      {
        _id: { 
          $nin: [...friendIds, ...blockedUserIds, userId] 
        }
      },
      {
        'privacy.allowFriendRequests': true
      }
    ]
  })
  .select('username email avatar bio status lastSeen')
  .sort({ status: -1, lastSeen: -1 })
  .limit(parseInt(limit))
  .skip((parseInt(page) - 1) * parseInt(limit));

  // Get total count for pagination
  const totalCount = await User.countDocuments({
    $and: [
      {
        $or: [
          { username: { $regex: query.trim(), $options: 'i' } },
          { email: { $regex: query.trim(), $options: 'i' } }
        ]
      },
      {
        _id: { 
          $nin: [...friendIds, ...blockedUserIds, userId] 
        }
      },
      {
        'privacy.allowFriendRequests': true
      }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Search results retrieved successfully',
    data: {
      users: searchResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit)),
      }
    },
  });
});

/**
 * Get popular/trending users (most active recently)
 */
export const getTrendingUsers = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { limit = 10 } = req.query;

  const user = await User.findById(userId);
  const friendIds = user.friends || [];
  const blockedUserIds = user.blockedUsers || [];

  // Get users who have been active in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const trendingUsers = await User.find({
    _id: { 
      $nin: [...friendIds, ...blockedUserIds, userId] 
    },
    'privacy.allowFriendRequests': true,
    lastSeen: { $gte: sevenDaysAgo },
  })
  .select('username email avatar bio status lastSeen')
  .sort({ lastSeen: -1, createdAt: -1 })
  .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    message: 'Trending users retrieved successfully',
    data: {
      users: trendingUsers,
    },
  });
});