const express = require("express");
const { getFraudOverview } = require("../controllers/adminFraudController");
const { protect, requireAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.get("/", getFraudOverview);

module.exports = router;