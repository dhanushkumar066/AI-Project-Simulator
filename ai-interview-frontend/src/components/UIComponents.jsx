import React from "react";

// AnswerBox Component
export function AnswerBox({ transcript }) {
  return (
    <div className="bg-gray-50 border p-4 rounded-lg h-40 overflow-y-auto">
      {transcript ? (
        <p className="text-gray-700">{transcript}</p>
      ) : (
        <p className="text-gray-400">Your answer will appear here...</p>
      )}
    </div>
  );
}

// DifficultyBadge Component
export function DifficultyBadge({ level }) {
  const colorMap = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 text-sm rounded-full font-semibold ${colorMap[level]}`}
    >
      {level.toUpperCase()}
    </span>
  );
}

// ErrorMessage Component
export function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
      {message}
    </div>
  );
}

// Loader Component
export function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-3 text-gray-500 text-sm">{text}</p>
    </div>
  );
}

// Modal Component
export function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-96 p-6 relative max-h-[90vh] overflow-y-auto">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        )}
        {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
}

// ProgressIndicator Component
export function ProgressIndicator({ current, total }) {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Question {current}</span>
        <span>{total} Total</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// QuestionCard Component
export function QuestionCard({ question, difficulty }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Interview Question</h2>
        <DifficultyBadge level={difficulty} />
      </div>
      <p className="text-gray-700 leading-relaxed text-lg">{question}</p>
    </div>
  );
}

// Timer Component
export function Timer({ time }) {
  const isLow = time <= 10;
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div
      className={`text-lg font-bold ${isLow ? "text-red-600" : "text-blue-600"}`}
    >
      Time Remaining: {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}
