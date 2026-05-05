const express = require("express");
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getMyPosts,
  markPostAsResolved,
} = require("../controllers/postController");

const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();


router.get("/", getAllPosts);
router.get("/user/my-posts", authMiddleware, getMyPosts);
router.get("/:id", getPostById);

router.post("/", authMiddleware, createPost);
router.patch("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.patch("/:id/resolved", authMiddleware, markPostAsResolved);

module.exports = router;