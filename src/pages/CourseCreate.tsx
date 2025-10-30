import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CourseForm from "./CourseForm";

export default function CourseCreate() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<any>(null);

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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Create Course</h2>
          <div className="muted">
            Use this form to add a new course — preview updates live.
          </div>
        </div>
      </div>

      <div className="create-grid">
        <div className="create-form">
          <CourseForm
            onSubmit={handleSubmit}
            submitLabel="Create"
            onChange={(p) => setPreview(p)}
          />
        </div>

        <aside className="card p-4 preview-aside">
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 86, height: 86 }}>
              {preview?.thumbnail ? (
                <img
                  src={preview.thumbnail}
                  alt="thumb"
                  style={{
                    width: 86,
                    height: 86,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <div
                  className="course-thumb"
                  style={{
                    width: 86,
                    height: 86,
                    borderRadius: 10,
                    fontSize: 26,
                  }}
                >
                  {preview?.title ? preview.title.charAt(0).toUpperCase() : "C"}
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div
                className="preview-title"
                style={{ fontWeight: 800, fontSize: 16 }}
              >
                {preview?.title || "Course title preview"}
              </div>
              <div className="muted" style={{ marginTop: 6 }}>
                {preview?.category
                  ? `${preview.category} • ${preview.level}`
                  : "Category • Level"}
              </div>
              <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                {preview?.description
                  ? preview.description.slice(0, 160)
                  : "Short description will appear here. Add an engaging summary to entice students."}
              </div>
            </div>
          </div>

          <div className="mt-4 border-b" />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <div className="muted text-sm">Lessons</div>
              <div className="font-semibold">
                {preview?.lessons?.length ?? 0}
              </div>
            </div>
            <div>
              <div className="muted text-sm">Duration</div>
              <div className="font-semibold">
                {preview?.duration ? `${preview.duration} min` : "—"}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="muted text-sm">Status</div>
            <div className="mt-2">
              <span
                className={
                  "badge " +
                  (preview?.isPublished ? "badge-success" : "badge-muted")
                }
              >
                {preview?.isPublished ? "Published" : "Draft"}
              </span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              className="comic-button"
              onClick={() => alert("Preview mode not implemented")}
            >
              Open preview
            </button>
            <button
              className="btn-ghost"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Back to form
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
