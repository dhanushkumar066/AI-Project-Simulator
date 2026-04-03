require("dotenv").config();
const { generateInterviewQuestions } = require("./src/utils/openaiHelper");

console.log("Testing OpenAI integration...");
console.log("API Key present:", !!process.env.OPENAI_API_KEY);
console.log("Model:", process.env.OPENAI_MODEL);

(async () => {
  try {
    console.log("\nCalling generateInterviewQuestions...");
    const questions = await generateInterviewQuestions(
      "Software Engineer",
      "easy",
      2,
    );

    if (questions) {
      console.log(
        "SUCCESS: Received",
        questions.length,
        "questions from OpenAI",
      );
      console.log("First question:", questions[0].text);
    } else {
      console.log("Returned null - likely using fallback");
    }
  } catch (error) {
    console.error("ERROR:", error.message);
  }
})();
