// controllers/groupChat.controller.js

import User from '../models/userModel.js';
import GroupChat from '../models/groupChatModel.js';
import { updateUsersGroupChatList } from '../socketControllers/notifyConnectedSockets.js';
import sendPushNotification from '../socketControllers/notification.js';

/**
 * Create a new group chat
 */
export const createGroupChat = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name } = req.body;

    const chat = await GroupChat.create({
      name,
      participants: [userId],
      admin: userId,
    });

    const currentUser = await User.findById(userId);
    currentUser.groupChats.push(chat._id);
    await currentUser.save();

    updateUsersGroupChatList(userId.toString());

    return res.status(201).send('Group created successfully');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong. Please try again later');
  }
};

/**
 * Add members to group
 */
export const addMemberToGroup = async (req, res) => {
  try {
    const { userId } = req.user;
    const { friendIds, groupChatId } = req.body;

    const groupChat = await GroupChat.findById(groupChatId);
    if (!groupChat) return res.status(404).send("Group chat doesn't exist");
    if (groupChat.admin.toString() !== userId) return res.status(403).send('Only admin can add members');

    const friendsToAdd = friendIds.filter(id => !groupChat.participants.includes(id));
    groupChat.participants.push(...friendsToAdd);
    await groupChat.save();

    const currentUser = await User.findById(userId);

    for (const friendId of friendsToAdd) {
      const participant = await User.findById(friendId);
      if (participant) {
        participant.groupChats.push(groupChatId);
        await participant.save();

        updateUsersGroupChatList(friendId.toString());

        sendPushNotification({
          sender: currentUser,
          receiver: participant,
          message: {
            content: `${currentUser.username} has added you to the group "${groupChat.name}"`,
            _id: `${userId}-${participant._id}-${groupChat._id}-added`,
          },
        });
      }
    }

    updateUsersGroupChatList(groupChat.admin.toString());
    return res.status(200).send('Members added successfully!');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong. Please try again later');
  }
};

/**
 * Leave a group chat
 */
export const leaveGroup = async (req, res) => {
  try {
    const { userId } = req.user;
    const { groupChatId } = req.body;

    const groupChat = await GroupChat.findById(groupChatId);
    if (!groupChat) return res.status(404).send("Group chat doesn't exist");

    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).send('User not found');

    groupChat.participants = groupChat.participants.filter(
      (id) => id.toString() !== userId.toString()
    );
    await groupChat.save();

    currentUser.groupChats = currentUser.groupChats.filter(
      (id) => id.toString() !== groupChat._id.toString()
    );
    await currentUser.save();

    updateUsersGroupChatList(userId.toString());

    for (const participantId of groupChat.participants) {
      updateUsersGroupChatList(participantId.toString());

      const receiver = await User.findById(participantId);
      sendPushNotification({
        sender: currentUser,
        receiver,
        message: {
          content: `${currentUser.username} has left the group!`,
          _id: `${currentUser._id}-${participantId}-${groupChat._id}-left`,
        },
      });
    }

    return res.status(200).send('You have left the group!');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong. Please try again later');
  }
};

/**
 * Delete a group chat
 */
export const deleteGroup = async (req, res) => {
  try {
    const { userId } = req.user;
    const { groupChatId } = req.body;

    const groupChat = await GroupChat.findById(groupChatId);
    if (!groupChat) return res.status(404).send("Group chat doesn't exist");
    if (groupChat.admin.toString() !== userId) return res.status(403).send('Only admins can delete the group');

    for (const participantId of groupChat.participants) {
      const participant = await User.findById(participantId);
      if (participant) {
        participant.groupChats = participant.groupChats.filter(
          (chatId) => chatId.toString() !== groupChat._id.toString()
        );
        await participant.save();
        updateUsersGroupChatList(participantId.toString());
      }
    }

    await groupChat.deleteOne();
    return res.status(200).send('Group deleted successfully!');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong. Please try again later');
  }
};
