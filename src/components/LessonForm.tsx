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

interface LessonFormProps {
  lesson: Lesson;
  onChange: (lesson: Lesson) => void;
  onRemove?: () => void;
}

export default function LessonForm({
  lesson,
  onChange,
  onRemove,
}: LessonFormProps) {
  const [local, setLocal] = useState<Lesson>(lesson);

  const updateField = <K extends keyof Lesson>(key: K, value: Lesson[K]) => {
    const updated = { ...local, [key]: value };
    setLocal(updated);
    onChange(updated);
  };

  const addEmptyQuiz = () => {
    updateField("quiz", {
      title: "",
      questions: [
        {
          id: String(Date.now()),
          text: "",
          options: ["", "", "", ""],
          answer: "",
        },
      ],
    });
  };

  return (
    <div className="card mb-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-lg">
          Lesson: {local.title || "Untitled Lesson"}
        </h3>
        {onRemove && (
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={onRemove}
          >
            Remove Lesson
          </button>
        )}
      </div>

      {/* Lesson Details */}
      <div className="grid gap-3">
        <input
          value={local.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="search-input"
          placeholder="Lesson title"
        />

        <div className="flex gap-3 flex-wrap">
          <input
            type="number"
            value={local.order}
            onChange={(e) => updateField("order", Number(e.target.value))}
            className="search-input flex-1"
            placeholder="Order"
            min={1}
          />
          <input
            type="number"
            value={local.duration}
            onChange={(e) => updateField("duration", Number(e.target.value))}
            className="search-input flex-1"
            placeholder="Duration (minutes)"
            min={1}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={local.isPreview}
              onChange={(e) => updateField("isPreview", e.target.checked)}
            />
            Preview
          </label>
        </div>

        <textarea
          value={local.content}
          onChange={(e) => updateField("content", e.target.value)}
          style={{ height: "100px", borderRadius: "10px" }}
          className="w-full border rounded px-3 py-2 resize-none"
          placeholder="Lesson content..."
        />

        <input
          value={local.videoUrl}
          onChange={(e) => updateField("videoUrl", e.target.value)}
          className="search-input"
          placeholder="Video URL"
        />

        {/* Video preview */}
        {local.videoUrl && (
          <div className="mt-2">
            <video
              src={local.videoUrl}
              controls
              style={{ width: "100%", maxHeight: 240 }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Preview of the lesson video
            </p>
          </div>
        )}

        {/* Quiz Section */}
        <div className="mt-3">
          <label className="font-medium block mb-2">Quiz (optional)</label>
          {local.quiz ? (
            <QuizForm
              quiz={local.quiz}
              onChange={(quiz) => updateField("quiz", quiz)}
              onRemove={() => updateField("quiz", null)}
            />
          ) : (
            <button className="btn-ghost" type="button" onClick={addEmptyQuiz}>
              + Add Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
