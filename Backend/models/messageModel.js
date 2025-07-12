import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      maxlength: 1000,
      trim: true,
    },
    type: {
      type: String,
      enum: ["DIRECT", "GROUP", "SYSTEM"],
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "audio", "video", "location"],
      default: "text",
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    groupChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupChat",
    },
    // Message status
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    // File attachments
    attachments: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
    }],
    // Reply to another message
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    // Reactions
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      emoji: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
messageSchema.index({ author: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ groupChat: 1, createdAt: -1 });
messageSchema.index({ type: 1 });
messageSchema.index({ isDeleted: 1 });

// Virtual for reply message details
messageSchema.virtual('replyToMessage', {
  ref: 'Message',
  localField: 'replyTo',
  foreignField: '_id',
  justOne: true
});

const Message = mongoose.model("Message", messageSchema);

export default Message;