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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 md:w-20 md:h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            No course data found
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-4">
            Please navigate from the course creation page.
          </p>
          <button onClick={() => navigate(-1)} className="btn text-sm md:text-base">
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
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-2.5 md:py-4">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <button 
                onClick={() => navigate(-1)} 
                className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-sm md:text-xl font-bold text-gray-900 truncate">
                  {course.title}
                </h1>
                <p className="text-xs text-gray-500 truncate hidden sm:block">
                  {course.category} • {course.level} • {sortedLessons.length} Lessons
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-xs md:text-sm text-primary bg-primary/10 px-2 md:px-3 py-1 md:py-1.5 rounded-lg font-semibold whitespace-nowrap">
                📖 Preview
              </div>
              
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle lesson menu"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex relative">
        {/* Sidebar - Lesson Navigation */}
        <aside className={`
          fixed md:sticky top-0 left-0 h-full md:h-auto
          w-72 md:w-80 bg-white border-r
          md:top-[57px] md:self-start
          transition-transform duration-300 ease-in-out
          z-30 md:z-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Sidebar Header */}
          <div className="p-3 md:p-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-900 text-sm md:text-base">Course Content</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              {sortedLessons.length} lessons • {course.duration} min total
            </p>
          </div>

          {/* Lessons List */}
          <nav
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            {sortedLessons.map((lesson, index) => (
              <button
                key={lesson.id}
                onClick={() => {
                  setSelectedLessonIndex(index);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left p-3 md:p-4 border-b transition-all ${
                  selectedLessonIndex === index
                    ? "bg-gradient-to-r from-primary/10 to-accent/10 border-l-4 border-l-primary shadow-inner"
                    : "hover:bg-gray-50 border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex items-start gap-2 md:gap-3">
                  <div
                    className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all ${
                      selectedLessonIndex === index
                        ? "bg-gradient-to-br from-primary to-accent text-white shadow-md"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-xs md:text-sm line-clamp-2 ${
                        selectedLessonIndex === index
                          ? "text-primary"
                          : "text-gray-900"
                      }`}
                    >
                      {lesson.title || `Lesson ${index + 1}`}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-1 text-[10px] md:text-xs text-gray-500">
                      <span className="flex items-center gap-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {lesson.duration}m
                      </span>
                      {lesson.videoUrl && (
                        <span className="flex items-center gap-0.5 text-purple-600">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          Video
                        </span>
                      )}
                      {lesson.quiz && (
                        <span className="flex items-center gap-0.5 text-amber-600">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          Quiz
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 bg-white min-h-screen">
          <div className="max-w-4xl mx-auto px-3 md:px-8 py-4 md:py-8">
            {/* Lesson Header */}
            <div className="mb-4 md:mb-8">
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-500 mb-2">
                <span className="font-medium">Lesson {selectedLessonIndex + 1}</span>
                <span>•</span>
                <span>{currentLesson.duration} minutes</span>
                {currentLesson.videoUrl && (
                  <>
                    <span>•</span>
                    <span className="text-purple-600 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      Video
                    </span>
                  </>
                )}
                {currentLesson.quiz && (
                  <>
                    <span>•</span>
                    <span className="text-amber-600 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      Quiz
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-xl md:text-3xl font-bold text-gray-900 leading-tight">
                {currentLesson.title || `Lesson ${selectedLessonIndex + 1}`}
              </h2>
            </div>

            {/* Video */}
            {currentLesson.videoUrl && (
              <div className="mb-6 md:mb-8">
                <div className="aspect-video bg-gray-900 rounded-lg md:rounded-xl overflow-hidden shadow-lg">
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
            <div className="mb-6 md:mb-8">
              <div className="prose prose-sm md:prose-lg max-w-none">
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
              <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t-2 border-gray-200">
                <div className="mb-4 md:mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 md:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">
                        {currentLesson.quiz.title || "Lesson Quiz"}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-700">
                        Test your understanding with{" "}
                        <span className="font-semibold">{currentLesson.quiz.questions.length}</span> question
                        {currentLesson.quiz.questions.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  {currentLesson.quiz.questions.map((question, qIndex) => (
                    <div
                      key={question.id}
                      className="bg-gray-50 rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">
                        <span className="inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-200 text-gray-700 text-xs md:text-sm font-bold mr-2">
                          {qIndex + 1}
                        </span>
                        {question.text}
                      </h4>

                      <div className="space-y-2 md:space-y-3">
                        {question.options.map((option, oIndex) => {
                          const isCorrect = option === question.answer;
                          const optionLabel = String.fromCharCode(65 + oIndex); // A, B, C, D

                          return (
                            <div
                              key={oIndex}
                              className={`flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-lg border-2 transition-all ${
                                isCorrect
                                  ? "bg-green-50 border-green-500 shadow-sm"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              <div
                                className={`flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${
                                  isCorrect
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {optionLabel}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-xs md:text-base ${
                                    isCorrect
                                      ? "text-green-900 font-medium"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {option}
                                </p>
                              </div>
                              {isCorrect && (
                                <span className="flex-shrink-0 text-green-600 font-bold text-[10px] md:text-sm flex items-center gap-1">
                                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="hidden md:inline">Correct</span>
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
            <div className="flex items-center justify-between gap-3 mt-6 md:mt-12 pt-6 md:pt-8 border-t-2 border-gray-200">
              <button
                onClick={() =>
                  selectedLessonIndex > 0 &&
                  setSelectedLessonIndex(selectedLessonIndex - 1)
                }
                disabled={selectedLessonIndex === 0}
                className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all text-xs md:text-sm"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              <div className="text-xs md:text-sm text-gray-600 font-medium">
                <span className="font-bold text-primary">{selectedLessonIndex + 1}</span>
                <span className="mx-1">/</span>
                <span>{sortedLessons.length}</span>
              </div>
              
              <button
                onClick={() =>
                  selectedLessonIndex < sortedLessons.length - 1 &&
                  setSelectedLessonIndex(selectedLessonIndex + 1)
                }
                disabled={selectedLessonIndex === sortedLessons.length - 1}
                className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all text-xs md:text-sm"
              >
                <span className="hidden sm:inline">Next</span>
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
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
