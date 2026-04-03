const User = require("../models/User");
const parseResume = require("../utils/resumeParser");

// @desc    Upload and parse resume
// @route   POST /api/resume/upload
// @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse resume
    const resumeData = await parseResume(req.file.path);

    // Update user with resume data
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        resumeUrl: `/uploads/${req.file.filename}`,
        resumeData: {
          skills: resumeData.skills || [],
          experience: resumeData.experience || "",
          education: resumeData.education || "",
          summary: resumeData.summary || "",
        },
      },
      { new: true },
    );

    res.json({
      success: true,
      message: "Resume uploaded successfully",
      resumeData: user.resumeData,
      resumeUrl: user.resumeUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resume details
// @route   GET /api/resume/details
// @access  Private
exports.getResumeDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "resumeData resumeUrl",
    );

    if (!user.resumeUrl) {
      return res.status(404).json({ message: "No resume found" });
    }

    res.json({
      success: true,
      resumeData: user.resumeData,
      resumeUrl: user.resumeUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resume
// @access  Private
exports.deleteResume = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        resumeUrl: null,
        resumeData: {},
      },
      { new: true },
    );

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
