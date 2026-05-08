const Message = require("../models/message.schema");
const Conversation = require("../models/conversation.schema");

const connectedUsers = new Map();

const chatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // تسجيل المستخدم
    socket.on("register", (userId) => {
      connectedUsers.set(userId, socket.id);

      console.log("Registered user:", userId);
    });

    // دخول غرفة محادثة
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);

      console.log(`📩 Joined room: ${conversationId}`);
    });

    // إرسال رسالة realtime
    socket.on("sendMessage", async (data) => {
      try {
        const {
          conversationId,
          senderId,
          content,
        } = data;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) return;

        const message = await Message.create({
          conversation: conversationId,
          sender: senderId,
          content,
          type: "text",
          readBy: {
            [senderId]: new Date(),
          },
        });

        conversation.lastMessage = message._id;
        conversation.lastMessageText = content;
        conversation.lastMessageAt = new Date();

        await conversation.save();

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "name email avatar");

        // إرسال الرسالة لكل الموجودين بالغرفة
        io.to(conversationId).emit("newMessage", populatedMessage);

      } catch (err) {
        console.error(err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
    });
  });
};

module.exports = chatSocket;