import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    username: { 
      type: String, 
      required: [true, "Username is required"],
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    password: { 
      type: String, 
      required: [true, "Password is required"],
      minlength: 6,
    },
    avatar: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'away', 'busy'],
      default: 'offline',
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      maxlength: 200,
      default: '',
    },
    friends: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    blockedUsers: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    groupChats: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'GroupChat' },
    ],
    // Privacy settings
    privacy: {
      showLastSeen: { type: Boolean, default: true },
      showOnlineStatus: { type: Boolean, default: true },
      allowFriendRequests: { type: Boolean, default: true },
    },
    // Push notification subscriptions
    pushSubscription: [
      {
        endpoint: { type: String },
        keys: {
          p256dh: { type: String },
          auth: { type: String },
        },
        deviceInfo: {
          userAgent: String,
          platform: String,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Account security
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { 
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ friends: 1 });
userSchema.index({ status: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to handle failed login attempts
userSchema.pre('save', function(next) {
  // If we're modifying the loginAttempts and it's not new
  if (!this.isModified('loginAttempts') && !this.isNew) return next();
  
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    }, next);
  }
  
  next();
});

const User = mongoose.model('User', userSchema);
export default User;