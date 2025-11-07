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

  const modules = useMemo(
    () => ({
      toolbar: [
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
    }),
    []
  );

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
    <div className="lesson-editor-wrapper">
      {error && (
        <div
          style={{
            padding: "10px",
            marginBottom: "10px",
            backgroundColor: "#fee",
            color: "#c00",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}
      {mounted ? (
        <ReactQuill
          theme="snow"
          value={safeValue}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{ height: "400px", marginBottom: "50px" }}
        />
      ) : (
        <div
          style={{
            height: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginBottom: "50px",
          }}
        >
          Loading editor...
        </div>
      )}
    </div>
  );
};

export default LessonEditor;
