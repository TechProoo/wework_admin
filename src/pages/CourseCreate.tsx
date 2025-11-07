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

  const handleSubmit = async (payload: any) => {
    setCreating(true);
    setError(null);

    try {
      const result = await createCourseWithLessons(payload);
      const courseId = result?.id;

      if (courseId) {
        navigate(`/courses/${courseId}`);
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
      alert(err?.message || String(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 mt-20">
        <div>
          <h2 className="text-2xl font-bold">Create Course</h2>
          <div className="muted">
            Use this form to add a new course — preview updates live.
          </div>
        </div>
      </div>

      {error && (
        <div className="card p-3 mb-4 text-sm" style={{ background: "#ffecec" }}>
          {error}
        </div>
      )}

      <div className="w-[1]">
        <div className="">
          <CourseForm
            initial={initialFromState ?? undefined}
            onSubmit={handleSubmit}
            submitLabel="Create"
            hideSubmit={true}
            onChange={(p) => setPreview(p)}
          />

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              className="btn-ghost"
              onClick={() => navigate("/courses")}
              type="button"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              className="comic-button"
              onClick={() => setPreviewOpen(true)}
              disabled={!preview || creating}
            >
              {creating ? "Creating…" : "Preview & Confirm"}
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
