import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import InterviewService from '../services/interviewService';
import Button from '../components/Button';
import { Loader } from '../components/UIComponents';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  const fetchInterviewHistory = async () => {
    const result = await InterviewService.getInterviewHistory();
    if (result.success) {
      setInterviewHistory(result.data.interviews);
    }
    setLoading(false);
  };

  const handleStartInterview = () => {
    navigate('/interview/setup');
  };

  const handleViewDetails = (interviewId) => {
    navigate(`/interview/results/${interviewId}`);
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Interview Simulator
              </h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
            </div>
            <Button onClick={logout} variant="secondary">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">
              Total Interviews
            </h3>
            <p className="text-4xl font-bold text-blue-600">
              {user?.stats?.totalInterviews || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">
              Average Score
            </h3>
            <p className="text-4xl font-bold text-green-600">
              {user?.stats?.averageScore || 0}%
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">
              Target Role
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {user?.targetRole || 'Not set'}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-3">Ready for a New Challenge?</h2>
          <p className="mb-6">
            Practice with AI-powered mock interviews and get instant feedback to
            improve your skills.
          </p>
          <Button
            onClick={handleStartInterview}
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            🚀 Start New Interview
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Interview History</h2>

          {interviewHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg mb-4">
                No interviews yet. Start your first one!
              </p>
              <Button onClick={handleStartInterview}>
                Start Your First Interview
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {interviewHistory.map((interview) => (
                <div
                  key={interview._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {interview.jobRole}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Experience Level:{' '}
                        <span className="font-semibold capitalize">
                          {interview.experienceLevel}
                        </span>
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Completed:{' '}
                        {new Date(interview.completedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {interview.overallPerformance?.totalScore || 0}%
                      </div>
                      <Button
                        onClick={() => handleViewDetails(interview._id)}
                        variant="secondary"
                        className="text-sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Confidence</p>
                      <p className="font-semibold">
                        {interview.overallPerformance?.averageConfidence || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Communication</p>
                      <p className="font-semibold">
                        {interview.overallPerformance?.averageCommunication || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Content</p>
                      <p className="font-semibold">
                        {interview.overallPerformance?.averageContent || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
