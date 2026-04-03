const express = require("express");
const router = express.Router();
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
  getInterviewDetails,
} = require("../controllers/interviewController");
const { protect } = require("../middleware/auth");
const { body } = require("express-validator");

// Start interview validation
const startInterviewValidation = [
  body("jobRole").notEmpty().withMessage("Job role is required"),
  body("experienceLevel")
    .isIn(["fresher", "intermediate", "experienced"])
    .withMessage("Invalid experience level"),
];

// Submit answer validation
const submitAnswerValidation = [
  body("interviewId").notEmpty().withMessage("Interview ID is required"),
  body("questionNumber")
    .isInt()
    .withMessage("Question number must be an integer"),
  body("answer").notEmpty().withMessage("Answer is required"),
];

// Routes
router.post("/start", protect, startInterviewValidation, startInterview);
router.post("/submit-answer", protect, submitAnswerValidation, submitAnswer);
router.post("/:id/complete", protect, completeInterview);
router.get("/history", protect, getInterviewHistory);
router.get("/:id", protect, getInterviewDetails);

module.exports = router;
