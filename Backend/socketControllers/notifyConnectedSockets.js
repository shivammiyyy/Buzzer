import mongoose from "mongoose";
import Conversation from "../models/conversationModel.js";
import FriendInvitation from "../models/friendInviteModel.js";
import User from "../models/userModel.js";
import GroupChat from "../models/groupChatModel.js";
import {
  getActiveConnections,
  getServerSocketInstance,
} from "../socket/connectedUsers.js";
import { getActiveRooms } from "../socket/activeRooms.js";

export const updateUsersInvitations = async (userId, isNew) => {
  if (isNew === "new") {
    console.log("new invitation");
  }

  const invitations = await FriendInvitation.find({
    receiverId: userId,
  }).populate("senderId", { username: 1, email: 1, _id: 1 });

  const activeConnections = getActiveConnections(userId);
  const io = getServerSocketInstance();

  activeConnections.forEach((socketId) => {
    io.to(socketId).emit("friend-invitations", invitations);
  });
};

export const updateUsersGroupChatList = async (userId) => {
  const user = await User.findById(userId).populate([
    {
      path: "groupChats",
      populate: {
        path: "participants",
        model: "User",
        select: "_id email username",
      },
    },
    {
      path: "groupChats",
      populate: {
        path: "admin",
        model: "User",
        select: "_id email username",
      },
    },
  ]);

  if (!user) return;

  const groupChats = user.groupChats
    ? user.groupChats.map((groupChat) => ({
        groupId: groupChat._id,
        groupName: groupChat.name,
        participants: groupChat.participants,
        admin: groupChat.admin,
      }))
    : [];

  const activeConnections = getActiveConnections(userId);
  const io = getServerSocketInstance();

  activeConnections.forEach((socketId) => {
    io.to(socketId).emit("groupChats-list", groupChats || []);
  });
};

export const updateUsersFriendsList = async (userId) => {
  const user = await User.findById(userId).populate("friends", {
    username: 1,
    email: 1,
    _id: 1,
  });

  if (!user) return;

  const friends = user.friends
    ? user.friends.map((friend) => ({
        id: friend._id,
        username: friend.username,
        email: friend.email,
      }))
    : [];

  const activeConnections = getActiveConnections(userId);
  const io = getServerSocketInstance();

  activeConnections.forEach((socketId) => {
    io.to(socketId).emit("friends-list", friends || []);
  });
};

export const updateChatHistory = async (conversationId, toSpecificSocketId = null) => {
  const conversation = await Conversation.findById(conversationId).populate({
    path: "messages",
    model: "Message",
    populate: {
      path: "author",
      select: "username _id",
      model: "User",
    },
  });

  if (!conversation) return;

  const io = getServerSocketInstance();

  if (toSpecificSocketId) {
    return io.to(toSpecificSocketId).emit("direct-chat-history", {
      messages: conversation.messages,
      participants: conversation.participants,
    });
  }

  conversation.participants.forEach((participantId) => {
    const activeConnections = getActiveConnections(participantId.toString());

    activeConnections.forEach((socketId) => {
      io.to(socketId).emit("direct-chat-history", {
        messages: conversation.messages,
        participants: conversation.participants,
      });
    });
  });
};

export const sendNewDirectMessage = async (conversationId, newMessage) => {
  const conversation = await Conversation.findById(conversationId);
  const messageAuthor = await User.findById(newMessage.author);

  if (!messageAuthor || !conversation) return;

  const message = {
    __v: newMessage.__v,
    _id: newMessage._id,
    content: newMessage.content,
    createdAt: newMessage.createdAt,
    updatedAt: newMessage.updatedAt,
    type: newMessage.type,
    author: {
      _id: messageAuthor._id,
      username: messageAuthor.username,
    },
  };

  const io = getServerSocketInstance();

  conversation.participants.forEach((participantId) => {
    const activeConnections = getActiveConnections(participantId.toString());

    activeConnections.forEach((socketId) => {
      io.to(socketId).emit("direct-message", {
        newMessage: message,
        participants: conversation.participants,
      });
    });
  });
};

export const sendNewGroupMessage = async (groupChatId, newMessage) => {
  const groupChat = await GroupChat.findById(groupChatId);
  const messageAuthor = await User.findById(newMessage.author);

  if (!messageAuthor || !groupChat) return;

  const message = {
    __v: newMessage.__v,
    _id: newMessage._id,
    content: newMessage.content,
    createdAt: newMessage.createdAt,
    updatedAt: newMessage.updatedAt,
    type: newMessage.type,
    author: {
      _id: messageAuthor._id,
      username: messageAuthor.username,
    },
  };

  const io = getServerSocketInstance();

  groupChat.participants.forEach((participantId) => {
    const activeConnections = getActiveConnections(participantId.toString());

    activeConnections.forEach((socketId) => {
      io.to(socketId).emit("group-message", {
        newMessage: message,
        groupChatId: groupChat._id.toString(),
      });
    });
  });
};

export const updateRooms = (toSpecifiedSocketId = null) => {
  const io = getServerSocketInstance();
  const activeRooms = getActiveRooms();

  if (toSpecifiedSocketId) {
    io.to(toSpecifiedSocketId).emit("active-rooms", {
      activeRooms,
    });
  } else {
    io.emit("active-rooms", {
      activeRooms,
    });
  }
};

export const initialRoomsUpdate = async (userId, socketId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const io = getServerSocketInstance();
  const activeRooms = getActiveRooms();
  const rooms = [];

  activeRooms.forEach((room) => {
    const isRoomCreatedByMe = room.roomCreator.userId === userId;

    if (isRoomCreatedByMe) {
      rooms.push(room);
    } else {
      user.friends.forEach((f) => {
        if (f.toString() === room.roomCreator.userId.toString()) {
          rooms.push(room);
        }
      });
    }
  });

  io.to(socketId).emit("active-rooms-initial", {
    activeRooms: rooms,
  });
};
