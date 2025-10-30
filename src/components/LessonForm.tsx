import { useState } from "react";
import QuizForm from "./QuizForm";

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
  isPreview: boolean;
  content: string;
  videoUrl: string;
  quiz?: Quiz | null;
};

type Props = {
  lesson: Lesson;
  onChange: (l: Lesson) => void;
  onRemove?: () => void;
};

export default function LessonForm({ lesson, onChange, onRemove }: Props) {
  const [local, setLocal] = useState<Lesson>(lesson);

  const setField = <K extends keyof Lesson>(key: K, value: Lesson[K]) => {
    const next = { ...local, [key]: value } as Lesson;
    setLocal(next);
    onChange(next);
  };

  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">Lesson: {local.title || "New"}</div>
        {onRemove && (
          <button type="button" className="btn-ghost" onClick={onRemove}>
            Remove Lesson
          </button>
        )}
      </div>

      <div className="grid" style={{ gap: 8 }}>
        <input
          value={local.title}
          onChange={(e) => setField("title", e.target.value)}
          className="search-input mb-2"
          placeholder="Lesson title"
        />
        <div className="flex gap-3">
          <input
            type="number"
            value={local.order}
            onChange={(e) => setField("order", Number(e.target.value))}
            className="search-input"
            placeholder="Order"
          />
          <input
            type="number"
            value={local.duration}
            onChange={(e) => setField("duration", Number(e.target.value))}
            className="search-input"
            placeholder="Duration (minutes)"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={local.isPreview}
              onChange={(e) => setField("isPreview", e.target.checked)}
            />{" "}
            Preview
          </label>
        </div>

        <textarea
          value={local.content}
          onChange={(e) => setField("content", e.target.value)}
          className="w-full border rounded px-3 py-2 h-24"
          placeholder="Lesson content"
        />
        <input
          value={local.videoUrl}
          onChange={(e) => setField("videoUrl", e.target.value)}
          className="search-input"
          placeholder="Video URL"
        />
        {local.videoUrl ? (
          <div className="mt-2">
            <video
              src={local.videoUrl}
              controls
              style={{ width: "100%", maxHeight: 240 }}
            />
          </div>
        ) : null}

        <div>
          <label className="font-medium">Quiz (optional)</label>
          {local.quiz ? (
            <QuizForm
              quiz={local.quiz}
              onChange={(q) => setField("quiz", q)}
              onRemove={() => setField("quiz", null)}
            />
          ) : (
            <div className="mt-2">
              <button
                className="btn-ghost"
                type="button"
                onClick={() =>
                  setField("quiz", {
                    title: "",
                    questions: [
                      {
                        id: String(Date.now()),
                        text: "",
                        options: ["", "", "", ""],
                        answer: "",
                      },
                    ],
                  })
                }
              >
                Add Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
