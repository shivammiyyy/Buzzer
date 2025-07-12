import mongoose, { Schema } from "mongoose";

const friendInvitationSchema = new Schema(
  {
    // User sending the invitation
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // User who is being invited
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Status of the invitation
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
    // Optional message with the invitation
    message: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    // When the invitation expires (optional)
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
friendInvitationSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
friendInvitationSchema.index({ receiverId: 1, status: 1 });
friendInvitationSchema.index({ senderId: 1, status: 1 });
friendInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent duplicate invitations
friendInvitationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingInvitation = await this.constructor.findOne({
      $or: [
        { senderId: this.senderId, receiverId: this.receiverId },
        { senderId: this.receiverId, receiverId: this.senderId }
      ],
      status: 'pending'
    });
    
    if (existingInvitation) {
      const error = new Error('Friend invitation already exists');
      error.statusCode = 409;
      return next(error);
    }
  }
  next();
});

const FriendInvitation = mongoose.model("FriendInvitation", friendInvitationSchema);

export default FriendInvitation;