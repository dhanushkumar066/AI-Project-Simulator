require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/ai-interview",
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  jwtExpire: process.env.JWT_EXPIRE || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  uploadPath: process.env.UPLOAD_PATH || "./uploads",
};
