const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
  },
  questionText: String,
  answer: String,
  confidence: Number,
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
  },
  timeSpent: Number,
  score: {
    technical: Number,
    communication: Number,
    confidence: Number,
  },
});

const videoMetricSchema = new mongoose.Schema({
  questionNumber: Number,
  engagementScore: Number,
  eyeContactScore: Number,
  expressivenessScore: Number,
  confidence: Number,
  posture: String,
  duration: Number,
  fileSize: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned"],
      default: "in-progress",
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    answers: [answerSchema],
    videoMetrics: [videoMetricSchema],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    totalQuestions: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Interview", interviewSchema);
