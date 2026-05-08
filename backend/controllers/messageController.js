const Conversation = require("../models/conversation.schema");
const Message = require("../models/message.schema");

const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type = "text", attachments = [], location, replyTo } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId is required",
      });
    }

    if (type === "text" && !content) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to send a message here",
      });
    }

    const lastMessage = await Message.findOne({ conversation: conversationId })
      .sort({ seq: -1 });

    const seq = lastMessage ? lastMessage.seq + 1 : 1;

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content,
      type,
      attachments,
      location,
      replyTo: replyTo || null,
      seq,
      readBy: {
        [req.user._id.toString()]: new Date(),
      },
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageText = content || type;
    conversation.lastMessageAt = new Date();

    conversation.participants.forEach((participantId) => {
      const id = participantId.toString();

      if (id !== req.user._id.toString()) {
        const current = conversation.unreadCount.get(id) || 0;
        conversation.unreadCount.set(id, current + 1);
      }
    });

    conversation.deletedBy = conversation.deletedBy.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email avatar")

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view these messages",
      });
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false,
    })
      .populate("sender", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalMessages = await Message.countDocuments({
      conversation: conversationId,
      isDeleted: false,
    });

    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    await Message.updateMany(
      {
        conversation: conversationId,
        [`readBy.${req.user._id.toString()}`]: { $exists: false },
      },
      {
        $set: {
          [`readBy.${req.user._id.toString()}`]: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      totalMessages,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalMessages / limitNumber),
      messages: messages.reverse(),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteMessageForEveryone = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (
      message.sender.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this message",
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = "This message was deleted";

    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  sendMessage,
  getMessagesByConversation,
  deleteMessageForEveryone,
};