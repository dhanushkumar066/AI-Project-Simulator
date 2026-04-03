const Result = require("../models/Result");
const Interview = require("../models/Interview");
const { generateResult, generateSuggestions } = require("../utils/aiAnalyzer");

// @desc    Get interview results
// @route   GET /api/result/:interviewId
// @access  Private
exports.getResults = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.interviewId,
      userId: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Check if result already exists
    let result = await Result.findOne({ interviewId: interview._id });

    if (!result) {
      // Generate new result
      const analysisData = await generateResult(interview);

      result = await Result.create({
        userId: req.user.id,
        interviewId: interview._id,
        overallScore: analysisData.overallScore,
        technicalScore: analysisData.technicalScore,
        communicationScore: analysisData.communicationScore,
        confidenceScore: analysisData.confidenceScore,
        skillScores: analysisData.skillScores,
        difficultyHistory: interview.answers.map((a) => a.difficulty),
        suggestions: analysisData.suggestions,
        strengths: analysisData.strengths,
        weaknesses: analysisData.weaknesses,
        analytics: {
          totalTime: analysisData.totalTime,
          averageConfidence: analysisData.averageConfidence,
          questionsAttempted: interview.answers.length,
          accuracyRate: analysisData.accuracyRate,
        },
      });
    }

    res.json({
      success: true,
      overall_score: result.overallScore,
      technical_score: result.technicalScore,
      communication_score: result.communicationScore,
      confidence_score: result.confidenceScore,
      skill_scores: Object.fromEntries(result.skillScores),
      difficulty_history: result.difficultyHistory,
      suggestions: result.suggestions,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      analytics: result.analytics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interview history
// @route   GET /api/result/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const results = await Result.find({ userId: req.user.id })
      .populate("interviewId")
      .sort({ createdAt: -1 })
      .limit(10);

    const history = results.map((result) => ({
      id: result._id,
      date: result.createdAt,
      score: result.overallScore,
      company: result.interviewId?.company || "N/A",
      status: result.interviewId?.status || "completed",
    }));

    res.json(history);
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytics
// @route   GET /api/result/:id/analytics
// @access  Private
exports.getDetailedAnalytics = async (req, res, next) => {
  try {
    const result = await Result.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate("interviewId");

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json({
      success: true,
      result: result,
    });
  } catch (error) {
    next(error);
  }
};
