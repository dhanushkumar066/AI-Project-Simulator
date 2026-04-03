const express = require("express");
const router = express.Router();
const {
  getResults,
  getHistory,
  getDetailedAnalytics,
} = require("../controllers/resultController");
const { protect } = require("../middleware/auth");

router.get("/:interviewId", protect, getResults);
router.get("/history/all", protect, getHistory);
router.get("/:id/analytics", protect, getDetailedAnalytics);

module.exports = router;
