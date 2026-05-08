const express = require("express");
const {
  getAllReports,
  updateReportStatus,
} = require("../controllers/adminReportController");

const { protect, requireAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.get("/", getAllReports);
router.patch("/:id", updateReportStatus);

module.exports = router;