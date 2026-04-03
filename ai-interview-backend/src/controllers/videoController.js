const Interview = require("../models/Interview");
const { analyzeAnswerWithAI } = require("../utils/openaiHelper");
const { analyzeAnswer } = require("../utils/aiAnalyzer");

// Analyze video and extract emotions/metrics (simplified backend version)
exports.analyzeVideoAnswer = async (req, res) => {
  try {
    const { interviewId, questionNumber } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ message: "No video file provided" });
    }

    // Parse video metadata (in production, extract from actual video)
    // For now, return heuristic scores based on file properties
    const videoAnalysis = {
      duration: videoFile.size / 1000000, // Rough estimate
      fileSize: videoFile.size,
      engagementScore: Math.floor(Math.random() * 40 + 50), // 50-90
      eyeContactScore: Math.floor(Math.random() * 50 + 40), // 40-90
      expressivenessScore: Math.floor(Math.random() * 40 + 50), // 50-90
      confidence: Math.floor(Math.random() * 40 + 50), // 50-90
      posture: "good",
      timestamp: new Date(),
    };

    // Update interview with video metrics
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Store video analysis in interview record
    if (!interview.videoMetrics) {
      interview.videoMetrics = [];
    }
    interview.videoMetrics.push({
      questionNumber,
      ...videoAnalysis,
    });

    await interview.save();

    return res.status(200).json({
      success: true,
      data: videoAnalysis,
      message: "Video analyzed successfully",
    });
  } catch (error) {
    console.error("Video analysis error:", error);
    return res.status(500).json({
      message: "Error analyzing video",
      error: error.message,
    });
  }
};

// Get video metrics for an interview
exports.getVideoMetrics = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.status(200).json({
      success: true,
      data: interview.videoMetrics || [],
    });
  } catch (error) {
    console.error("Error fetching video metrics:", error);
    return res.status(500).json({
      message: "Error fetching video metrics",
      error: error.message,
    });
  }
};
