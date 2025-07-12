import { Server } from "socket.io"; // ✅ Correct import
import requireSocketAuth from "../middlewares/requireSocketAuth.js";
import callRequestHandler from "../socketControllers/callRequestHandler.js";
import callResponseHandler from "../socketControllers/callResponseHandler.js";
import directChatHistoryHandler from "../socketControllers/directChatHistoryHandler.js";
import directMessageHandler from "../socketControllers/directMessageHandler.js";
import disconnectHandler from "../socketControllers/disconnectHandler.js";
import groupMessageHandler from "../socketControllers/groupMessageHandler.js";
import newConnectionHandler from "../socketControllers/newConnectionHandler.js";
import notifyChatLeft from "../socketControllers/notifyChatLeft.js";
import notifyTypingHandler from "../socketControllers/notifyTypingHandler.js";
import { setServerSocketInstance, getOnlineUsers } from "./connectedUsers.js";
import groupChatHistoryHandler from "../socketControllers/groupChatHistoryHandler.js";
import roomJoinHandler from "../socketControllers/room/roomJoinHandler.js";
import roomCreateHandler from "../socketControllers/room/roomCreateHandler.js";
import roomLeaveHandler from "../socketControllers/room/roomLeaveHandler.js";
import roomSignalingDataHandler from "../socketControllers/room/roomSignalingDataHandler.js";
import roomInitializeConnectionHandler from "../socketControllers/room/roomInitializeConnectionHandler.js";

const createSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"],
    },
  });

  setServerSocketInstance(io);

  io.use((socket, next) => {
    requireSocketAuth(socket, next);
  });

  io.on("connection", (socket) => {
    console.log(`New socket connection connected: ${socket.id}`);
    newConnectionHandler(socket, io);

    socket.on("direct-message", (data) => {
      directMessageHandler(socket, data);
    });

    socket.on("group-message", (data) => {
      groupMessageHandler(socket, data);
    });

    socket.on("direct-chat-history", (data) => {
      directChatHistoryHandler(socket, data.receiverUserId);
    });

    socket.on("group-chat-history", (data) => {
      groupChatHistoryHandler(socket, data.groupChatId);
    });

    socket.on("notify-typing", (data) => {
      notifyTypingHandler(socket, io, data);
    });

    socket.on("call-request", (data) => {
      callRequestHandler(socket, data);
    });

    socket.on("call-response", (data) => {
      callResponseHandler(socket, data);
    });

    socket.on("notify-chat-left", (data) => {
      notifyChatLeft(socket, data);
    });

    // rooms
    socket.on("room-create", () => {
      roomCreateHandler(socket);
    });

    socket.on("room-join", (data) => {
      roomJoinHandler(socket, data);
    });

    socket.on("room-leave", (data) => {
      roomLeaveHandler(socket, data);
    });

    socket.on("conn-init", (data) => {
      roomInitializeConnectionHandler(socket, data);
    });

    socket.on("conn-signal", (data) => {
      roomSignalingDataHandler(socket, data);
    });

    socket.on("disconnect", () => {
      console.log(`Connected socket disconnected: ${socket.id}`);
      disconnectHandler(socket, io);
    });
  });

  // Optional heartbeat
  // setInterval(() => {
  //   io.emit("online-users", getOnlineUsers());
  // }, 10 * 1000);
};

export { createSocketServer };
