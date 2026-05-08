const express = require("express");
const {
  sendMessage,
  getMessagesByConversation,
  deleteMessageForEveryone,
} = require("../controllers/messageController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(protect);

router.post("/", protect, sendMessage);
router.get("/:conversationId", protect, getMessagesByConversation);
router.delete("/:id", protect, deleteMessageForEveryone);

module.exports = router;
