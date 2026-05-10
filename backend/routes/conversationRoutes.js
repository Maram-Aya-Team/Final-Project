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


router.post("/", createOrGetConversation);
router.get("/",  getMyConversations);
router.get("/:id",  getConversationById);
router.delete("/:id",  deleteConversationForMe);

module.exports = router;
