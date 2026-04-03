import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

class InterviewService {
  static async startInterview(jobRole, experienceLevel) {
    try {
      const response = await axios.post(`${API_URL}/interviews/start`, {
        jobRole,
        experienceLevel,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to start interview",
      };
    }
  }

  static async submitAnswer(
    interviewId,
    questionNumber,
    answer,
    answerType,
    timeSpent,
  ) {
    try {
      const response = await axios.post(`${API_URL}/interviews/submit-answer`, {
        interviewId,
        questionNumber,
        answer,
        answerType,
        timeSpent,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to submit answer",
      };
    }
  }

  static async completeInterview(interviewId) {
    try {
      const response = await axios.post(
        `${API_URL}/interviews/${interviewId}/complete`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to complete interview",
      };
    }
  }

  static async getInterviewHistory() {
    try {
      const response = await axios.get(`${API_URL}/interviews/history`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch history",
      };
    }
  }

  static async getInterviewDetails(interviewId) {
    try {
      const response = await axios.get(`${API_URL}/interviews/${interviewId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch interview details",
      };
    }
  }

  static async generateFollowUp(questionText, answer) {
    try {
      const response = await axios.post(`${API_URL}/interviews/follow-up`, {
        questionText,
        answer,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to generate follow-up",
      };
    }
  }
}

export default InterviewService;
