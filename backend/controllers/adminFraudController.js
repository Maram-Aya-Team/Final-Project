const User = require("../models/userSchema");
const Post = require("../models/postSchema");
const Report = require("../models/report.schema");
const Message = require("../models/message.schema");

const getFraudOverview = async (req, res) => {
  try {
    const usersWithManyPosts = await Post.aggregate([
      { $group: { _id: "$user", postCount: { $sum: 1 } } },
      { $match: { postCount: { $gte: 5 } } },
      { $sort: { postCount: -1 } },
      { $limit: 10 },
    ]);

    const reportedTargets = await Report.aggregate([
      { $group: { _id: { targetId: "$targetId", targetType: "$targetType" }, reportCount: { $sum: 1 } } },
      { $match: { reportCount: { $gte: 2 } } },
      { $sort: { reportCount: -1 } },
      { $limit: 10 },
    ]);

    const usersWithManyMessages = await Message.aggregate([
      { $group: { _id: "$sender", messageCount: { $sum: 1 } } },
      { $match: { messageCount: { $gte: 20 } } },
      { $sort: { messageCount: -1 } },
      { $limit: 10 },
    ]);

    return res.status(200).json({
      success: true,
      fraudSignals: {
        usersWithManyPosts,
        reportedTargets,
        usersWithManyMessages,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getFraudOverview,
};