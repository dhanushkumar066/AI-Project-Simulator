const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      "technical",
      "behavioral",
      "problem-solving",
      "system-design",
      "coding",
    ],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
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
  keywords: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Question", questionSchema);
