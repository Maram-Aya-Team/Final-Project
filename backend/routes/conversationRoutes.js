const express = require("express");
const {
  createOrGetConversation,
  getMyConversations,
  getConversationById,
  deleteConversationForMe,
} = require("../controllers/conversationController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(protect);


router.post("/", protect, createOrGetConversation);
router.get("/", protect, getMyConversations);
router.get("/:id", protect, getConversationById);
router.delete("/:id", protect, deleteConversationForMe);

module.exports = router;
