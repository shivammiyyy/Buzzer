import mongoose, { Schema } from "mongoose";

const groupChatSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    avatar: {
      type: String,
      default: null,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    // Creator/admin of the group
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Co-admins (optional feature for future)
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    // Last message for quick access
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    // Last activity timestamp
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    // Group settings
    settings: {
      // Who can add members
      whoCanAddMembers: {
        type: String,
        enum: ['admin', 'all'],
        default: 'admin',
      },
      // Who can send messages
      whoCanSendMessages: {
        type: String,
        enum: ['admin', 'all'],
        default: 'all',
      },
      // Maximum number of participants
      maxParticipants: {
        type: Number,
        default: 256,
        max: 1000,
      },
    },
    // Group type
    type: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
    },
    // Is group active
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
groupChatSchema.index({ participants: 1 });
groupChatSchema.index({ admin: 1 });
groupChatSchema.index({ lastActivity: -1 });
groupChatSchema.index({ name: 'text', description: 'text' });

// Virtual for participant count
groupChatSchema.virtual('participantCount').get(function() {
  return this.participants ? this.participants.length : 0;
});

// Virtual for unread message count (would need additional logic)
groupChatSchema.virtual('unreadCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'groupChat',
  count: true,
  match: { isRead: false }
});

// Pre-save middleware
groupChatSchema.pre('save', function(next) {
  // Update last activity when messages are added
  if (this.isModified('messages')) {
    this.lastActivity = new Date();
  }
  
  // Ensure admin is in participants
  if (this.admin && !this.participants.includes(this.admin)) {
    this.participants.unshift(this.admin);
  }
  
  next();
});

// Methods
groupChatSchema.methods.addParticipant = function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    this.lastActivity = new Date();
  }
  return this.save();
};

groupChatSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    id => id.toString() !== userId.toString()
  );
  this.lastActivity = new Date();
  return this.save();
};

groupChatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(
    id => id.toString() === userId.toString()
  );
};

groupChatSchema.methods.isAdmin = function(userId) {
  return this.admin.toString() === userId.toString();
};

const GroupChat = mongoose.model("GroupChat", groupChatSchema);

export default GroupChat;