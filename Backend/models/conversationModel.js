import mongoose from 'mongoose';

/**
 * Conversation Schema for managing direct and group conversations
 * @typedef {Object} Conversation
 * @property {Array<mongoose.Types.ObjectId>} participants - List of participant IDs
 * @property {Array<mongoose.Types.ObjectId>} messages - List of message IDs
 * @property {string} type - Conversation type (DIRECT or GROUP)
 * @property {mongoose.Types.ObjectId} lastMessage - ID of the last message
 * @property {Date} lastActivity - Timestamp of last activity
 * @property {boolean} isActive - Whether the conversation is active
 * @property {Date} createdAt - Timestamp when the conversation was created
 * @property {Date} updatedAt - Timestamp when the conversation was last updated
 */
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Participant ID is required'],
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
    type: {
      type: String,
      enum: ['DIRECT', 'GROUP'],
      default: 'DIRECT',
      required: [true, 'Conversation type is required'],
    },
    groupChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupChat',
      default: null,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Validation for participants based on type
conversationSchema.pre('validate', function (next) {
  if (this.type === 'DIRECT' && this.participants.length !== 2) {
    next(new Error('Direct conversations must have exactly 2 participants'));
  } else if (this.type === 'GROUP' && this.participants.length < 1) {
    next(new Error('Group conversations must have at least 1 participant'));
  }
  next();
});

// Indexes for performance
conversationSchema.index({ participants: 1, lastActivity: -1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ groupChat: 1 }, { sparse: true });
conversationSchema.index(
  { participants: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: 'DIRECT' } }
);

// Virtual for unread message count
conversationSchema.virtual('unreadCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversation',
  count: true,
  match: { isRead: false },
});

export default mongoose.model('Conversation', conversationSchema);