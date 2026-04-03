const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interview",
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  categoryScores: {
    technical: { type: Number, default: 0 },
    behavioral: { type: Number, default: 0 },
    situational: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
  },
  strengths: [String],
  areasForImprovement: [String],
  detailedFeedback: String,
  recommendations: [String],
  completionRate: {
    type: Number,
    min: 0,
    max: 100,
  },
  totalTimeSpent: Number, // in minutes
  isPassed: {
    type: Boolean,
    default: false,
  },
  passThreshold: {
    type: Number,
    default: 60,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Result", resultSchema);
