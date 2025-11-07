import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseForm from "./CourseForm";
import { fetchCourse, updateCourseWithLessons } from "../api/courses";

type Step = {
  key: string;
  label: string;
  status: "pending" | "done" | "failed";
};

type Toast = {
  message: string;
  type?: "info" | "success" | "error";
};

export default function CourseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initial, setInitial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (
    message: string,
    type: "info" | "success" | "error" = "info"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const setStep = (key: string, status: "pending" | "done" | "failed") => {
    setSteps((s) => s.map((st) => (st.key === key ? { ...st, status } : st)));
  };

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const course = await fetchCourse(id);
        setInitial(course);
      } catch (err: any) {
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (payload: any) => {
    if (!id) throw new Error("Course ID is required");

    // Initialize progress steps
    setSteps([
      { key: "meta", label: "Saving metadata", status: "pending" },
      { key: "lessons", label: "Syncing lessons", status: "pending" },
    ]);

    showToast("Starting save…", "info");

    try {
      await updateCourseWithLessons(
        id,
        payload,
        initial,
        (step, status, message) => {
          setStep(step, status);
          if (message)
            showToast(message, status === "done" ? "success" : "info");
        }
      );

      return { success: true };
    } catch (err: any) {
      console.error("Failed to update course", err);
      showToast("Failed to update course", "error");
      throw err;
    }
  };

  const handleSuccess = () => {
    navigate(`/courses/${id}`);
  };

  if (!id) {
    return <div className="p-6">Invalid course id</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Course</h2>

      {loading ? (
        <div className="text-slate-500">Loading course…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : initial ? (
        <div>
          {/* Progress Steps */}
          {steps.length > 0 && (
            <div className="mb-4">
              <div className="flex gap-3 items-center mb-2">
                {steps.map((s) => (
                  <div key={s.key} className="text-sm">
                    <span
                      className={
                        s.status === "done"
                          ? "text-green-600"
                          : s.status === "failed"
                          ? "text-red-600"
                          : "text-slate-600"
                      }
                    >
                      {s.status === "done"
                        ? "✓"
                        : s.status === "pending"
                        ? "…"
                        : "✕"}{" "}
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toast && (
            <div
              className="fixed right-6 top-6 z-50 px-4 py-2 rounded shadow"
              style={{
                background:
                  toast.type === "error"
                    ? "#fee2e2"
                    : toast.type === "success"
                    ? "#ecfdf5"
                    : "#eef2ff",
              }}
            >
              <div
                className={
                  toast.type === "error"
                    ? "text-red-700"
                    : toast.type === "success"
                    ? "text-green-700"
                    : "text-slate-900"
                }
              >
                {toast.message}
              </div>
            </div>
          )}

          <CourseForm
            initial={initial}
            onSubmit={handleSubmit}
            onSuccess={handleSuccess}
            submitLabel="Save changes"
          />
        </div>
      ) : (
        <div>No course data</div>
      )}
    </div>
  );
}
