const Message = require("../models/message.schema");
const Conversation = require("../models/conversation.schema");
const logger = require("../utils/logger");

const connectedUsers = new Map();

const chatSocket = (io) => {
  io.on("connection", (socket) => {
    logger.debug("User connected", { socketId: socket.id });

    // تسجيل المستخدم
    socket.on("register", (userId) => {
      connectedUsers.set(userId, socket.id);
      logger.debug("Registered user", { userId });
    });

    // دخول غرفة محادثة
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      logger.debug("Joined conversation", { conversationId });
    });

    // إرسال رسالة realtime
    socket.on("sendMessage", async (data) => {
      try {
        const { conversationId, content } = data;

        // ناخذ senderId من التوكن الموجود بالـ socket
        const senderId = socket.userId;

        if (!senderId) {
          logger.warn("No senderId found on socket");
          return;
        }

        if (!conversationId || !content) {
          logger.warn("conversationId and content are required");
          return;
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          logger.warn("Conversation not found", { conversationId });
          return;
        }

        const isParticipant = conversation.participants.some(
          (id) => id.toString() === senderId.toString(),
        );

        if (!isParticipant) {
          logger.warn("User is not participant in this conversation", { senderId, conversationId });
          return;
        }

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

        const populatedMessage = await Message.findById(message._id).populate(
          "sender",
          "name email avatar",
        );

        io.to(conversationId).emit("newMessage", populatedMessage);
      } catch (err) {
        logger.error("Failed to send realtime message", { message: err.message, stack: err.stack });
      }
    });

    socket.on("disconnect", () => {
      logger.debug("User disconnected", { socketId: socket.id });

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
