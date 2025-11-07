import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseForm from "./CourseForm";
import {
  fetchCourse,
  updateCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  uploadThumbnail,
} from "../api/courses";

export default function CourseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<
    { key: string; label: string; status: "pending" | "done" | "failed" }[]
  >([]);
  const [toast, setToast] = useState<{
    message: string;
    type?: "info" | "success" | "error";
  } | null>(null);

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
        const c = await fetchCourse(id);
        setInitial(c);
      } catch (err: any) {
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (!id) return <div className="p-6">Invalid course id</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Course</h2>

      {loading ? (
        <div className="text-slate-500">Loading course…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : initial ? (
        <div>
          {/* Steps & toast UI */}
          <div className="mb-4">
            {steps.length > 0 && (
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
            )}
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
          </div>

          <CourseForm
            initial={initial}
            onSubmit={async (payload) => {
              // initialize steps
              setSteps([
                { key: "meta", label: "Saving metadata", status: "pending" },
                { key: "lessons", label: "Syncing lessons", status: "pending" },
              ]);
              console.log("CourseEdit: starting orchestration for course", id);
              showToast("Starting save…", "info");

              try {
                // 1) update course metadata only (backend expects metadata-only)
                const metadata = {
                  title: payload.title,
                  category: payload.category,
                  level: payload.level,
                  duration: payload.duration,
                  students: payload.students,
                  rating: payload.rating,
                  price: payload.price,
                  thumbnail: payload.thumbnail,
                  description: payload.description,
                  isPublished: payload.isPublished,
                };
                // If thumbnail is a base64 data URL, upload it first to avoid sending large JSON
                console.log("CourseEdit: updating metadata", metadata);
                showToast("Saving metadata…", "info");
                if (
                  metadata.thumbnail &&
                  String(metadata.thumbnail).startsWith("data:")
                ) {
                  try {
                    // convert data URL to File
                    const dataUrl = String(metadata.thumbnail);
                    const arr = dataUrl.split(",");
                    const mimeMatch = arr[0].match(/:(.*?);/);
                    const mime = mimeMatch ? mimeMatch[1] : "image/png";
                    const bstr = atob(arr[1]);
                    let n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    while (n--) {
                      u8arr[n] = bstr.charCodeAt(n);
                    }
                    const file = new File([u8arr], `thumb-${Date.now()}.png`, {
                      type: mime,
                    });
                    const uploaded = await uploadThumbnail(id, file);
                    // uploaded may return the updated course object; try to read thumbnail
                    const newThumb =
                      uploaded?.thumbnail ??
                      uploaded?.data?.thumbnail ??
                      uploaded?.secure_url ??
                      uploaded;
                    if (newThumb) metadata.thumbnail = newThumb;
                  } catch (upErr: any) {
                    console.warn(
                      "Thumbnail upload failed, proceeding with original payload",
                      upErr
                    );
                  }
                }

                await updateCourse(id, metadata);
                setStep("meta", "done");
                showToast("Metadata saved", "success");

                // 2) lessons - upsert-ish: update existing, create new, delete removed
                setStep("lessons", "pending");
                showToast("Syncing lessons…", "info");
                const initialLessonMap = new Map(
                  (initial?.lessons || []).map((l: any) => [l.id, l])
                );
                const payloadLessons = payload.lessons || [];
                const payloadIds = new Set(
                  payloadLessons.map((l: any) => l.id)
                );

                // update or create lessons (and sync quizzes per-lesson)
                for (const l of payloadLessons) {
                  try {
                    console.log("CourseEdit: handling lesson payload", l);
                    const lessonPayload = {
                      title: l.title,
                      order: l.order,
                      duration: l.duration,
                      isPreview: l.isPreview,
                      content: l.content,
                      videoUrl: l.videoUrl,
                    };

                    let lessonIdToUse = l.id;
                    if (initialLessonMap.has(l.id)) {
                      // existing lesson
                      console.log(
                        "CourseEdit: updating lesson",
                        l.id,
                        lessonPayload
                      );
                      await updateLesson(l.id, lessonPayload);
                    } else {
                      // create new lesson and capture real id
                      console.log(
                        "CourseEdit: creating lesson for course",
                        id,
                        lessonPayload
                      );
                      const created = await createLesson(id, lessonPayload);
                      lessonIdToUse = created?.id ?? lessonIdToUse;
                    }

                    // sync quiz for this lesson
                    try {
                      const initialLesson = initialLessonMap.get(l.id) as any;
                      const hasInitialQuiz = !!(
                        initialLesson && initialLesson.quizId
                      );
                      if (l.quiz) {
                        console.log(
                          "CourseEdit: syncing quiz for lesson",
                          lessonIdToUse,
                          l.quiz
                        );
                        // payload contains quiz data
                        if (hasInitialQuiz) {
                          // update existing quiz attached to the lesson
                          await updateQuiz(lessonIdToUse, l.quiz);
                        } else {
                          // create quiz for the lesson
                          await createQuiz(lessonIdToUse, l.quiz);
                        }
                      } else if (hasInitialQuiz && !l.quiz) {
                        // user removed quiz from this lesson
                        console.log(
                          "CourseEdit: deleting quiz for lesson",
                          lessonIdToUse
                        );
                        await deleteQuiz(lessonIdToUse);
                      }
                    } catch (qErr: any) {
                      console.warn("Quiz sync failed for lesson", l.id, qErr);
                    }
                  } catch (lErr: any) {
                    console.warn("Lesson sync failed for", l.id, lErr);
                  }
                }

                // delete removed (and delete quiz first if present)
                for (const old of initial?.lessons || []) {
                  if (!payloadIds.has(old.id)) {
                    try {
                      // delete quiz if existed
                      if (old.quizId) {
                        try {
                          console.log(
                            "CourseEdit: deleting quiz for old lesson",
                            old.id
                          );
                          await deleteQuiz(old.id);
                        } catch (dqErr: any) {
                          console.warn(
                            "Failed to delete quiz for lesson",
                            old.id,
                            dqErr
                          );
                        }
                      }
                      await deleteLesson(old.id);
                    } catch (delErr: any) {
                      console.warn("Failed to delete lesson", old.id, delErr);
                    }
                  }
                }

                setStep("lessons", "done");
                showToast("Lessons synced", "success");

                return { success: true };
              } catch (err: any) {
                console.error("Failed to update course orchestration", err);
                setStep("meta", "failed");
                showToast("Failed to update course", "error");
                throw err;
              }
            }}
            // navigate to the updated course detail after successful save
            onSuccess={() => navigate(`/courses/${id}`)}
            submitLabel="Save changes"
          />
        </div>
      ) : (
        <div>No course data</div>
      )}
    </div>
  );
}
