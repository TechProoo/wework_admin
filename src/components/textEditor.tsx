import React, { useMemo, useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface LessonEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const LessonEditor: React.FC<LessonEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your lesson content here...",
  readOnly = false,
}) => {
  // Ensure value is always a string
  const safeValue = value || "";
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount before rendering Quill
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (content: string) => {
    try {
      onChange(content);
      setError(null);
    } catch (err) {
      console.error("Error in editor onChange:", err);
      setError("Failed to update content");
    }
  };

  // Responsive toolbar configuration
  const modules = useMemo(() => {
    const isMobile = window.innerWidth < 768;

    return {
      toolbar: isMobile
        ? [
            // Simplified toolbar for mobile
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
          ]
        : [
            // Full toolbar for desktop
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ font: [] }],
            [{ size: ["small", false, "large", "huge"] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ script: "sub" }, { script: "super" }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ align: [] }],
            ["blockquote", "code-block"],
            ["link", "image", "video"],
            ["clean"],
          ],
    };
  }, []);

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "list",
    "bullet",
    "indent",
    "align",
    "blockquote",
    "code-block",
    "code",
    "link",
    "image",
    "video",
  ];

  return (
    <div className="lesson-editor-wrapper w-full">
      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}
      {mounted ? (
        <div className="responsive-quill-wrapper">
          <ReactQuill
            theme="snow"
            value={safeValue}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            readOnly={readOnly}
            className="responsive-quill"
          />
        </div>
      ) : (
        <div className="h-[300px] md:h-[400px] flex items-center justify-center border-2 border-gray-200 rounded-lg mb-12 bg-gray-50">
          <div className="flex flex-col items-center gap-2">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-sm text-gray-600 font-medium">
              Loading editor...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonEditor;
