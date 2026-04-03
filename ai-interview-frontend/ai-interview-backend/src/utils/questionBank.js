const Question = require("../models/Question");

// Sample questions database
const sampleQuestions = [
  // Easy Technical Questions
  {
    category: "technical",
    difficulty: "easy",
    text: "What is React and why is it used in web development?",
    skills: ["react", "frontend"],
    company: "General",
    keywords: ["component", "virtual dom", "ui", "library", "reusable"],
  },
  {
    category: "technical",
    difficulty: "easy",
    text: "Explain the difference between let, const, and var in JavaScript.",
    skills: ["javascript"],
    company: "General",
    keywords: ["scope", "hoisting", "block scope", "immutable"],
  },
  {
    category: "technical",
    difficulty: "easy",
    text: "What is the difference between == and === in JavaScript?",
    skills: ["javascript"],
    company: "General",
    keywords: ["type coercion", "strict equality", "comparison"],
  },

  // Easy Behavioral Questions
  {
    category: "behavioral",
    difficulty: "easy",
    text: "Tell me about yourself and your experience in software development.",
    skills: ["communication"],
    company: "General",
    keywords: ["background", "experience", "skills"],
  },
  {
    category: "behavioral",
    difficulty: "easy",
    text: "Why are you interested in this position?",
    skills: ["communication"],
    company: "General",
    keywords: ["motivation", "career goals", "interest"],
  },

  // Medium Technical Questions
  {
    category: "technical",
    difficulty: "medium",
    text: "How does React's virtual DOM work and what are its benefits?",
    skills: ["react", "performance"],
    company: "General",
    keywords: ["reconciliation", "diffing", "performance", "rendering"],
  },
  {
    category: "technical",
    difficulty: "medium",
    text: "Explain the concept of closures in JavaScript with an example.",
    skills: ["javascript"],
    company: "General",
    keywords: [
      "lexical scope",
      "function",
      "encapsulation",
      "private variables",
    ],
  },
  {
    category: "technical",
    difficulty: "medium",
    text: "What are Promises in JavaScript and how do they work?",
    skills: ["javascript", "async"],
    company: "General",
    keywords: ["asynchronous", "then", "catch", "async await"],
  },

  // Medium Problem-Solving Questions
  {
    category: "problem-solving",
    difficulty: "medium",
    text: "How would you optimize a slow-loading web application?",
    skills: ["performance", "optimization"],
    company: "General",
    keywords: ["caching", "lazy loading", "cdn", "minification", "bundling"],
  },
  {
    category: "problem-solving",
    difficulty: "medium",
    text: "Describe your approach to debugging a complex production issue.",
    skills: ["debugging", "problem-solving"],
    company: "General",
    keywords: ["logs", "monitoring", "systematic", "reproduction"],
  },

  // Hard System Design Questions
  {
    category: "system-design",
    difficulty: "hard",
    text: "Design a URL shortening service like bit.ly. Discuss the architecture, database schema, and scaling strategies.",
    skills: ["system_design", "scalability"],
    company: "Google",
    keywords: [
      "hashing",
      "database",
      "caching",
      "load balancing",
      "distributed",
    ],
  },
  {
    category: "system-design",
    difficulty: "hard",
    text: "How would you design a real-time chat application that can handle millions of users?",
    skills: ["system_design", "websockets"],
    company: "Microsoft",
    keywords: [
      "websockets",
      "real-time",
      "scalability",
      "message queue",
      "microservices",
    ],
  },

  // Hard Coding Questions
  {
    category: "coding",
    difficulty: "hard",
    text: "Implement a function to detect and remove cycles in a linked list. Explain your approach and time complexity.",
    skills: ["algorithms", "data_structures"],
    company: "Amazon",
    keywords: ["floyd", "two pointers", "cycle detection", "O(n)"],
  },
  {
    category: "coding",
    difficulty: "hard",
    text: "Design an LRU (Least Recently Used) cache with O(1) time complexity for both get and put operations.",
    skills: ["algorithms", "data_structures"],
    company: "Facebook",
    keywords: ["hashmap", "doubly linked list", "cache", "O(1)"],
  },

  // Additional Medium Behavioral Questions
  {
    category: "behavioral",
    difficulty: "medium",
    text: "Describe a time when you had to work with a difficult team member. How did you handle it?",
    skills: ["communication", "teamwork"],
    company: "General",
    keywords: ["conflict resolution", "collaboration", "empathy"],
  },
  {
    category: "behavioral",
    difficulty: "medium",
    text: "Tell me about a project where you had to learn a new technology quickly.",
    skills: ["learning", "adaptability"],
    company: "General",
    keywords: ["self-learning", "documentation", "practice", "implementation"],
  },
];

// Initialize questions in database
async function initializeQuestions() {
  try {
    const count = await Question.countDocuments();

    if (count === 0) {
      await Question.insertMany(sampleQuestions);
      console.log("✅ Sample questions initialized");
    }
  } catch (error) {
    console.error("❌ Error initializing questions:", error);
  }
}

// Get questions by difficulty and experience level
async function getQuestionsByDifficulty(
  difficulty,
  experienceLevel,
  company = "General",
  limit = 1,
) {
  try {
    // Adjust difficulty based on experience level
    let targetDifficulty = difficulty;

    if (experienceLevel === "fresher" && difficulty === "hard") {
      targetDifficulty = "medium";
    } else if (experienceLevel === "experienced" && difficulty === "easy") {
      targetDifficulty = "medium";
    }

    // Try to get company-specific questions first
    let questions = await Question.find({
      difficulty: targetDifficulty,
      company: company,
      isActive: true,
    }).limit(limit);

    // If not enough company-specific questions, get general ones
    if (questions.length < limit) {
      const generalQuestions = await Question.find({
        difficulty: targetDifficulty,
        company: "General",
        isActive: true,
      }).limit(limit - questions.length);

      questions = [...questions, ...generalQuestions];
    }

    return questions;
  } catch (error) {
    console.error("Error getting questions:", error);
    return [];
  }
}

// Get random question
async function getRandomQuestion(difficulty, category = null) {
  try {
    const query = { difficulty, isActive: true };
    if (category) query.category = category;

    const count = await Question.countDocuments(query);
    const random = Math.floor(Math.random() * count);

    const question = await Question.findOne(query).skip(random);
    return question;
  } catch (error) {
    console.error("Error getting random question:", error);
    return null;
  }
}

// Determine next difficulty based on performance
function getAdaptiveDifficulty(currentDifficulty, score) {
  if (score >= 80) {
    // Excellent performance - increase difficulty
    if (currentDifficulty === "easy") return "medium";
    if (currentDifficulty === "medium") return "hard";
    return "hard";
  } else if (score >= 60) {
    // Good performance - maintain difficulty
    return currentDifficulty;
  } else {
    // Poor performance - decrease difficulty
    if (currentDifficulty === "hard") return "medium";
    if (currentDifficulty === "medium") return "easy";
    return "easy";
  }
}

module.exports = {
  initializeQuestions,
  getQuestionsByDifficulty,
  getRandomQuestion,
  getAdaptiveDifficulty,
};
