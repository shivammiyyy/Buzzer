import GroupChat from "../models/groupChatModel.js";
import { getServerSocketInstance } from "../socket/connectedUsers.js";

const groupChatHistoryHandler = async (socket, groupChatId) => {
  try {
    const groupChat = await GroupChat.findById(groupChatId).populate({
      path: "messages",
      model: "Message",
      populate: {
        path: "author",
        select: "username _id",
        model: "User",
      },
    });

    if (!groupChat) {
      return;
    }

    const io = getServerSocketInstance();

    return io.to(socket.id).emit("group-chat-history", {
      messages: groupChat.messages,
      groupChatId: groupChat._id.toString(),
    });
  } catch (err) {
    console.log(err);
  }
};

export default groupChatHistoryHandler;
