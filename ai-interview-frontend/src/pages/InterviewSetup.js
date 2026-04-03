import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import InterviewService from "../services/interviewService";
import Button from "../components/Button";
import { ErrorMessage } from "../components/UIComponents";

export default function InterviewSetup() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jobRole: user?.targetRole || "",
    experienceLevel: user?.experienceLevel || "fresher",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await InterviewService.startInterview(
      formData.jobRole,
      formData.experienceLevel,
    );

    setLoading(false);

    if (result.success) {
      const interviewData = {
        interviewId: result.data.interviewId,
        questions: result.data.questions,
        currentQuestion: result.data.questions?.[0] || null,
        questionNumber: 1,
        totalQuestions: result.data.questions?.length || 5,
      };
      navigate("/interview/session", {
        state: { interviewData },
      });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚙️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Setup Your Interview
          </h1>
          <p className="text-gray-600">
            Customize your interview experience based on your target role
          </p>
        </div>

        <form onSubmit={handleStartInterview} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Job Role / Position
            </label>
            <input
              type="text"
              name="jobRole"
              value={formData.jobRole}
              onChange={handleChange}
              placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
            <p className="text-gray-500 text-sm mt-2">
              Enter the job role you're preparing for
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="fresher">Fresher (0-1 years)</option>
              <option value="intermediate">Intermediate (1-5 years)</option>
              <option value="experienced">Experienced (5+ years)</option>
            </select>
            <p className="text-gray-500 text-sm mt-2">
              Questions will be tailored to your experience level
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              📋 What to Expect:
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 5 role-specific interview questions</li>
              <li>• AI-powered answer evaluation</li>
              <li>• Instant feedback and suggestions</li>
              <li>• Adaptive difficulty based on your performance</li>
              <li>• Comprehensive performance report</li>
            </ul>
          </div>

          <ErrorMessage message={error} />

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => navigate("/dashboard")}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              variant="primary"
              className="flex-1"
            >
              {loading ? "Starting Interview..." : "Start Interview"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
