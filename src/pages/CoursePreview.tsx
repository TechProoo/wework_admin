import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

type Question = {
  id: string;
  text: string;
  options: string[];
  answer: string;
};

type Quiz = {
  title: string;
  questions: Question[];
};

type Lesson = {
  id: string;
  title: string;
  order: number;
  duration: number;
  content: string;
  videoUrl: string;
  quiz?: Quiz | null;
};

type Course = {
  title: string;
  category: string;
  level: string;
  duration: number;
  description: string;
  thumbnail: string;
  lessons: Lesson[];
};

export default function CoursePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const course = location.state?.course as Course;

  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No course data found
          </h2>
          <p className="text-gray-600 mb-4">
            Please navigate from the course creation page.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="btn"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);
  const currentLesson = sortedLessons[selectedLessonIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="btn-ghost"
            >
              ← Back to Editor
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-sm text-gray-500">
                {course.category} • {course.level} • {sortedLessons.length} Lessons
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded">
            📖 Preview Mode
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar - Lesson Navigation */}
        <aside className="w-80 bg-white border-r min-h-screen sticky top-[73px] self-start">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">Course Content</h2>
            <p className="text-sm text-gray-600 mt-1">
              {sortedLessons.length} lessons • {course.duration} min total
            </p>
          </div>

          <nav className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 145px)" }}>
            {sortedLessons.map((lesson, index) => (
              <button
                key={lesson.id}
                onClick={() => setSelectedLessonIndex(index)}
                className={`w-full text-left p-4 border-b transition-colors ${
                  selectedLessonIndex === index
                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                    : "hover:bg-gray-50 border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      selectedLessonIndex === index
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium text-sm ${
                        selectedLessonIndex === index
                          ? "text-blue-900"
                          : "text-gray-900"
                      }`}
                    >
                      {lesson.title || `Lesson ${index + 1}`}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>⏱️ {lesson.duration} min</span>
                      {lesson.videoUrl && <span>🎥 Video</span>}
                      {lesson.quiz && <span>📝 Quiz</span>}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {/* Lesson Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>Lesson {selectedLessonIndex + 1}</span>
                <span>•</span>
                <span>{currentLesson.duration} minutes</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {currentLesson.title || `Lesson ${selectedLessonIndex + 1}`}
              </h2>
            </div>

            {/* Video */}
            {currentLesson.videoUrl && (
              <div className="mb-8">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    src={currentLesson.videoUrl}
                    controls
                    className="w-full h-full"
                    controlsList="nodownload"
                  />
                </div>
              </div>
            )}

            {/* Lesson Content */}
            <div className="mb-8">
              <div className="prose prose-lg max-w-none">
                <ReactQuill
                  value={currentLesson.content || "<p>No content available</p>"}
                  readOnly={true}
                  theme="bubble"
                  modules={{ toolbar: false }}
                />
              </div>
            </div>

            {/* Quiz Section */}
            {currentLesson.quiz && currentLesson.quiz.questions.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentLesson.quiz.title || "Lesson Quiz"}
                  </h3>
                  <p className="text-gray-600">
                    Test your understanding with {currentLesson.quiz.questions.length} question
                    {currentLesson.quiz.questions.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="space-y-6">
                  {currentLesson.quiz.questions.map((question, qIndex) => (
                    <div
                      key={question.id}
                      className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                    >
                      <h4 className="font-semibold text-gray-900 mb-4">
                        {qIndex + 1}. {question.text}
                      </h4>

                      <div className="space-y-3">
                        {question.options.map((option, oIndex) => {
                          const isCorrect = option === question.answer;
                          const optionLabel = String.fromCharCode(65 + oIndex); // A, B, C, D

                          return (
                            <div
                              key={oIndex}
                              className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                                isCorrect
                                  ? "bg-green-50 border-green-500"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              <div
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                                  isCorrect
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {optionLabel}
                              </div>
                              <div className="flex-1">
                                <p className={isCorrect ? "text-green-900 font-medium" : "text-gray-700"}>
                                  {option}
                                </p>
                              </div>
                              {isCorrect && (
                                <span className="flex-shrink-0 text-green-600 font-semibold text-sm">
                                  ✓ Correct Answer
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t">
              <button
                onClick={() =>
                  selectedLessonIndex > 0 &&
                  setSelectedLessonIndex(selectedLessonIndex - 1)
                }
                disabled={selectedLessonIndex === 0}
                className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous Lesson
              </button>
              <div className="text-sm text-gray-500">
                {selectedLessonIndex + 1} of {sortedLessons.length}
              </div>
              <button
                onClick={() =>
                  selectedLessonIndex < sortedLessons.length - 1 &&
                  setSelectedLessonIndex(selectedLessonIndex + 1)
                }
                disabled={selectedLessonIndex === sortedLessons.length - 1}
                className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Lesson →
              </button>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .ql-container.ql-bubble {
          border: none;
          font-family: inherit;
        }
        
        .ql-editor {
          padding: 0;
          font-size: 1rem;
          line-height: 1.75;
        }

        .ql-editor h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: #111827;
        }

        .ql-editor h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.875rem;
          color: #111827;
        }

        .ql-editor h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          color: #111827;
        }

        .ql-editor p {
          margin-bottom: 1rem;
          color: #374151;
        }

        .ql-editor strong {
          font-weight: 600;
          color: #111827;
        }

        .ql-editor em {
          font-style: italic;
        }

        .ql-editor ul,
        .ql-editor ol {
          margin-bottom: 1rem;
          padding-left: 2rem;
        }

        .ql-editor li {
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .ql-editor blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
        }

        .ql-editor pre {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          font-family: 'Courier New', monospace;
        }

        .ql-editor code {
          background-color: #f1f5f9;
          color: #e11d48;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }

        .ql-editor pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }

        .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }

        .ql-editor a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .ql-editor a:hover {
          color: #2563eb;
        }
      `}</style>
    </div>
  );
}
