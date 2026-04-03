const Question = require("../models/Question");
const { generateInterviewQuestions } = require("./openaiHelper");

// Sample questions - In production, these would be in MongoDB
const sampleQuestions = [
  // ============ EASY QUESTIONS ============

  // EASY - Technical
  {
    category: "technical",
    difficulty: "easy",
    text: "What is React and why is it used?",
    skills: ["react", "frontend"],
    company: "General",
    keywords: ["component", "virtual dom", "ui", "library"],
  },
  {
    category: "technical",
    difficulty: "easy",
    text: "Explain the difference between let, const, and var in JavaScript.",
    skills: ["javascript"],
    company: "General",
    keywords: ["scope", "hoisting", "immutable"],
  },
  {
    category: "technical",
    difficulty: "easy",
    text: "What is an API and how does it work?",
    skills: ["backend", "api"],
    company: "General",
    keywords: ["interface", "request", "response", "endpoints"],
  },
  {
    category: "technical",
    difficulty: "easy",
    text: "What is the difference between SQL and NoSQL databases?",
    skills: ["database", "sql", "nosql"],
    company: "General",
    keywords: ["relational", "structured", "flexible", "scalability"],
  },
  {
    category: "technical",
    difficulty: "easy",
    text: "Explain what CSS Box Model is.",
    skills: ["css", "frontend"],
    company: "General",
    keywords: ["margin", "padding", "border", "content"],
  },

  // EASY - Behavioral
  {
    category: "behavioral",
    difficulty: "easy",
    text: "Tell me about yourself and your experience.",
    skills: ["communication"],
    company: "General",
    keywords: ["background", "skills", "experience", "passion"],
  },
  {
    category: "behavioral",
    difficulty: "easy",
    text: "Why are you interested in this position?",
    skills: ["motivation", "research"],
    company: "General",
    keywords: ["role", "company", "growth", "opportunity"],
  },
  {
    category: "behavioral",
    difficulty: "easy",
    text: "What are your strengths and weaknesses?",
    skills: ["self-awareness"],
    company: "General",
    keywords: ["honest", "relevant", "improvement", "balance"],
  },
  {
    category: "behavioral",
    difficulty: "easy",
    text: "Describe a time when you had to work in a team.",
    skills: ["teamwork", "collaboration"],
    company: "General",
    keywords: ["cooperation", "communication", "goal", "result"],
  },
  {
    category: "behavioral",
    difficulty: "easy",
    text: "How do you handle stress and pressure at work?",
    skills: ["stress management"],
    company: "General",
    keywords: ["calm", "organized", "deadline", "solution"],
  },

  // ============ MEDIUM QUESTIONS ============

  // MEDIUM - Technical
  {
    category: "technical",
    difficulty: "medium",
    text: "How does React's virtual DOM work?",
    skills: ["react", "performance"],
    company: "General",
    keywords: ["reconciliation", "diffing", "performance", "update"],
  },
  {
    category: "technical",
    difficulty: "medium",
    text: "What are promise and async/await in JavaScript?",
    skills: ["javascript", "asynchronous"],
    company: "General",
    keywords: ["promise", "async", "await", "callback"],
  },
  {
    category: "technical",
    difficulty: "medium",
    text: "Explain the concept of closures in JavaScript.",
    skills: ["javascript"],
    company: "General",
    keywords: ["closure", "lexical scope", "nested function", "variable"],
  },
  {
    category: "technical",
    difficulty: "medium",
    text: "What is the difference between authentication and authorization?",
    skills: ["security", "backend"],
    company: "General",
    keywords: ["identity", "permission", "jwt", "token"],
  },
  {
    category: "technical",
    difficulty: "medium",
    text: "Explain REST API principals and HTTP methods.",
    skills: ["backend", "api"],
    company: "General",
    keywords: ["rest", "get", "post", "put", "delete", "stateless"],
  },
  {
    category: "technical",
    difficulty: "medium",
    text: "What are microservices and their advantages?",
    skills: ["architecture", "backend"],
    company: "General",
    keywords: ["distributed", "scalability", "independent", "api"],
  },

  // MEDIUM - Problem Solving
  {
    category: "problem-solving",
    difficulty: "medium",
    text: "How would you optimize a slow-loading web page?",
    skills: ["performance", "optimization"],
    company: "General",
    keywords: ["caching", "lazy loading", "cdn", "minification", "compression"],
  },
  {
    category: "problem-solving",
    difficulty: "medium",
    text: "How do you debug a JavaScript performance issue?",
    skills: ["debugging", "performance"],
    company: "General",
    keywords: ["profiling", "bottleneck", "memory", "tools"],
  },
  {
    category: "problem-solving",
    difficulty: "medium",
    text: "Design a notification system for a social media app.",
    skills: ["system design", "scalability"],
    company: "General",
    keywords: ["queue", "database", "real-time", "scalable"],
  },
  {
    category: "problem-solving",
    difficulty: "medium",
    text: "How would you handle session management in a web application?",
    skills: ["backend", "security"],
    company: "General",
    keywords: ["session", "cookie", "jwt", "token", "storage"],
  },

  // MEDIUM - Behavioral
  {
    category: "behavioral",
    difficulty: "medium",
    text: "Tell me about a challenging project you worked on.",
    skills: ["problem-solving", "leadership"],
    company: "General",
    keywords: ["challenge", "solution", "outcome", "learned"],
  },
  {
    category: "behavioral",
    difficulty: "medium",
    text: "How do you handle disagreements with team members?",
    skills: ["communication", "conflict resolution"],
    company: "General",
    keywords: ["listen", "respect", "compromise", "solution"],
  },
  {
    category: "behavioral",
    difficulty: "medium",
    text: "Describe a situation where you failed and what you learned.",
    skills: ["growth mindset", "resilience"],
    company: "General",
    keywords: ["failure", "lesson", "improvement", "honest"],
  },

  // ============ HARD QUESTIONS ============

  // HARD - System Design
  {
    category: "system-design",
    difficulty: "hard",
    text: "Design a URL shortening service like bit.ly.",
    skills: ["system_design", "scalability", "database"],
    company: "Google",
    keywords: ["hashing", "database", "caching", "scalability", "redirect"],
  },
  {
    category: "system-design",
    difficulty: "hard",
    text: "How would you design a real-time chat application?",
    skills: ["system_design", "websockets", "scalability"],
    company: "Microsoft",
    keywords: [
      "websockets",
      "real-time",
      "scalability",
      "message queue",
      "database",
    ],
  },
  {
    category: "system-design",
    difficulty: "hard",
    text: "Design a video streaming platform like YouTube.",
    skills: ["system_design", "scalability", "media"],
    company: "Netflix",
    keywords: ["cdn", "transcoding", "caching", "database", "sharding"],
  },
  {
    category: "system-design",
    difficulty: "hard",
    text: "Design a distributed cache system like Redis.",
    skills: ["system_design", "caching", "distributed"],
    company: "Facebook",
    keywords: [
      "cache",
      "eviction",
      "replication",
      "consistency",
      "performance",
    ],
  },
  {
    category: "system-design",
    difficulty: "hard",
    text: "Design a ride-sharing platform like Uber.",
    skills: ["system_design", "scalability", "real-time"],
    company: "Uber",
    keywords: [
      "geolocation",
      "real-time",
      "matching",
      "scalability",
      "database",
    ],
  },

  // HARD - Coding
  {
    category: "coding",
    difficulty: "hard",
    text: "Implement a function to detect cycles in a linked list.",
    skills: ["algorithms", "data_structures", "linked list"],
    company: "Amazon",
    keywords: ["floyd", "two pointers", "cycle detection", "fast", "slow"],
  },
  {
    category: "coding",
    difficulty: "hard",
    text: "Solve the longest common subsequence problem.",
    skills: ["algorithms", "dynamic programming"],
    company: "Google",
    keywords: ["dp", "subsequence", "optimization", "recursion"],
  },
  {
    category: "coding",
    difficulty: "hard",
    text: "Implement a topological sort algorithm.",
    skills: ["algorithms", "graphs"],
    company: "Microsoft",
    keywords: ["dag", "graph", "bfs", "dfs", "ordering"],
  },
  {
    category: "coding",
    difficulty: "hard",
    text: "Design and implement an LRU cache.",
    skills: ["data_structures", "cache"],
    company: "Facebook",
    keywords: ["lru", "hashmap", "doubly linked list", "eviction"],
  },
  {
    category: "coding",
    difficulty: "hard",
    text: "Find the median of two sorted arrays.",
    skills: ["algorithms", "binary search"],
    company: "Apple",
    keywords: ["binary search", "partition", "optimization"],
  },

  // HARD - Behavioral
  {
    category: "behavioral",
    difficulty: "hard",
    text: "Tell me about a time you had to lead a team through a crisis.",
    skills: ["leadership", "crisis management"],
    company: "General",
    keywords: ["leadership", "decision", "communication", "outcome"],
  },
  {
    category: "behavioral",
    difficulty: "hard",
    text: "Describe your biggest professional achievement.",
    skills: ["accomplishment", "impact"],
    company: "General",
    keywords: ["challenge", "solution", "impact", "business"],
  },
  {
    category: "behavioral",
    difficulty: "hard",
    text: "How do you stay updated with latest technologies?",
    skills: ["continuous learning", "growth"],
    company: "General",
    keywords: ["learning", "courses", "projects", "community"],
  },
  {
    category: "behavioral",
    difficulty: "hard",
    text: "What would you do if you had 6 months with no constraints?",
    skills: ["creativity", "vision"],
    company: "General",
    keywords: ["innovative", "impact", "learning", "growth"],
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
    console.error("Error initializing questions:", error);
  }
}

// Get questions by difficulty
async function getQuestionsByDifficulty(
  difficulty,
  company = "General",
  limit = 5,
) {
  try {
    // Try to generate questions using OpenAI
    const aiQuestions = await generateInterviewQuestions(
      company,
      difficulty,
      limit,
    );
    if (aiQuestions && aiQuestions.length > 0) {
      console.log(`✨ Generated ${aiQuestions.length} questions using OpenAI`);
      return aiQuestions;
    }

    // Fallback to database questions
    let questions = await Question.find({
      difficulty: difficulty,
      company: company,
    })
      .limit(limit)
      .lean();

    // If not enough company-specific questions, get general ones
    if (questions.length < limit) {
      const generalQuestions = await Question.find({
        difficulty: difficulty,
        company: "General",
      })
        .limit(limit - questions.length)
        .lean();

      questions = [...questions, ...generalQuestions];
    }

    // If still no questions, return sample questions as fallback
    if (questions.length === 0) {
      questions = sampleQuestions
        .filter((q) => q.difficulty === difficulty)
        .slice(0, limit);
    }

    return questions;
  } catch (error) {
    console.error("Error getting questions:", error);
    // Return sample questions as fallback
    return sampleQuestions
      .filter((q) => q.difficulty === difficulty)
      .slice(0, limit);
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

module.exports = {
  initializeQuestions,
  getQuestionsByDifficulty,
  getRandomQuestion,
};
