import { useEffect, useMemo, useRef, useState } from "react";
import { fetchCourses, deleteCourse } from "../api/courses";
import type { Course } from "../api/courses";
import { Link, useNavigate } from "react-router-dom";
import { useNewCourse } from "../contexts/NewCourseContext";

export default function CoursesList() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const newCourse = (() => {
    try {
      return useNewCourse();
    } catch {
      return null as any;
    }
  })();

  // UI state
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "title">("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCourses();
        setCourses(data ?? []);
      } catch (err: any) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    try {
      await deleteCourse(id);
      setCourses((c) => c?.filter((x) => x.id !== id) ?? null);
    } catch (err: any) {
      alert(err.message || String(err));
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onImportClick = () => fileInputRef.current?.click();
  const onImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      // placeholder: just notify user we received the file; parsing can be added later
      alert(`Imported file: ${f.name} (parsing not implemented yet)`);
    };
    reader.onerror = () => alert(`Failed to read ${f.name}`);
    reader.readAsText(f);
    // reset input so same file can be picked again
    e.currentTarget.value = "";
  };

  const filtered = useMemo(() => {
    if (!courses) return [];
    let list = courses.slice();
    if (debounced) {
      const q = debounced.toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q)
      );
    }
    if (status !== "all") {
      list = list.filter((c) =>
        status === "published" ? c.published : !c.published
      );
    }
    if (sort === "newest") {
      list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    } else if (sort === "oldest") {
      list.sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    } else if (sort === "title") {
      list.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    }
    return list;
  }, [courses, debounced, status, sort]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    // Reset to first page when filters change
    setPage(1);
  }, [debounced, status, sort, pageSize]);

  const formatDate = (d?: string) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Courses</h2>
          <div className="text-sm text-slate-500 mt-1">
            Manage course content, tutorials and lessons
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input
            placeholder="Search courses..."
            className="px-3 py-2 border rounded-md shadow-sm w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search courses"
          />

          <div className="flex gap-2 items-center">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="form-select"
              aria-label="Filter by status"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="form-select"
              aria-label="Sort courses"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title</option>
            </select>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => newCourse?.open()}
                className="bg-primary-600 text-white px-3 py-2 rounded-md shadow-sm hover:opacity-95"
              >
                New Course
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-white shadow-sm animate-pulse"
              style={{ minHeight: 120 }}
            />
          ))}
        </div>
      ) : courses && total === 0 ? (
        <div className="card p-8 rounded-xl bg-white shadow-md flex flex-col items-center text-center">
          <div className="w-40 h-28 mb-4" aria-hidden>
            {/* lightweight illustration */}
            <svg
              width="160"
              height="110"
              viewBox="0 0 180 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="6"
                y="12"
                width="92"
                height="72"
                rx="8"
                fill="#F6F6FF"
                stroke="#E9E7FF"
              />
              <rect
                x="108"
                y="28"
                width="54"
                height="72"
                rx="8"
                fill="#FFF7F0"
                stroke="#FFEBE0"
              />
            </svg>
          </div>

          <div className="text-lg font-semibold">No courses yet</div>
          <div className="text-sm text-slate-500 mt-2 max-w-xl">
            Create a course to share lessons, tutorials or paid content with
            students.
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={() => navigate("/courses/new")}
              className="bg-primary-600 text-white px-4 py-2 rounded-md"
            >
              Create course
            </button>
            <button
              onClick={onImportClick}
              className="px-3 py-2 rounded-md border"
            >
              Import CSV
            </button>
            <Link
              to="/courses/new?template=starter"
              className="px-3 py-2 rounded-md border"
            >
              Create sample
            </Link>
          </div>

          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept=".csv,text/csv"
            onChange={onImportChange}
          />

          <div className="mt-6 text-sm text-slate-500 max-w-lg">
            <div className="font-medium text-slate-600">Quick tips</div>
            <ul className="list-disc list-inside mt-2 text-left space-y-1">
              <li>
                Add a short description — helps students discover your course.
              </li>
              <li>Use lessons with videos to increase engagement.</li>
              <li>Publish when ready — you can always update later.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {current.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col"
              >
                <div
                  className="w-full h-36 bg-gray-50 flex items-center justify-center text-3xl font-bold text-white"
                  style={
                    c.thumbnail || (c as any).thumbnailUrl
                      ? {
                          backgroundImage: `url(${
                            c.thumbnail ?? (c as any).thumbnailUrl
                          })`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : { backgroundColor: "#64766a" }
                  }
                >
                  {!c.thumbnail &&
                    !(c as any).thumbnailUrl &&
                    (c.title ? c.title.charAt(0).toUpperCase() : "C")}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-base font-semibold text-slate-900 line-clamp-2">
                      {c.title}
                    </div>
                    <div className="text-sm text-slate-500">
                      {formatDate(c.createdAt)}
                    </div>
                  </div>

                  <div className="text-sm text-slate-500 mt-2 line-clamp-3">
                    {c.description ?? "No description"}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span
                        className={
                          "inline-flex items-center px-2 py-1 rounded text-xs font-medium " +
                          (c.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-700")
                        }
                      >
                        {c.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/courses/${c.id}`}
                        className="text-sm text-slate-600 hover:text-slate-900"
                      >
                        View
                      </Link>
                      <Link
                        to={`/courses/${c.id}/edit`}
                        className="text-sm text-primary-600 font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => onDelete(c.id)}
                        className="text-sm text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-slate-500">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, total)} of {total}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="form-select"
              >
                <option value={5}>5 / page</option>
                <option value={8}>8 / page</option>
                <option value={12}>12 / page</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 rounded-md border"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </button>
                <span className="text-sm text-slate-500">
                  {page} / {totalPages}
                </span>
                <button
                  className="px-3 py-1 rounded-md border"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
