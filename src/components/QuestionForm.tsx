// QuestionForm - controlled inputs for a quiz question

type Question = {
  id: string;
  text: string;
  options: string[];
  answer: string;
};

type Props = {
  question: Question;
  onChange: (q: Question) => void;
  onRemove?: () => void;
};

export default function QuestionForm({ question, onChange, onRemove }: Props) {
  const setText = (text: string) => onChange({ ...question, text });
  const setOption = (index: number, value: string) => {
    const options = [...question.options];
    options[index] = value;
    if (question.answer === question.options[index]) {
      // if answer was the previous value, keep it if still matches
    }
    onChange({ ...question, options });
  };
  const setAnswer = (value: string) => onChange({ ...question, answer: value });

  return (
    <div className="card mb-3">
      <div className="flex items-center justify-between mb-2">
        <label className="font-medium">Question</label>
        {onRemove && (
          <button className="btn-ghost" onClick={onRemove} type="button">
            Remove
          </button>
        )}
      </div>

      <input
        value={question.text}
        onChange={(e) => setText(e.target.value)}
        className="search-input mb-2"
        placeholder="Question text"
      />

      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              className="search-input"
              placeholder={`Option ${i + 1}`}
            />
          </div>
        ))}
      </div>

      <div className="mt-2">
        <label className="text-sm muted">Correct answer</label>
        <select
          value={question.answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="search-input mt-1"
        >
          <option value="">Select correct answer</option>
          {question.options.map((opt, i) => (
            <option key={i} value={opt}>{`Option ${i + 1}`}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
