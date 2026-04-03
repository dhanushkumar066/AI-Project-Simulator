const { OpenAI } = require("openai");
const config = require("../config/config");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate interview questions using OpenAI
async function generateInterviewQuestions(
  jobRole,
  difficulty = "easy",
  count = 3,
) {
  try {
    console.log(
      `🔍 Attempting to generate questions for: ${jobRole}, difficulty: ${difficulty}`,
    );
    console.log(`🔑 API Key present: ${!!process.env.OPENAI_API_KEY}`);

    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === "your-openai-api-key-here"
    ) {
      console.warn("⚠️  OpenAI API key not configured, using sample questions");
      return null; // Return null to use sample questions as fallback
    }

    const difficultyDescriptions = {
      easy: "beginner-friendly",
      medium: "intermediate",
      hard: "advanced/expert",
    };

    const prompt = `Generate ${count} unique ${difficultyDescriptions[difficulty]} level interview questions for a ${jobRole} position. 
    
Return the questions as a JSON array with this format:
[
  {
    "text": "Question text here",
    "category": "technical|behavioral|problem-solving|coding|system-design",
    "difficulty": "${difficulty}",
    "expectedAnswer": "Brief expected answer",
    "keywords": ["keyword1", "keyword2"]
  }
]

Only return the JSON array, no other text.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical interviewer. Generate realistic interview questions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    const questions = JSON.parse(content);

    // Add company field
    const result = questions.map((q) => ({
      ...q,
      company: jobRole || "General",
    }));

    console.log(
      `✅ Successfully generated ${result.length} questions with OpenAI`,
    );
    return result;
  } catch (error) {
    console.error("❌ Error generating questions with OpenAI:", error.message);
    console.error("Error details:", error.response?.data || error);
    return null; // Return null to use fallback
  }
}

// Analyze user answer using OpenAI
async function analyzeAnswerWithAI(question, userAnswer, confidence) {
  try {
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === "your-openai-api-key-here"
    ) {
      return null; // Use simple analysis as fallback
    }

    const prompt = `You are an expert interviewer evaluating a candidate's answer.

Question: ${question.text}
Candidate's Answer: ${userAnswer}
Candidate's Confidence Level: ${confidence}%
Expected Keywords/Concepts: ${question.keywords?.join(", ") || "None specified"}

Evaluate the answer and provide:
1. Technical Score (0-100): How well does the answer address the technical aspects?
2. Communication Score (0-100): How clear and well-structured is the answer?
3. Brief Feedback (1-2 sentences): Constructive feedback on the answer.

Return as JSON:
{
  "technicalScore": <number>,
  "communicationScore": <number>,
  "feedback": "<feedback text>"
}

Only return the JSON object, no other text.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical interviewer providing constructive feedback.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;
    const analysis = JSON.parse(content);

    return {
      score: {
        technical: analysis.technicalScore,
        communication: analysis.communicationScore,
        confidence: confidence,
      },
      feedback: analysis.feedback,
    };
  } catch (error) {
    console.error("Error analyzing answer with OpenAI:", error.message);
    return null; // Use simple analysis as fallback
  }
}

module.exports = {
  generateInterviewQuestions,
  analyzeAnswerWithAI,
};
