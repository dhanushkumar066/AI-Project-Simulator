const Interview = require("../models/Interview");

// @desc    Get results for an interview
// @route   GET /api/results/:interviewId
// @access  Private
exports.getResults = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (interview.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Interview not yet completed",
      });
    }

    res.status(200).json({
      success: true,
      interview: {
        id: interview._id,
        jobRole: interview.jobRole,
        experienceLevel: interview.experienceLevel,
        overallPerformance: interview.overallPerformance,
        questions: interview.answers,
        completedAt: interview.completedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interview history
// @route   GET /api/results/history/all
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const interviews = await Interview.find({
      user: req.user.id,
      status: "completed",
    })
      .sort("-completedAt")
      .select("jobRole experienceLevel overallPerformance completedAt");

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytics
// @route   GET /api/results/:id/analytics
// @access  Private
exports.getDetailedAnalytics = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Calculate category-wise performance
    const categoryPerformance = {};
    interview.answers.forEach((answer) => {
      const category = answer.questionText; // You can enhance this
      if (!categoryPerformance[answer.evaluation?.category]) {
        categoryPerformance[answer.evaluation?.category] = {
          totalScore: 0,
          count: 0,
        };
      }
      categoryPerformance[answer.evaluation?.category].totalScore +=
        answer.evaluation?.overallScore || 0;
      categoryPerformance[answer.evaluation?.category].count += 1;
    });

    // Calculate averages
    Object.keys(categoryPerformance).forEach((key) => {
      categoryPerformance[key].average = Math.round(
        categoryPerformance[key].totalScore / categoryPerformance[key].count,
      );
    });

    res.status(200).json({
      success: true,
      analytics: {
        overallPerformance: interview.overallPerformance,
        categoryPerformance,
        totalQuestions: interview.answers.length,
        averageTimePerQuestion: Math.round(
          interview.answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0) /
            interview.answers.length,
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};
