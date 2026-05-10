const Post = require("../models/postSchema");

const createPost = async (req, res) => {
  try {
    const { type, title, description, category, images, city, area, location, itemDate, reward, contactPhone } = req.body;

    if (!type || !title || !description || !category || !city || !area || !location?.address || !itemDate) {
      return res.status(400).json({ success: false, message: "Please fill all required fields" });
    }

    const finalReward = type === "found" ? 0 : reward || 0;
    const post = await Post.create({
      user: req.user._id, type, title, description, category, images: images || [], 
      city, area, location, itemDate, reward: finalReward, contactPhone 
    });

    return res.status(201).json({ success: true, message: "Post created successfully", post });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const {
      type,
      city,
      category,
      keyword,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    filter.status = status || "approved";
filter.isResolved = false;

    if (type) filter.type = type;
    if (city) filter.city = city;
    if (category) filter.category = category;
    if (status) filter.status = status;

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { area: { $regex: keyword, $options: "i" } },
        { city: { $regex: keyword, $options: "i" } },
      ];
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const posts = await Post.find(filter)
      .populate("user", "name email phone")
      .populate("category", "name icon")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalPosts = await Post.countDocuments(filter);

    return res.status(200).json({
      success: true,
      totalPosts,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalPosts / limitNumber),
      posts,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user", "name email phone").populate("category", "name icon");
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    return res.status(200).json({ success: true, post });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not allowed to update this post" });
    }

    if (req.body.type === "found") req.body.reward = 0;

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: "Post updated successfully", post: updatedPost });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not allowed to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id }).populate("category", "name icon").sort({ createdAt: -1 });
    res.status(200).json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markPostAsResolved = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not allowed to update this post" });
    }

    post.isResolved = true; post.status = "resolved";
    await post.save();

    res.status(200).json({ success: true, message: "Post marked as resolved", post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createPost, getAllPosts, getPostById, updatePost, deletePost, getMyPosts, markPostAsResolved };