const Interview = require("../models/Interview");
const User = require("../models/User");
const {
  getRandomQuestion,
  getAdaptiveDifficulty,
} = require("../utils/questionBank");
const {
  analyzeAnswerWithAI,
  calculateOverallPerformance,
} = require("../utils/aiAnalyzer");

// @desc    Start new interview
// @route   POST /api/interviews/start
// @access  Private
exports.startInterview = async (req, res, next) => {
  try {
    const { jobRole, experienceLevel } = req.body;

    if (!jobRole || !experienceLevel) {
      return res.status(400).json({
        success: false,
        message: "Please provide job role and experience level",
      });
    }

    // Get first question (always start with easy)
    const firstQuestion = await getRandomQuestion("easy");

    if (!firstQuestion) {
      return res.status(500).json({
        success: false,
        message: "Unable to generate questions",
      });
    }

    // Create interview
    const interview = await Interview.create({
      user: req.user.id,
      jobRole,
      experienceLevel,
      currentDifficulty: "easy",
      currentQuestion: {
        _id: firstQuestion._id,
        text: firstQuestion.text,
        category: firstQuestion.category,
        difficulty: firstQuestion.difficulty,
        keywords: firstQuestion.keywords,
      },
      questionNumber: 1,
      totalQuestions: 5,
      status: "active",
    });

    res.status(201).json({
      success: true,
      interview: {
        id: interview._id,
        jobRole: interview.jobRole,
        experienceLevel: interview.experienceLevel,
        currentQuestion: {
          questionText: firstQuestion.text,
          difficulty: firstQuestion.difficulty,
          category: firstQuestion.category,
        },
        questionNumber: 1,
        totalQuestions: 5,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answer
// @route   POST /api/interviews/submit-answer
// @access  Private
exports.submitAnswer = async (req, res, next) => {
  try {
    const { interviewId, questionNumber, answer, answerType, timeSpent } =
      req.body;

    const interview = await Interview.findById(interviewId);

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

    // Analyze answer with AI
    const evaluation = await analyzeAnswerWithAI(
      interview.currentQuestion.text,
      answer,
      interview.currentQuestion.difficulty,
      interview.currentQuestion.category,
    );

    // Save answer
    interview.answers.push({
      questionId: interview.currentQuestion._id,
      questionNumber,
      questionText: interview.currentQuestion.text,
      answer,
      answerType: answerType || "text",
      timeSpent,
      evaluation,
    });

    // Determine if interview is complete
    const isComplete = questionNumber >= interview.totalQuestions;

    if (!isComplete) {
      // Get next question with adaptive difficulty
      const nextDifficulty = getAdaptiveDifficulty(
        interview.currentQuestion.difficulty,
        evaluation.overallScore,
      );

      const nextQuestion = await getRandomQuestion(nextDifficulty);

      if (nextQuestion) {
        interview.currentQuestion = {
          _id: nextQuestion._id,
          text: nextQuestion.text,
          category: nextQuestion.category,
          difficulty: nextQuestion.difficulty,
          keywords: nextQuestion.keywords,
        };
        interview.currentDifficulty = nextDifficulty;
        interview.questionNumber = questionNumber + 1;
      }
    }

    await interview.save();

    res.status(200).json({
      success: true,
      evaluation,
      isComplete,
      nextQuestion: !isComplete
        ? {
            questionText: interview.currentQuestion.text,
            difficulty: interview.currentQuestion.difficulty,
            category: interview.currentQuestion.category,
            questionNumber: interview.questionNumber,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete interview
// @route   POST /api/interviews/:id/complete
// @access  Private
exports.completeInterview = async (req, res, next) => {
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

    // Calculate overall performance
    const performance = calculateOverallPerformance(interview.answers);

    interview.overallPerformance = performance;
    interview.status = "completed";
    interview.completedAt = new Date();

    await interview.save();

    // Update user stats
    const user = await User.findById(req.user.id);
    const totalInterviews = user.stats.totalInterviews + 1;
    const newAverage =
      (user.stats.averageScore * user.stats.totalInterviews +
        performance.totalScore) /
      totalInterviews;

    user.stats.totalInterviews = totalInterviews;
    user.stats.averageScore = Math.round(newAverage);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Interview completed successfully",
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interview history
// @route   GET /api/interviews/history
// @access  Private
exports.getInterviewHistory = async (req, res, next) => {
  try {
    const interviews = await Interview.find({
      user: req.user.id,
      status: "completed",
    })
      .sort("-completedAt")
      .select("-currentQuestion -answers");

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interview details
// @route   GET /api/interviews/:id
// @access  Private
exports.getInterviewDetails = async (req, res, next) => {
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

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};
