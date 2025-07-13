import mongoose from 'mongoose';

/**
 * Group Chat Schema for managing group chats
 * @typedef {Object} GroupChat
 * @property {string} name - Name of the group chat
 * @property {Array<mongoose.Types.ObjectId>} participants - List of participant IDs
 * @property {mongoose.Types.ObjectId} admin - ID of the group admin
 * @property {Date} createdAt - Timestamp when the group was created
 * @property {Date} updatedAt - Timestamp when the group was last updated
 */
const groupChatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      minlength: [3, 'Group name must be at least 3 characters'],
      maxlength: [50, 'Group name cannot exceed 50 characters'],
      trim: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin ID is required'],
    },
  },
  { timestamps: true }
);

// Indexes for performance
groupChatSchema.index({ admin: 1 });
groupChatSchema.index({ participants: 1 });

export default mongoose.model('GroupChat', groupChatSchema);