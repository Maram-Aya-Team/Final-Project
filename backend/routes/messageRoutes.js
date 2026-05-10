const express = require("express");
const {
  sendMessage,
  getMessagesByConversation,
  deleteMessageForEveryone,
} = require("../controllers/messageController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(protect);

router.post("/",  sendMessage);
router.get("/:conversationId",  getMessagesByConversation);
router.delete("/:id",  deleteMessageForEveryone);

module.exports = router;
