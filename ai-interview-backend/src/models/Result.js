const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    overallScore: {
      type: Number,
      required: true,
    },
    technicalScore: {
      type: Number,
      required: true,
    },
    communicationScore: {
      type: Number,
      required: true,
    },
    confidenceScore: {
      type: Number,
      required: true,
    },
    skillScores: {
      type: Map,
      of: Number,
    },
    difficultyHistory: [
      {
        type: String,
        enum: ["easy", "medium", "hard"],
      },
    ],
    suggestions: [String],
    strengths: [String],
    weaknesses: [String],
    analytics: {
      totalTime: Number,
      averageConfidence: Number,
      questionsAttempted: Number,
      accuracyRate: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Result", resultSchema);
