import { useState } from "react";
import QuestionForm from "./QuestionForm";

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

type Props = {
  quiz?: Quiz | null;
  onChange: (q: Quiz | null) => void;
  onRemove?: () => void;
};

function makeQuestion(): Question {
  return {
    id: String(Date.now()) + Math.random(),
    text: "",
    options: ["", "", "", ""],
    answer: "",
  };
}

export default function QuizForm({ quiz = null, onChange, onRemove }: Props) {
  const [local, setLocal] = useState<Quiz>(
    quiz ?? { title: "", questions: [makeQuestion()] }
  );

  const setTitle = (title: string) => {
    const next = { ...local, title };
    setLocal(next);
    onChange(next);
  };

  const setQuestion = (index: number, q: Question) => {
    const questions = [...local.questions];
    questions[index] = q;
    const next = { ...local, questions };
    setLocal(next);
    onChange(next);
  };

  const addQuestion = () => {
    const questions = [...local.questions, makeQuestion()];
    const next = { ...local, questions };
    setLocal(next);
    onChange(next);
  };

  const removeQuestion = (index: number) => {
    const questions = local.questions.filter((_, i) => i !== index);
    const next = { ...local, questions };
    setLocal(next);
    onChange(next);
  };

  return (
    <div className="card mb-3">
      <div className="flex items-center justify-between mb-2">
        <label className="font-medium">Quiz</label>
        {onRemove && (
          <button className="btn-ghost" onClick={onRemove} type="button">
            Remove Quiz
          </button>
        )}
      </div>

      <input
        value={local.title}
        onChange={(e) => setTitle(e.target.value)}
        className="search-input mb-2"
        placeholder="Quiz title"
      />

      <div className="space-y-3">
        {local.questions.map((q, i) => (
          <QuestionForm
            key={q.id}
            question={q}
            onChange={(updated) => setQuestion(i, updated)}
            onRemove={() => removeQuestion(i)}
          />
        ))}
      </div>

      <div className="mt-2">
        <button type="button" className="btn-ghost" onClick={addQuestion}>
          Add Question
        </button>
      </div>
    </div>
  );
}
