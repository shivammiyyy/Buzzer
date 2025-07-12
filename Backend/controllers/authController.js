import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middlewares/validation.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15d' }
  );
};

/**
 * Register a new user
 */
export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [
      { email: normalizedEmail },
      { username: username.trim() }
    ]
  });

  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use',
      });
    }
    return res.status(409).json({
      success: false,
      message: 'Username already taken',
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await User.create({
    username: username.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    status: 'online',
  });

  // Generate token
  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        status: user.status,
      },
      token,
    },
  });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Find user and include password for comparison
  const user = await User.findOne({ email: normalizedEmail }).select('+password +loginAttempts +lockUntil');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Check if account is locked
  if (user.isLocked) {
    return res.status(423).json({
      success: false,
      message: 'Account temporarily locked due to too many failed login attempts',
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    // Increment login attempts
    const updates = { $inc: { loginAttempts: 1 } };
    
    // If we have hit max attempts and it's not locked yet, lock the account
    if (user.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !user.isLocked) {
      updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }
    
    await User.findByIdAndUpdate(user._id, updates);

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await User.findByIdAndUpdate(user._id, {
      $unset: { loginAttempts: 1, lockUntil: 1 },
      $set: { status: 'online', lastSeen: new Date() }
    });
  } else {
    await User.findByIdAndUpdate(user._id, {
      $set: { status: 'online', lastSeen: new Date() }
    });
  }

  // Generate token
  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        status: 'online',
      },
      token,
    },
  });
});

/**
 * Logout user
 */
export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.userId, {
    status: 'offline',
    lastSeen: new Date(),
  });

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * Get current user profile
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId)
    .populate('friends', 'username email avatar status lastSeen')
    .populate('groupChats', 'name participants admin');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { username, bio, privacy } = req.body;
  const userId = req.user.userId;

  const updateData = {};
  if (username) updateData.username = username.trim();
  if (bio !== undefined) updateData.bio = bio.trim();
  if (privacy) updateData.privacy = { ...privacy };

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

/**
 * Change password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  const user = await User.findById(userId).select('+password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);
  
  await User.findByIdAndUpdate(userId, {
    password: hashedNewPassword,
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * Subscribe to push notifications
 */
export const subscribe = asyncHandler(async (req, res) => {
  const { endpoint, keys, deviceInfo } = req.body;
  const userId = req.user.userId;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Check if subscription already exists
  const existingSubscription = user.pushSubscription.find(
    sub => sub.endpoint === endpoint
  );

  if (existingSubscription) {
    return res.status(200).json({
      success: true,
      message: 'Subscription already exists',
    });
  }

  // Add new subscription
  user.pushSubscription.push({
    endpoint,
    keys,
    deviceInfo: deviceInfo || {},
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Push notification subscription saved',
  });
});

/**
 * Unsubscribe from push notifications
 */
export const unsubscribe = asyncHandler(async (req, res) => {
  const { endpoint } = req.body;
  const userId = req.user.userId;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Remove subscription
  user.pushSubscription = user.pushSubscription.filter(
    sub => sub.endpoint !== endpoint
  );

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Push notification subscription removed',
  });
});