import Conversation from "../models/conversationModel.js";
import { getServerSocketInstance } from "../socket/connectedUsers.js";
import { updateChatHistory } from "./notifyConnectedSockets.js";

const directChatHistoryHandler = async (socket, receiverUserId) => {
  try {
    const senderUserId = socket.user.userId;

    const conversation = await Conversation.findOne({
      participants: { $all: [receiverUserId, senderUserId] },
      type: "DIRECT",
    });

    if (!conversation) {
      return;
    }

    updateChatHistory(conversation._id.toString(), socket.id);
  } catch (err) {
    console.log(err);
  }
};

export default directChatHistoryHandler;
