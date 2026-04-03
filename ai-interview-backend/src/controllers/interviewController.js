const Interview = require("../models/Interview");
const Question = require("../models/Question");
const User = require("../models/User");
const { getQuestionsByDifficulty } = require("../utils/questionBank");
const { analyzeAnswer } = require("../utils/aiAnalyzer");

// @desc    Start new interview
// @route   POST /api/interviews/start
// @access  Private
exports.startInterview = async (req, res, next) => {
  try {
    const { jobRole, experienceLevel, company } = req.body;
    const interviewCompany = company || jobRole || "General";

    if (!interviewCompany) {
      return res
        .status(400)
        .json({ message: "Job role or company is required" });
    }

    // Create new interview session
    const interview = await Interview.create({
      userId: req.user.id,
      company: interviewCompany,
      status: "in-progress",
      difficulty: "easy",
    });

    // Get initial questions (easy level)
    const questions = await getQuestionsByDifficulty(
      "easy",
      interviewCompany,
      3,
    );

    if (!questions || questions.length === 0) {
      return res.status(500).json({ message: "Unable to generate questions" });
    }

    // Format questions - handle both MongoDB and OpenAI-generated questions
    const formattedQuestions = questions.map((q) => ({
      id: q._id || q.id || Math.random().toString(36).substr(2, 9),
      text: q.text,
      category: q.category || "technical",
      difficulty: q.difficulty || "easy",
      keywords: q.keywords || [],
    }));

    res.json({
      success: true,
      interviewId: interview._id,
      questions: formattedQuestions,
      message: "Interview started successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get next question
// @route   GET /api/interview/:id/next
// @access  Private
exports.getNextQuestion = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Get question based on current difficulty
    const questions = await getQuestionsByDifficulty(
      interview.difficulty,
      interview.company,
      1,
    );

    if (questions.length === 0) {
      return res.status(404).json({ message: "No more questions available" });
    }

    const question = questions[0];

    res.json({
      success: true,
      question: {
        id: question._id,
        text: question.text,
        category: question.category,
        difficulty: question.difficulty,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answer
// @route   POST /api/interview/:id/submit
// @access  Private
exports.submitAnswer = async (req, res, next) => {
  try {
    const { questionId, answer, confidence } = req.body;

    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Get question details
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Analyze answer using AI
    const analysis = await analyzeAnswer(answer, question, confidence);

    // Add answer to interview
    interview.answers.push({
      questionId: question._id,
      questionText: question.text,
      answer: answer,
      confidence: confidence,
      difficulty: question.difficulty,
      score: analysis.score,
    });

    // Update difficulty based on performance and confidence
    if (confidence > 75 && analysis.score.technical > 70) {
      interview.difficulty = "hard";
    } else if (confidence > 50 && analysis.score.technical > 50) {
      interview.difficulty = "medium";
    } else {
      interview.difficulty = "easy";
    }

    interview.currentQuestionIndex += 1;
    await interview.save();

    res.json({
      success: true,
      message: "Answer submitted successfully",
      analysis: analysis,
      nextDifficulty: interview.difficulty,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Select company for interview
// @route   POST /api/interview/select-company
// @access  Private
exports.selectCompany = async (req, res, next) => {
  try {
    const { company } = req.body;

    if (!company) {
      return res.status(400).json({ message: "Company is required" });
    }

    res.json({
      success: true,
      company: company,
      message: "Company selected successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Finish interview
// @route   POST /api/interviews/:id/finish
// @access  Private
exports.finishInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    interview.status = "completed";
    interview.completedAt = new Date();
    await interview.save();

    res.json({
      success: true,
      message: "Interview completed successfully",
      interviewId: interview._id,
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
    const interviews = await Interview.find({ userId: req.user.id })
      .select("-answers")
      .sort({ startedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      interviews: interviews,
      message: "Interview history retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};
