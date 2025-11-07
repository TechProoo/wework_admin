import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CourseForm from "./CourseForm";
import PreviewConfirmModal from "../components/PreviewConfirmModal";

export default function CourseCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialFromState = (location.state as any)?.initial ?? null;

  const [preview, setPreview] = useState<any>(initialFromState ?? null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSubmit = async (payload: any, token?: string) => {
    const base = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: token.startsWith("Bearer")
                ? token
                : `Bearer ${token}`,
            }
          : {}),
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Create failed: ${res.status} ${text}`);
    }
    const body = await res.json();
    const id = body?.data?.id ?? body?.id ?? null;
    if (id) {
      navigate(`/courses/${id}`);
    }
    return body;
  };

  useEffect(() => {
    // small visual hydration: if preview empty, set defaults
    if (!preview) return;
  }, [preview]);

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
            >
              Cancel
            </button>
            <button
              className="comic-button"
              onClick={() => setPreviewOpen(true)}
              disabled={!preview}
            >
              Preview & Confirm
            </button>
          </div>
        </div>
      </div>
      <PreviewConfirmModal
        open={previewOpen}
        payload={preview}
        onClose={() => setPreviewOpen(false)}
        onConfirm={async () => {
          try {
            if (!preview) return;
            await handleSubmit(preview);
          } catch (err: any) {
            alert(err?.message || String(err));
          }
        }}
      />
    </div>
  );
}
