import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function NewCourseModal({
  initial,
  onClose,
}: {
  initial: null | Partial<{
    title: string;
    category: string;
    level: string;
    description: string;
    thumbnail: string;
    duration: number;
    price: number;
    isPublished: boolean;
  }>;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(!!initial);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [level, setLevel] = useState(initial?.level ?? "BEGINNER");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [thumbnail, setThumbnail] = useState(initial?.thumbnail ?? "");
  const [duration, setDuration] = useState<number>(initial?.duration ?? 0);
  const [price, setPrice] = useState<number>(initial?.price ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(
    initial?.isPublished ?? false
  );

  useEffect(() => {
    setOpen(!!initial);
    setTitle(initial?.title ?? "");
    setCategory(initial?.category ?? "");
    setLevel(initial?.level ?? "BEGINNER");
    setDescription(initial?.description ?? "");
    setThumbnail(initial?.thumbnail ?? "");
    setDuration(initial?.duration ?? 0);
    setPrice(initial?.price ?? 0);
    setIsPublished(initial?.isPublished ?? false);
  }, [initial]);

  if (!open) return null;

  const onCancel = () => {
    setOpen(false);
    onClose();
  };

  const onContinue = () => {
    const payload = {
      title: title.trim(),
      category: category.trim(),
      level,
      description: description.trim(),
      thumbnail: thumbnail.trim(),
      duration: Number(duration) || 0,
      price: Number(price) || 0,
      isPublished: !!isPublished,
    };
    if (!payload.title) {
      alert("Title is required");
      return;
    }
    setOpen(false);
    onClose();
    navigate("/courses/new", { state: { initial: payload } });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white/90 backdrop-blur-md border border-gray-100 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <h3 className="text-2xl font-semibold text-gray-800">
                Create a new course
              </h3>
              <p className="text-gray-500 mt-1">
                Fill in the basic details to start building your course.
              </p>
            </div>

            {/* Scrollable form content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Title
                  </label>
                  <input
                    className="input-field mt-1"
                    placeholder="e.g. Intro to Web Development"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Category
                  </label>
                  <input
                    className="input-field mt-1"
                    placeholder="e.g. Programming"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Level
                  </label>
                  <select
                    className="input-field mt-1"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    className="input-field mt-1"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600 font-medium">
                    Short description
                  </label>
                  <textarea
                    className="textarea-field mt-1 min-h-[100px]"
                    placeholder="Briefly describe what your course covers..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600 font-medium">
                    Thumbnail
                  </label>

                  <div className="mt-1 flex items-start gap-3">
                    <div>
                      <input
                        id="newcourse-thumb-file"
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
                          document
                            .getElementById("newcourse-thumb-file")
                            ?.click()
                        }
                      >
                        Upload image
                      </button>
                    </div>

                    <div style={{ flex: 1 }}>
                      <input
                        className="input-field"
                        placeholder="Or paste image URL"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                      />

                      {thumbnail ? (
                        <div style={{ marginTop: 8 }}>
                          <img
                            src={thumbnail}
                            alt="thumbnail preview"
                            style={{
                              maxWidth: 180,
                              maxHeight: 120,
                              borderRadius: 8,
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    className="input-field mt-1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Start published</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white/90 backdrop-blur-md z-10">
              <button
                className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-800 transition-colors"
                onClick={onCancel}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-linear-to-r from-primary to-accent text-white font-medium shadow-sm hover:shadow-md transition-all"
                onClick={onContinue}
                type="button"
              >
                Continue to Editor →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
