const express = require("express");

const {
  getDashboard,
} = require("../controllers/adminDashboardController");

const {
  protect,
  requireAdmin,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  requireAdmin,
  getDashboard
);

module.exports = router;