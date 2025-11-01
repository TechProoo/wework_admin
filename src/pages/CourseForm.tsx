import { useState, useEffect } from "react";
import LessonForm from "../components/LessonForm";

type Question = { id: string; text: string; options: string[]; answer: string };
type Quiz = { title: string; questions: Question[] };
type Lesson = {
  id: string;
  title: string;
  order: number;
  duration: number;
  isPreview: boolean;
  content: string;
  videoUrl: string;
  quiz?: Quiz | null;
};

type Props = {
  initial?: any;
  onSubmit: (payload: any, token?: string) => Promise<any>;
  onChange?: (payload: any) => void;
  submitLabel?: string;
  hideSubmit?: boolean;
};

function makeLesson(): Lesson {
  return {
    id: String(Date.now()) + Math.random(),
    title: "",
    order: 1,
    duration: 0,
    isPreview: false,
    content: "",
    videoUrl: "",
    quiz: null,
  };
}

export default function CourseForm({
  initial = {},
  onSubmit,
  submitLabel = "Save",
  onChange,
  hideSubmit = false,
}: Props) {
  const [title, setTitle] = useState(initial.title ?? "");
  const [category, setCategory] = useState(initial.category ?? "");
  const [level, setLevel] = useState(initial.level ?? "BEGINNER");
  const [duration, setDuration] = useState<number>(initial.duration ?? 0);
  const [students, setStudents] = useState<number>(initial.students ?? 0);
  const [rating, setRating] = useState<number>(initial.rating ?? 0);
  const [price, setPrice] = useState<number>(initial.price ?? 0);
  const [thumbnail, setThumbnail] = useState(initial.thumbnail ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [isPublished, setIsPublished] = useState(!!initial.isPublished);

  // const [tutorialTitle, setTutorialTitle] = useState(
  //   initial.tutorial?.title ?? ""
  // );
  // const [tutorialContent, setTutorialContent] = useState(
  //   initial.tutorial?.content ?? ""
  // );
  // const [tutorialVideo, setTutorialVideo] = useState(
  //   initial.tutorial?.videoUrl ?? ""
  // );

  const [lessons, setLessons] = useState<Lesson[]>(
    initial.lessons ?? [makeLesson()]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // token removed: auth token input is no longer supported in the form

  function updateLesson(index: number, next: Lesson) {
    setLessons((s) => s.map((l, i) => (i === index ? next : l)));
  }

  function addLesson() {
    setLessons((s) => [...s, makeLesson()]);
  }

  function removeLesson(index: number) {
    setLessons((s) => s.filter((_, i) => i !== index));
  }

  function validate() {
    if (!title.trim()) return "Title is required";
    if (!category.trim()) return "Category is required";
    if (!level) return "Level is required";
    // if (!tutorialTitle.trim()) return "Tutorial title is required";
    // if (!tutorialContent.trim()) return "Tutorial content is required";
    for (const l of lessons) {
      if (!l.title.trim()) return "All lessons must have a title";
    }
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const payload = {
      title,
      category,
      level,
      duration,
      students,
      rating,
      price,
      thumbnail,
      description,
      isPublished,
      // tutorial: {
      //   title: tutorialTitle,
      //   content: tutorialContent,
      //   videoUrl: tutorialVideo,
      // },
      lessons: lessons.map((l) => ({
        title: l.title,
        order: l.order,
        duration: l.duration,
        isPreview: l.isPreview,
        content: l.content,
        videoUrl: l.videoUrl,
        quiz: l.quiz ?? undefined,
      })),
    };

    setLoading(true);
    try {
      await onSubmit(payload);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // emit current payload for live preview
  const buildPayload = () => ({
    title,
    category,
    level,
    duration,
    students,
    rating,
    price,
    thumbnail,
    description,
    isPublished,
    // tutorial: {
    //   title: tutorialTitle,
    //   content: tutorialContent,
    //   videoUrl: tutorialVideo,
    // },
    lessons: lessons.map((l) => ({
      title: l.title,
      duration: l.duration,
      isPreview: l.isPreview,
    })),
  });

  // call onChange when form fields change
  useEffect(() => {
    try {
      onChange?.(buildPayload());
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    category,
    level,
    duration,
    students,
    rating,
    price,
    thumbnail,
    description,
    isPublished,
    // tutorialTitle,
    // tutorialContent,
    // tutorialVideo,
    lessons,
  ]);

  return (
    <form onSubmit={submit} className="card form-panel">
      {error && (
        <div className="card p-3 text-sm" style={{ background: "#ffecec" }}>
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="form-label">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="form-label">Category *</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="form-label">Level *</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="input-field"
          >
            <option value="BEGINNER">BEGINNER</option>
            <option value="INTERMEDIATE">INTERMEDIATE</option>
            <option value="ADVANCED">ADVANCED</option>
          </select>
        </div>

        <div>
          <label className="form-label">Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="input-field"
          />
        </div>

        <div>
          <label className="form-label">Students</label>
          <input
            type="number"
            value={students}
            onChange={(e) => setStudents(Number(e.target.value))}
            className="input-field"
          />
        </div>

        <div>
          <label className="form-label">Rating</label>
          <input
            type="number"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="input-field"
          />
        </div>

        <div>
          <label className="form-label">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="input-field"
          />
        </div>

        <div>
          <label className="form-label">Thumbnail</label>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div>
              <input
                id="course-thumb-file"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setThumbnail(String(reader.result ?? ""));
                  };
                  reader.readAsDataURL(f);
                  e.currentTarget.value = "";
                }}
              />

              <button
                type="button"
                className="btn-ghost"
                onClick={() =>
                  document.getElementById("course-thumb-file")?.click()
                }
              >
                Upload image
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <input
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="input-field"
                placeholder="Or paste image URL"
              />

              {thumbnail ? (
                <div style={{ marginTop: 8 }}>
                  <img
                    src={thumbnail}
                    alt="thumbnail preview"
                    style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8 }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="form-label">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea-field"
        />
      </div>

      {/* <div className="form-section">
        <h4 className="font-semibold mb-2">Tutorial</h4>
        <input
          value={tutorialTitle}
          onChange={(e) => setTutorialTitle(e.target.value)}
          className="input-field mb-2"
          placeholder="Tutorial title"
        />
        <textarea
          value={tutorialContent}
          onChange={(e) => setTutorialContent(e.target.value)}
          className="textarea-field mb-2"
          placeholder="Tutorial content"
        />
        <input
          value={tutorialVideo}
          onChange={(e) => setTutorialVideo(e.target.value)}
          className="input-field"
          placeholder="Tutorial video URL"
        />
        {tutorialVideo ? (
          <div className="mt-2">
            <video
              src={tutorialVideo}
              controls
              style={{ width: "100%", maxHeight: 320 }}
            />
          </div>
        ) : null}
      </div> */}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">Lessons</h4>
          <div>
            <button type="button" className="btn-ghost" onClick={addLesson}>
              Add Lesson
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {lessons.map((l, i) => (
            <LessonForm
              key={l.id}
              lesson={l}
              onChange={(next) => updateLesson(i, next)}
              onRemove={() => removeLesson(i)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div />
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />{" "}
            Published
          </label>
        </div>
      </div>

      {!hideSubmit && (
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn">
            {loading ? "Creating..." : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}
