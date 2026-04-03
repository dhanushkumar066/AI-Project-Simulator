const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        "technical",
        "behavioral",
        "problem-solving",
        "coding",
        "system-design",
      ],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
    },
    text: {
      type: String,
      required: true,
    },
    skills: [String],
    company: {
      type: String,
      default: "General",
    },
    expectedAnswer: {
      type: String,
    },
    keywords: [String],
    followUpQuestions: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient querying
questionSchema.index({ difficulty: 1, category: 1, company: 1 });

module.exports = mongoose.model("Question", questionSchema);
