const User = require("../models/userSchema");
const Post = require("../models/postSchema");
const Conversation = require("../models/conversation.schema");
const Message = require("../models/message.schema");

const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalPosts = await Post.countDocuments();

    const lostPosts = await Post.countDocuments({
      type: "lost",
    });

    const foundPosts = await Post.countDocuments({
      type: "found",
    });

    const resolvedPosts = await Post.countDocuments({
      status: "resolved",
    });

    const totalConversations = await Conversation.countDocuments();

    const totalMessages = await Message.countDocuments();

    return res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        totalPosts,
        lostPosts,
        foundPosts,
        resolvedPosts,
        totalConversations,
        totalMessages,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getDashboard,
};
