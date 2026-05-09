const User = require("../models/userSchema");
const Post = require("../models/postSchema");
const { asyncHandler } = require("../utils/helpers");

const adminController = {
  // GET /api/admin/users
  getUsers: asyncHandler(async (req, res) => {

    const { search, page = 1, limit = 20, role, isBanned } = req.query;
    const safeLimit = Math.min(parseInt(limit) || 20, 50);
    const skip = (parseInt(page) - 1) * safeLimit;
    const filter = {};

    // بحث بالاسم أو الايميل
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) filter.role = role;
    if (isBanned !== undefined) {
      filter.isBanned = isBanned === "true";
    }

    const [users, total] = await Promise.all([

      User.find(
        filter,
        "name email phone city role isVerified isBanned bannedReason createdAt"
      )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: users,

      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / safeLimit),
      },
    });
  }),

  // PATCH /api/admin/users/:id/ban
  banUser: asyncHandler(async (req, res) => {

    const { reason = "Violated community guidelines" } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isBanned: true,
        bannedReason: reason,
      },
      {
        new: true,
        select: "name email isBanned bannedReason",
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  }),

  // PATCH /api/admin/users/:id/unban
  unbanUser: asyncHandler(async (req, res) => {

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false,bannedReason: null,},
      {new: true,select: "name email isBanned",}
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  }),

  // DELETE /api/admin/users/:id
  deleteUser: asyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      data: { deleted: true },
    });
  }),

  //postsModeration

  // GET /api/admin/posts
  getPosts: asyncHandler(async (req, res) => {

    const {
      type = "all",status = "pending",page = 1,limit = 20,city,search,
    } = req.query;

    const safeLimit = Math.min(parseInt(limit) || 20, 50);
    const skip = (parseInt(page) - 1) * safeLimit;
    const filter = {};

    if (status !== "all") filter.status = status;
    if (type !== "all") filter.type = type;
    if (city) filter.city = city;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    const [posts, total] = await Promise.all([

      Post.find(filter)
        .populate([
          { path: "user", select: "name email" },
          { path: "category", select: "name icon" },
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),

      Post.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: posts,

      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / safeLimit),
      },
    });
  }),
  // PATCH /api/admin/posts/:id/approve
  approvePost: asyncHandler(async (req, res) => {

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      {
        new: true,
        select: "title type status",
      }
    );
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: post,
    });
  }),
  // PATCH /api/admin/posts/:id/reject
  rejectPost: asyncHandler(async (req, res) => {

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      {
        new: true,
        select: "title type status",
      }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: post,
    });
  }),

  // DELETE /api/admin/posts/:id
  deletePost: asyncHandler(async (req, res) => {

    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      data: { deleted: true },
    });
  }),
};

module.exports = adminController;