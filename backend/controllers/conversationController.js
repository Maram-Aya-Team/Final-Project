const Conversation = require("../models/conversation.schema");
const User = require("../models/userSchema");
const Post = require("../models/postSchema");
const createOrGetConversation = async (req, res) => {
  try {
    const { receiverId, relatedPost } = req.body;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "receiverId is required",
      });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot start a conversation with yourself",
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    if (relatedPost) {
      const post = await Post.findById(relatedPost);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Related post not found",
        });
      }
    }

    const participants = [senderId.toString(), receiverId.toString()].sort();

    let conversation = await Conversation.findOne({
      participants: { $all: participants },
      relatedPost: relatedPost || null,
    })
      .populate("participants", "name email avatar")
      .populate("relatedPost", "title type images city area");

    if (!conversation) {
      conversation = await Conversation.create({
        participants,
        relatedPost: relatedPost || null,
        unreadCount: {},
      });

      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "name email avatar")
        .populate("relatedPost", "title type images city area");
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getMyConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name email avatar")
      .populate("relatedPost", "title type images city area")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate("participants", "name email avatar")
      .populate("relatedPost", "title type images city area")
      .populate("lastMessage");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some(
      (user) => user._id.toString() === req.user._id.toString(),
    );

    if (!isParticipant && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this conversation",
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteConversationForMe = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this conversation",
      });
    }

    if (!conversation.deletedBy.includes(req.user._id)) {
      conversation.deletedBy.push(req.user._id);
      await conversation.save();
    }

    return res.status(200).json({
      success: true,
      message: "Conversation deleted for you",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createOrGetConversation,
  getMyConversations,
  getConversationById,
  deleteConversationForMe,
};
