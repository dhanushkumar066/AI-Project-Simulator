const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const connectDB = require("./config/database");
const config = require("./config/config");
const errorHandler = require("./middleware/errorHandler");
const { initializeQuestions } = require("./utils/questionBank");

// Import routes
const authRoutes = require("./routes/auth");
const resumeRoutes = require("./routes/resume");
const interviewRoutes = require("./routes/interview");
const resultRoutes = require("./routes/result");

const app = express();

// Connect to MongoDB
connectDB();

// Initialize questions in the database
initializeQuestions();

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan("dev")); // Logging
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for uploaded resumes)
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "AI Interview Backend is running!",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/result", resultRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "AI Interview Platform API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      resume: "/api/resume",
      interview: "/api/interview",
      results: "/api/result",
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = config.port;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🗄️  Database: Connected to MongoDB`);
});

module.exports = app;
