import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InterviewService from "../services/interviewService";
import VideoService from "../services/videoService";
import EmotionDetectionService from "../services/emotionDetectionService";
import {
  QuestionCard,
  AnswerBox,
  Timer,
  ProgressIndicator,
  ErrorMessage,
  Modal,
} from "../components/UIComponents";
import Button from "../components/Button";

export default function InterviewSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const interviewData = location.state?.interviewData;

  const [currentQuestion, setCurrentQuestion] = useState(
    interviewData?.currentQuestion || null,
  );
  const [questionNumber, setQuestionNumber] = useState(
    interviewData?.questionNumber || 1,
  );
  const [totalQuestions] = useState(interviewData?.totalQuestions || 5);
  const [answer, setAnswer] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [interviewComplete, setInterviewComplete] = useState(false);

  // Video interaction states
  const [useVideoMode, setUseVideoMode] = useState(true);
  const [webcamActive, setWebcamActive] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [emotionData, setEmotionData] = useState(null);
  const [webcamError, setWebcamError] = useState("");

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!interviewData) {
      navigate("/dashboard");
    }

    // Initialize emotion detection
    if (useVideoMode) {
      EmotionDetectionService.initialize();
    }

    return () => {
      VideoService.stopWebcam();
    };
  }, [interviewData, navigate, useVideoMode]);

  useEffect(() => {
    if (timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else {
      handleAutoSubmit();
    }

    return () => clearTimeout(timerRef.current);
  }, [timeRemaining]);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }
        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
          setAnswer((prev) => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleStartRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      setTranscript("");
      recognitionRef.current.start();
    } else {
      setError("Speech recognition not supported. Use Chrome or Edge.");
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Initialize and start webcam
  const handleInitializeWebcam = async () => {
    setWebcamError("");
    const result = await VideoService.initializeWebcam(videoRef.current);
    if (result.success) {
      setWebcamActive(true);
    } else {
      setWebcamError(result.message);
    }
  };

  // Start video recording
  const handleStartVideoRecording = () => {
    if (!videoRef.current) {
      setWebcamError("Webcam not initialized");
      return;
    }

    handleStartRecording(); // Start speech recognition
    VideoService.startRecording(videoRef.current);
    setIsVideoRecording(true);
  };

  // Stop video recording and analyze
  const handleStopVideoRecording = async () => {
    handleStopRecording(); // Stop speech recognition
    setIsVideoRecording(false);

    try {
      setLoading(true);
      const videoBlob = await VideoService.stopRecording();

      // Analyze emotions from video
      if (videoRef.current && videoRef.current.duration) {
        const emotionAnalysis =
          await EmotionDetectionService.analyzeVideoFrames(
            videoRef.current,
            videoRef.current.duration,
          );
        setEmotionData(emotionAnalysis);
      }

      setLoading(false);
    } catch (err) {
      console.error("Video recording error:", err);
      setWebcamError("Error recording video");
      setLoading(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (!answer.trim()) {
      setError("Time is up!");
      return;
    }
    await handleSubmitAnswer();
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError("Please provide an answer");
      return;
    }

    setError("");
    setLoading(true);

    if (isRecording) {
      handleStopRecording();
    }

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    const result = await InterviewService.submitAnswer(
      interviewData.id,
      questionNumber,
      answer,
      isRecording || transcript ? "voice" : "text",
      timeSpent,
    );

    setLoading(false);

    if (result.success) {
      setFeedback(result.data.evaluation);
      setShowFeedback(true);

      if (result.data.isComplete) {
        setInterviewComplete(true);
      } else if (result.data.nextQuestion) {
        setTimeout(() => {
          setCurrentQuestion(result.data.nextQuestion);
          setQuestionNumber(result.data.nextQuestion.questionNumber);
          setAnswer("");
          setTranscript("");
          setTimeRemaining(120);
          setQuestionStartTime(Date.now());
          setShowFeedback(false);
          setFeedback(null);
        }, 5000);
      }
    } else {
      setError(result.message);
    }
  };

  const handleCompleteInterview = async () => {
    const result = await InterviewService.completeInterview(interviewData.id);
    if (result.success) {
      navigate(`/interview/results/${interviewData.id}`);
    } else {
      setError(result.message);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {interviewData.jobRole} Interview
            </h1>
            <Timer time={timeRemaining} />
          </div>
          <ProgressIndicator current={questionNumber} total={totalQuestions} />
        </div>

        <QuestionCard
          question={currentQuestion.questionText}
          difficulty={currentQuestion.difficulty}
        />

        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Your Answer</h2>
            <button
              onClick={() => setUseVideoMode(!useVideoMode)}
              className={`px-3 py-1 rounded text-sm font-semibold transition ${
                useVideoMode
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {useVideoMode ? "📹 Video Mode" : "📝 Text Mode"}
            </button>
          </div>

          {useVideoMode ? (
            <div className="space-y-4">
              {!webcamActive ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 mb-4">
                    Enable your webcam for video interview mode
                  </p>
                  <Button onClick={handleInitializeWebcam} variant="primary">
                    🎥 Enable Webcam
                  </Button>
                  {webcamError && (
                    <p className="text-red-600 text-sm mt-2">{webcamError}</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover"
                    />
                    {isVideoRecording && (
                      <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-bold">
                          REC
                        </span>
                      </div>
                    )}
                  </div>

                  {isVideoRecording && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 mb-2">
                        🎤 Recording... (Speak clearly and look at the camera)
                      </p>
                      <AnswerBox transcript={transcript} />
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!isVideoRecording ? (
                      <>
                        <Button
                          onClick={handleStartVideoRecording}
                          variant="primary"
                          className="flex-1"
                        >
                          🎥 Start Recording
                        </Button>
                        <Button
                          onClick={() => VideoService.stopWebcam()}
                          variant="secondary"
                        >
                          Stop Webcam
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={handleStopVideoRecording}
                        variant="danger"
                        className="flex-1"
                      >
                        ⏹ Stop Recording & Analyze
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here or use voice input..."
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4 outline-none"
                disabled={isRecording}
              />

              {isRecording && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">🎤 Recording...</p>
                  <AnswerBox transcript={transcript} />
                </div>
              )}

              <div className="flex gap-4">
                {!isRecording ? (
                  <>
                    <Button
                      onClick={handleStartRecording}
                      variant="secondary"
                      disabled={loading}
                    >
                      🎤 Start Voice Input
                    </Button>
                    <Button
                      onClick={handleSubmitAnswer}
                      loading={loading}
                      variant="primary"
                      className="flex-1"
                    >
                      Submit Answer
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleStopRecording}
                    variant="danger"
                    className="flex-1"
                  >
                    ⏹ Stop Recording
                  </Button>
                )}
              </div>
            </>
          )}

          <ErrorMessage message={error || webcamError} />
        </div>

        <Modal open={showFeedback} title="Answer Feedback">
          {feedback && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {feedback.overallScore}%
                </div>
                <p className="text-gray-600">Overall Score</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">Content</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {feedback.contentScore}%
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">Clarity</p>
                  <p className="text-2xl font-bold text-green-600">
                    {feedback.clarityScore}%
                  </p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-500">Confidence</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {feedback.confidenceScore}%
                  </p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-500">Communication</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {feedback.communicationScore}%
                  </p>
                </div>
              </div>

              {/* Video Analysis Results */}
              {emotionData && (
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-800 mb-3">
                    📹 Body Language & Expression Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-indigo-50 rounded">
                      <p className="text-xs text-gray-500">Eye Contact</p>
                      <p className="text-xl font-bold text-indigo-600">
                        {emotionData.eyeContactScore}%
                      </p>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <p className="text-xs text-gray-500">Engagement</p>
                      <p className="text-xl font-bold text-red-600">
                        {emotionData.engagementScore}%
                      </p>
                    </div>
                    <div className="text-center p-2 bg-pink-50 rounded">
                      <p className="text-xs text-gray-500">Expressiveness</p>
                      <p className="text-xl font-bold text-pink-600">
                        {emotionData.expressivenessScore}%
                      </p>
                    </div>
                    <div className="text-center p-2 bg-teal-50 rounded">
                      <p className="text-xs text-gray-500">Confidence</p>
                      <p className="text-xl font-bold text-teal-600">
                        {emotionData.confidence}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {EmotionDetectionService.generateVideoFeedback(
                      emotionData,
                    ).map((tip, idx) => (
                      <p key={idx} className="text-sm text-gray-700">
                        {tip}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-800 mb-2">
                  💡 Feedback:
                </p>
                <p className="text-sm text-blue-700">{feedback.feedback}</p>
              </div>

              {interviewComplete ? (
                <Button
                  onClick={handleCompleteInterview}
                  variant="primary"
                  className="w-full"
                >
                  View Full Report
                </Button>
              ) : (
                <p className="text-center text-sm text-gray-500">
                  Next question in a moment...
                </p>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
