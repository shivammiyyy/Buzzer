import mongoose from 'mongoose';
import validator from 'validator';
import sanitizeHtml from 'sanitize-html';

/**
 * Message Schema for managing messages in conversations
 * @typedef {Object} Message
 * @property {mongoose.Types.ObjectId} author - ID of the message author
 * @property {string} content - Message content (text or placeholder if deleted)
 * @property {string} type - Message type (DIRECT, GROUP, SYSTEM)
 * @property {string} messageType - Content type (text, image, file, audio, video, location, call)
 * @property {mongoose.Types.ObjectId} conversation - ID of the associated conversation
 * @property {mongoose.Types.ObjectId} groupChat - ID of the associated group chat
 * @property {boolean} isRead - Whether the message has been read
 * @property {Array<Object>} readBy - Users who have read the message
 * @property {boolean} isEdited - Whether the message was edited
 * @property {Date} editedAt - Timestamp of last edit
 * @property {boolean} isDeleted - Whether the message was soft-deleted
 * @property {Date} deletedAt - Timestamp of deletion
 * @property {Array<Object>} attachments - File attachments
 * @property {mongoose.Types.ObjectId} replyTo - ID of the message being replied to
 * @property {Array<Object>} reactions - User reactions to the message
 * @property {Date} createdAt - Timestamp when the message was created
 * @property {Date} updatedAt - Timestamp when the message was last updated
 */
const messageSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [1000, 'Message content cannot exceed 1000 characters'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['DIRECT', 'GROUP', 'SYSTEM'],
      required: [true, 'Message type is required'],
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'audio', 'video', 'location', 'call'],
      default: 'text',
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    groupChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupChat',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    attachments: [
      {
        filename: { type: String, required: true },
        originalName: {
          type: String,
          required: true,
          trim: true,
          maxlength: [200, 'Original filename cannot exceed 200 characters'],
        },
        mimetype: {
          type: String,
          required: true,
          match: [/^[\w-]+\/[\w-]+$/, 'Invalid MIME type'],
        },
        size: {
          type: Number,
          required: true,
          min: [0, 'File size cannot be negative'],
          max: [10485760, 'File size cannot exceed 10MB'],
        },
        url: {
          type: String,
          required: true,
          validate: [validator.isURL, 'Invalid attachment URL'],
        },
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        emoji: {
          type: String,
          required: true,
          validate: {
            validator: (value) => /^[\p{Emoji}\p{Emoji_Component}]+$/u.test(value),
            message: 'Invalid emoji',
          },
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Sanitize content and attachments
messageSchema.pre('save', function (next) {
  if (this.content) {
    this.content = sanitizeHtml(this.content, { allowedTags: [], allowedAttributes: {} });
  }
  if (this.attachments) {
    this.attachments.forEach((attachment) => {
      if (attachment.originalName) {
        attachment.originalName = sanitizeHtml(attachment.originalName, {
          allowedTags: [],
          allowedAttributes: {},
        });
      }
    });
  }
  if (this.isDeleted) {
    this.content = '[This message was deleted]';
    this.attachments = [];
  }
  next();
});

// Limit readBy array size
messageSchema.pre('save', function (next) {
  if (this.readBy.length > 100) {
    this.readBy = this.readBy.slice(-100); // Keep last 100 entries
  }
  next();
});

// Validation for messageType and attachments
messageSchema.pre('validate', function (next) {
  if (['image', 'file', 'audio', 'video'].includes(this.messageType) && !this.attachments.length) {
    next(new Error(`${this.messageType} messages must have at least one attachment`));
  }
  if (this.messageType === 'text' && this.attachments.length > 0) {
    next(new Error('Text messages cannot have attachments'));
  }
  next();
});

// Indexes for performance
messageSchema.index({ author: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ groupChat: 1, createdAt: -1 });
messageSchema.index({ type: 1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ isDeleted: 1 });

messageSchema.virtual('replyToMessage', {
  ref: 'Message',
  localField: 'replyTo',
  foreignField: '_id',
  justOne: true,
});

export default mongoose.model('Message', messageSchema);