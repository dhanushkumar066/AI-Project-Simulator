const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
  },
  questionNumber: Number,
  questionText: String,
  answer: String,
  answerType: {
    type: String,
    enum: ["text", "voice"],
    default: "text",
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  timeSpent: Number,
  score: {
    technical: Number,
    communication: Number,
    confidence: Number,
  },
  evaluation: {
    overallScore: Number,
    contentScore: Number,
    clarityScore: Number,
    confidenceScore: Number,
    communicationScore: Number,
    feedback: String,
    strengths: [String],
    improvements: [String],
    suggestedAnswer: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["fresher", "intermediate", "experienced"],
      required: true,
    },
    company: {
      type: String,
      default: "General",
    },
    currentDifficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    currentQuestion: {
      type: Object,
      default: null,
    },
    questionNumber: {
      type: Number,
      default: 1,
    },
    totalQuestions: {
      type: Number,
      default: 5,
    },
    answers: [answerSchema],
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
    },
    overallPerformance: {
      totalScore: Number,
      averageConfidence: Number,
      averageCommunication: Number,
      averageContent: Number,
      technicalScore: Number,
      communicationScore: Number,
      confidenceScore: Number,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Interview", interviewSchema);
