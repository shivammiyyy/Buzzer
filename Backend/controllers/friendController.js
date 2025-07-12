// controllers/friendInvitation.controller.js

import FriendInvitation from '../models/friendInviteModel.js';
import User from '../models/userModel.js';
import sendPushNotification from '../socketControllers/notification.js';
import {
  updateUsersInvitations,
  updateUsersFriendsList,
} from '../socketControllers/notifyConnectedSockets.js';

/**
 * Send a friend invitation
 */
export const inviteFriend = async (req, res) => {
  try {
    const { email: senderEmailAddress, userId } = req.user;
    const { email: receiverEmailAddress } = req.body;

    if (senderEmailAddress === receiverEmailAddress) {
      return res.status(400).send("You can't invite yourself");
    }

    const targetUser = await User.findOne({ email: receiverEmailAddress });
    if (!targetUser) {
      return res.status(404).send("User not found with given email address");
    }

    const invitationExists = await FriendInvitation.findOne({
      senderId: userId,
      receiverId: targetUser._id,
    });
    if (invitationExists) {
      return res.status(409).send('Friend request already sent');
    }

    const isAlreadyFriend = targetUser.friends.some(
      friend => friend.toString() === userId.toString()
    );
    if (isAlreadyFriend) {
      return res.status(409).send('You are already friends');
    }

    await FriendInvitation.create({ senderId: userId, receiverId: targetUser._id });
    updateUsersInvitations(targetUser._id.toString(), 'new');

    const sender = await User.findById(userId);
    sendPushNotification({
      sender,
      receiver: targetUser,
      message: {
        content: `${sender.username} sent you a friend request`,
        _id: `${userId}-${targetUser._id}-invitation`,
      },
    });

    return res.status(201).send('Friend request sent');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

/**
 * Accept a friend invitation
 */
export const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.body;
    const invitation = await FriendInvitation.findById(invitationId);

    if (!invitation) return res.status(404).send('Invitation not found');

    const sender = await User.findById(invitation.senderId);
    const receiver = await User.findById(req.user.userId);

    sender.friends.push(receiver._id);
    receiver.friends.push(sender._id);

    await sender.save();
    await receiver.save();
    await invitation.deleteOne();

    updateUsersInvitations(receiver._id.toString());
    updateUsersFriendsList(sender._id.toString());
    updateUsersFriendsList(receiver._id.toString());

    sendPushNotification({
      sender: receiver,
      receiver: sender,
      message: {
        content: `${receiver.username} accepted your friend request`,
        _id: `${receiver._id}-${sender._id}-accepted`,
      },
    });

    return res.status(200).send('Friend request accepted');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

/**
 * Reject a friend invitation
 */
export const rejectInvitation = async (req, res) => {
  try {
    const { invitationId } = req.body;
    const invitation = await FriendInvitation.findById(invitationId);

    if (!invitation) return res.status(404).send('Invitation not found');

    await invitation.deleteOne();
    updateUsersInvitations(req.user.userId);

    return res.status(200).send('Friend request rejected');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

/**
 * Remove a friend
 */
export const removeFriend = async (req, res) => {
  try {
    const { userId } = req.user;
    const { friendId } = req.body;

    const currentUser = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) return res.status(404).send('Friend not found');

    currentUser.friends = currentUser.friends.filter(
      f => f.toString() !== friend._id.toString()
    );
    friend.friends = friend.friends.filter(
      f => f.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await friend.save();

    updateUsersFriendsList(userId);
    updateUsersFriendsList(friendId);

    sendPushNotification({
      sender: currentUser,
      receiver: friend,
      message: {
        content: `${currentUser.username} removed you from their friends list`,
        _id: `${userId}-${friendId}-removed`,
      },
    });

    return res.status(200).send('Friend removed');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};
