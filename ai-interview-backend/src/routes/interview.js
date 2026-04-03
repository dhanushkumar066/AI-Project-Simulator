const express = require("express");
const router = express.Router();
const {
  startInterview,
  getNextQuestion,
  submitAnswer,
  selectCompany,
  finishInterview,
  getInterviewHistory,
} = require("../controllers/interviewController");
const {
  analyzeVideoAnswer,
  getVideoMetrics,
} = require("../controllers/videoController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/start", protect, startInterview);
router.get("/history", protect, getInterviewHistory);
router.post("/select-company", protect, selectCompany);
router.get("/:id/next", protect, getNextQuestion);
router.post("/:id/submit", protect, submitAnswer);
router.post("/:id/finish", protect, finishInterview);

// Video analysis routes
router.post(
  "/analyze-video",
  protect,
  upload.single("video"),
  analyzeVideoAnswer,
);
router.get("/:id/video-metrics", protect, getVideoMetrics);

module.exports = router;
