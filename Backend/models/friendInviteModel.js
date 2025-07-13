import mongoose from 'mongoose';

/**
 * Friend Invitation Schema for managing friend requests
 * @typedef {Object} FriendInvitation
 * @property {mongoose.Types.ObjectId} senderId - ID of the user sending the invitation
 * @property {mongoose.Types.ObjectId} receiverId - ID of the user receiving the invitation
 * @property {Date} createdAt - Timestamp when the invitation was created
 * @property {Date} updatedAt - Timestamp when the invitation was last updated
 */
const friendInvitationSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver ID is required'],
    },
  },
  { timestamps: true }
);

// Prevent duplicate invitations
friendInvitationSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

export default mongoose.model('FriendInvitation', friendInvitationSchema);