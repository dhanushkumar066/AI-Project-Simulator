// AI-powered answer analysis using Anthropic Claude API

async function analyzeAnswerWithAI(question, answer, difficulty, category) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `You are an expert technical interviewer evaluating candidate answers. Analyze this interview answer and provide detailed, constructive feedback.

**Question Category**: ${category}
**Difficulty Level**: ${difficulty}
**Question**: ${question}
**Candidate's Answer**: ${answer}

Please evaluate the answer and respond with a JSON object containing:

{
  "overallScore": <number 0-100>,
  "contentScore": <number 0-100>,
  "clarityScore": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "feedback": "<2-3 sentences of constructive feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "suggestedAnswer": "<a well-structured model answer in 2-3 sentences>"
}

Scoring criteria:
- contentScore: Technical accuracy and completeness
- clarityScore: How clear and well-structured the answer is
- confidenceScore: Confidence level demonstrated in the answer
- communicationScore: Overall communication effectiveness
- overallScore: Weighted average of all scores

Be constructive, encouraging, and specific in your feedback.`,
          },
        ],
      }),
    });

    const data = await response.json();
    const content = data.content[0].text;

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const evaluation = JSON.parse(jsonMatch[0]);

      // Ensure all scores are within 0-100 range
      return {
        overallScore: Math.min(100, Math.max(0, evaluation.overallScore || 70)),
        contentScore: Math.min(100, Math.max(0, evaluation.contentScore || 70)),
        clarityScore: Math.min(100, Math.max(0, evaluation.clarityScore || 70)),
        confidenceScore: Math.min(
          100,
          Math.max(0, evaluation.confidenceScore || 70),
        ),
        communicationScore: Math.min(
          100,
          Math.max(0, evaluation.communicationScore || 70),
        ),
        feedback:
          evaluation.feedback || "Good effort on answering this question.",
        strengths: evaluation.strengths || [
          "Attempted the question",
          "Provided relevant points",
        ],
        improvements: evaluation.improvements || [
          "Consider adding more details",
          "Structure your answer better",
        ],
        suggestedAnswer:
          evaluation.suggestedAnswer ||
          "A comprehensive answer would cover the main concepts clearly.",
      };
    }

    // Fallback if JSON parsing fails
    return getFallbackEvaluation();
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return getFallbackEvaluation();
  }
}

// Fallback evaluation when AI is unavailable
function getFallbackEvaluation() {
  return {
    overallScore: 70,
    contentScore: 70,
    clarityScore: 70,
    confidenceScore: 70,
    communicationScore: 70,
    feedback:
      "Your answer has been recorded. AI evaluation is temporarily unavailable.",
    strengths: ["Provided an answer", "Engaged with the question"],
    improvements: [
      "Consider adding more technical details",
      "Structure your answer more clearly",
    ],
    suggestedAnswer:
      "A strong answer would include specific examples and clear explanations.",
  };
}

// Simple keyword-based analysis (backup method)
function analyzeAnswerSimple(answer, question) {
  const answerLower = answer.toLowerCase();
  const keywords = question.keywords || [];

  // Calculate keyword match score
  let keywordScore = 0;
  keywords.forEach((keyword) => {
    if (answerLower.includes(keyword.toLowerCase())) {
      keywordScore += 20;
    }
  });

  // Technical score (0-100)
  const technicalScore = Math.min(
    100,
    keywordScore + (answer.length > 100 ? 30 : 10),
  );

  // Communication score based on answer length and structure
  const sentences = answer.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const communicationScore = Math.min(
    100,
    answer.length / 5 + sentences.length * 10,
  );

  const overallScore = Math.round((technicalScore + communicationScore) / 2);

  return {
    overallScore,
    contentScore: technicalScore,
    clarityScore: communicationScore,
    confidenceScore: 70,
    communicationScore,
    feedback: `Your answer covered ${keywordScore > 0 ? "some" : "few"} key concepts. ${answer.length > 100 ? "Good detail provided." : "Consider adding more details."}`,
    strengths: ["Attempted the question"],
    improvements: ["Add more specific examples", "Cover more key concepts"],
    suggestedAnswer:
      "A comprehensive answer would include the main concepts with clear examples.",
  };
}

// Calculate overall interview performance
function calculateOverallPerformance(answers) {
  if (answers.length === 0) {
    return {
      totalScore: 0,
      averageConfidence: 0,
      averageCommunication: 0,
      averageContent: 0,
      technicalScore: 0,
      communicationScore: 0,
      confidenceScore: 0,
    };
  }

  const totalScore =
    answers.reduce((sum, a) => sum + (a.evaluation?.overallScore || 0), 0) /
    answers.length;
  const averageConfidence =
    answers.reduce((sum, a) => sum + (a.evaluation?.confidenceScore || 0), 0) /
    answers.length;
  const averageCommunication =
    answers.reduce(
      (sum, a) => sum + (a.evaluation?.communicationScore || 0),
      0,
    ) / answers.length;
  const averageContent =
    answers.reduce((sum, a) => sum + (a.evaluation?.contentScore || 0), 0) /
    answers.length;

  return {
    totalScore: Math.round(totalScore),
    averageConfidence: Math.round(averageConfidence),
    averageCommunication: Math.round(averageCommunication),
    averageContent: Math.round(averageContent),
    technicalScore: Math.round(averageContent),
    communicationScore: Math.round(averageCommunication),
    confidenceScore: Math.round(averageConfidence),
  };
}

module.exports = {
  analyzeAnswerWithAI,
  analyzeAnswerSimple,
  calculateOverallPerformance,
};
