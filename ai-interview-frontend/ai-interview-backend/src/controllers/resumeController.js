const User = require("../models/User");
const { parseResume } = require("../utils/resumeParser");

// @desc    Upload resume
// @route   POST /api/resume/upload
// @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file",
      });
    }

    // Parse resume
    const resumeData = await parseResume(req.file.path);

    // Update user with resume info
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        resume: {
          filename: req.file.filename,
          filepath: req.file.path,
          skills: resumeData.skills,
          uploadDate: new Date(),
        },
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: {
        filename: req.file.filename,
        skills: resumeData.skills,
        experience: resumeData.experience,
        education: resumeData.education,
      },
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
    const user = await User.findById(req.user.id);

    if (!user.resume || !user.resume.filepath) {
      return res.status(404).json({
        success: false,
        message: "No resume found",
      });
    }

    res.status(200).json({
      success: true,
      data: user.resume,
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
    const user = await User.findById(req.user.id);

    if (!user.resume || !user.resume.filepath) {
      return res.status(404).json({
        success: false,
        message: "No resume found",
      });
    }

    // Delete file
    const fs = require("fs");
    if (fs.existsSync(user.resume.filepath)) {
      fs.unlinkSync(user.resume.filepath);
    }

    // Remove from database
    user.resume = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
