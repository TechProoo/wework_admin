import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CourseForm from "./CourseForm";
import PreviewConfirmModal from "../components/PreviewConfirmModal";
import { createCourseWithLessons } from "../api/courses";

export default function CourseCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialFromState = (location.state as any)?.initial ?? null;

  const [preview, setPreview] = useState<any>(initialFromState ?? null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (payload: any) => {
    setCreating(true);
    setError(null);

    try {
      const result = await createCourseWithLessons(payload);
      const courseId = result?.id;

      if (courseId) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate(`/courses/${courseId}`);
        }, 1500);
      } else {
        throw new Error("Course created but no ID returned");
      }

      return result;
    } catch (err: any) {
      const message = err?.message || String(err);
      setError(message);
      throw new Error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;

    try {
      await handleSubmit(preview);
      setPreviewOpen(false);
    } catch (err: any) {
      // Error is already set in handleSubmit
      console.error('Creation error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-6 lg:p-8">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-up">
          <div className="bg-green-50 border-2 border-green-500 rounded-xl shadow-2xl p-4 pr-12 max-w-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-green-900">Success!</h4>
                <p className="text-sm mt-1 text-green-700">Course created successfully. Redirecting...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  Create New Course
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Fill in the details below to create your course. Preview updates in real-time.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate("/courses")}
              className="w-full md:w-auto px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold text-sm flex items-center justify-center gap-2"
              disabled={creating}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Courses
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-red-900">Error Creating Course</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 lg:p-8">
          <CourseForm
            initial={initialFromState ?? undefined}
            onSubmit={handleSubmit}
            submitLabel="Create"
            hideSubmit={true}
            onChange={(p) => setPreview(p)}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate("/courses")}
              className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={creating}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>

            <button
              onClick={() => setPreviewOpen(true)}
              disabled={!preview || creating}
              className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Course...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview & Confirm
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <PreviewConfirmModal
        open={previewOpen}
        payload={preview}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
