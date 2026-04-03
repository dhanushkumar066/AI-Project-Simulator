const express = require("express");
const router = express.Router();
const {
  uploadResume,
  getResumeDetails,
  deleteResume,
} = require("../controllers/resumeController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/upload", protect, upload.single("resume"), uploadResume);
router.get("/details", protect, getResumeDetails);
router.delete("/", protect, deleteResume);

module.exports = router;
