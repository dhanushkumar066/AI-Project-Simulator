// AI-powered answer analysis
// Uses OpenAI API for intelligent analysis, falls back to keyword-based scoring

const { analyzeAnswerWithAI } = require("./openaiHelper");

async function analyzeAnswer(answer, question, confidence) {
  // Try to use OpenAI for analysis
  const aiAnalysis = await analyzeAnswerWithAI(question, answer, confidence);
  if (aiAnalysis) {
    return aiAnalysis;
  }

  // Fallback to simple keyword-based scoring
  const answerLower = answer.toLowerCase();
  const keywords = question.keywords || [];

  // Calculate keyword match score
  let keywordScore = 0;
  keywords.forEach((keyword) => {
    if (answerLower.includes(keyword.toLowerCase())) {
      keywordScore += 10;
    }
  });

  // Technical score (0-100)
  const technicalScore = Math.min(
    100,
    keywordScore + (answer.length > 50 ? 20 : 0),
  );

  // Communication score based on answer length and structure
  const communicationScore = Math.min(
    100,
    answer.length / 10 + answer.split(".").length * 5,
  );

  // Confidence score (directly from user input)
  const confidenceScore = confidence;

  return {
    score: {
      technical: Math.round(technicalScore),
      communication: Math.round(communicationScore),
      confidence: confidenceScore,
    },
    feedback: `Good answer! ${keywords.length > 0 ? "Key concepts mentioned: " + keywords.join(", ") : ""}`,
  };
}

// Generate overall result
async function generateResult(interview) {
  const answers = interview.answers;

  if (answers.length === 0) {
    return {
      overallScore: 0,
      technicalScore: 0,
      communicationScore: 0,
      confidenceScore: 0,
      skillScores: new Map(),
      suggestions: ["Complete more questions for better analysis"],
      strengths: [],
      weaknesses: ["Not enough data"],
      totalTime: 0,
      averageConfidence: 0,
      accuracyRate: 0,
    };
  }

  // Calculate averages
  const technicalScores = answers.map((a) => a.score?.technical || 0);
  const communicationScores = answers.map((a) => a.score?.communication || 0);
  const confidenceScores = answers.map((a) => a.confidence || 0);

  const technicalScore = Math.round(
    technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length,
  );

  const communicationScore = Math.round(
    communicationScores.reduce((a, b) => a + b, 0) / communicationScores.length,
  );

  const confidenceScore = Math.round(
    confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length,
  );

  const overallScore = Math.round(
    (technicalScore + communicationScore + confidenceScore) / 3,
  );

  // Skill scores
  const skillScores = new Map();
  skillScores.set("react_js", technicalScore);
  skillScores.set(
    "problem_solving",
    Math.round((technicalScore + communicationScore) / 2),
  );
  skillScores.set("communication_skill", communicationScore);

  // Generate suggestions
  const suggestions = generateSuggestions(
    technicalScore,
    communicationScore,
    confidenceScore,
  );

  return {
    overallScore,
    technicalScore,
    communicationScore,
    confidenceScore,
    skillScores,
    suggestions,
    strengths: generateStrengths(
      technicalScore,
      communicationScore,
      confidenceScore,
    ),
    weaknesses: generateWeaknesses(
      technicalScore,
      communicationScore,
      confidenceScore,
    ),
    totalTime: answers.length * 120, // 2 minutes per question
    averageConfidence: confidenceScore,
    accuracyRate: technicalScore,
  };
}

// Generate suggestions
function generateSuggestions(technical, communication, confidence) {
  const suggestions = [];

  if (technical < 50) {
    suggestions.push("Focus on strengthening your technical fundamentals");
    suggestions.push("Practice more coding problems daily");
  }

  if (communication < 50) {
    suggestions.push("Work on structuring your answers more clearly");
    suggestions.push("Practice explaining technical concepts in simple terms");
  }

  if (confidence < 50) {
    suggestions.push("Build confidence through mock interviews");
    suggestions.push("Review your answers and identify areas of uncertainty");
  }

  if (technical >= 70 && communication >= 70) {
    suggestions.push("Great job! Consider tackling more advanced topics");
  }

  return suggestions;
}

// Generate strengths
function generateStrengths(technical, communication, confidence) {
  const strengths = [];

  if (technical >= 70) strengths.push("Strong technical knowledge");
  if (communication >= 70) strengths.push("Excellent communication skills");
  if (confidence >= 70) strengths.push("High confidence level");

  return strengths;
}

// Generate weaknesses
function generateWeaknesses(technical, communication, confidence) {
  const weaknesses = [];

  if (technical < 50) weaknesses.push("Technical knowledge needs improvement");
  if (communication < 50)
    weaknesses.push("Communication clarity can be enhanced");
  if (confidence < 50) weaknesses.push("Build more confidence");

  return weaknesses;
}

module.exports = {
  analyzeAnswer,
  generateResult,
  generateSuggestions,
};
