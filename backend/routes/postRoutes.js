const express = require("express");
const router = express.Router();

// الكنترولرز القديمة والجديدة
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getMyPosts,
  markPostAsResolved,
} = require("../controllers/postController");
const feedController = require('../controllers/feedController');

// الميديا وير
const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin, optionalAuth } = require('../middleware/authMiddleware'); 

// مسموح للكل يشوف الفييد، والـ optionalAuth عشان نعرف لو الزائر مسجل دخول أو لا
router.get('/feed', optionalAuth, feedController.getFeed);

// راوتس التحكم بالبوستات
router.get("/", getAllPosts);
router.get("/user/my-posts", authMiddleware, getMyPosts);
router.get("/:id", getPostById); 

// التفاعلات عالبوستات
router.post('/:type/:id/like', authMiddleware, feedController.toggleLike);
router.post('/:type/:id/comment', authMiddleware, feedController.addComment);

//عمليات الإضافة والتعديل 
router.post("/", authMiddleware, createPost);
router.patch("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.patch("/:id/resolved", authMiddleware, markPostAsResolved);

router.post('/recompute-scores', authMiddleware, requireAdmin, feedController.recomputeScores);

module.exports = router;