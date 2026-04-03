import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InterviewService from "../services/interviewService";
import Button from "../components/Button";
import { Loader, DifficultyBadge } from "../components/UIComponents";

export default function ResultsPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    fetchInterviewDetails();
  }, [interviewId]);

  const fetchInterviewDetails = async () => {
    const result = await InterviewService.getInterviewDetails(interviewId);
    if (result.success) {
      setInterview(result.data.interview);
    }
    setLoading(false);
  };

  if (loading) return <Loader text="Loading results..." />;
  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Interview not found</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const { overallPerformance, questions } = interview;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">Interview Complete! 🎉</h1>
          <p className="text-blue-100 mb-4">
            {interview.jobRole} -{" "}
            <span className="capitalize">{interview.experienceLevel}</span>
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">Overall Score</p>
              <p className="text-4xl font-bold">
                {overallPerformance?.totalScore || 0}%
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">Confidence</p>
              <p className="text-4xl font-bold">
                {overallPerformance?.averageConfidence || 0}%
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">Communication</p>
              <p className="text-4xl font-bold">
                {overallPerformance?.averageCommunication || 0}%
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">Content</p>
              <p className="text-4xl font-bold">
                {overallPerformance?.averageContent || 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Question-by-Question Breakdown
          </h2>

          {questions?.map((q, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition"
                onClick={() =>
                  setExpandedQuestion(expandedQuestion === idx ? null : idx)
                }
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-sm">
                        Q{idx + 1}
                      </span>
                      <DifficultyBadge level={q.difficulty} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {q.questionText}
                    </h3>
                  </div>

                  <div className="text-right ml-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {q.evaluation?.overallScore || 0}%
                    </div>
                    <p className="text-sm text-gray-500">
                      {q.timeSpent || 0}s spent
                    </p>
                  </div>
                </div>

                {expandedQuestion !== idx && (
                  <p className="text-sm text-blue-600 mt-2">
                    Click to view details →
                  </p>
                )}
              </div>

              {expandedQuestion === idx && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Your Answer:
                    </h4>
                    <p className="text-gray-700 bg-white p-4 rounded-lg border">
                      {q.answer}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Content</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {q.evaluation?.contentScore || 0}%
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Clarity</p>
                      <p className="text-3xl font-bold text-green-600">
                        {q.evaluation?.clarityScore || 0}%
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Confidence</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {q.evaluation?.confidenceScore || 0}%
                      </p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        Communication
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        {q.evaluation?.communicationScore || 0}%
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      💡 AI Feedback:
                    </h4>
                    <p className="text-blue-700">
                      {q.evaluation?.feedback || "No feedback available"}
                    </p>
                  </div>

                  {q.evaluation?.strengths &&
                    q.evaluation.strengths.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-green-800 mb-2">
                          ✅ Strengths:
                        </h4>
                        <ul className="list-disc list-inside text-green-700 space-y-1">
                          {q.evaluation.strengths.map((strength, i) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {q.evaluation?.improvements &&
                    q.evaluation.improvements.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          📈 Areas for Improvement:
                        </h4>
                        <ul className="list-disc list-inside text-yellow-700 space-y-1">
                          {q.evaluation.improvements.map((improvement, i) => (
                            <li key={i}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {q.evaluation?.suggestedAnswer && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">
                        💎 Suggested Answer:
                      </h4>
                      <p className="text-purple-700">
                        {q.evaluation.suggestedAnswer}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <Button onClick={() => navigate("/dashboard")} variant="secondary">
            Back to Dashboard
          </Button>
          <Button
            onClick={() => navigate("/interview/setup")}
            variant="primary"
          >
            Start New Interview
          </Button>
        </div>
      </div>
    </div>
  );
}
