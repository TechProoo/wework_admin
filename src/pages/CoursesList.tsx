import { useEffect, useMemo, useRef, useState } from "react";
import { fetchCourses, deleteCourse } from "../api/courses";
import type { Course } from "../api/courses";
import { Link, useNavigate } from "react-router-dom";

export default function CoursesList() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Courses</h2>
          <div className="muted">
            Manage course content, tutorials and lessons
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <input
            placeholder="Search courses..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 220 }}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="form-select"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="form-select"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title</option>
          </select>

          <button onClick={() => navigate("/courses/new")} className="btn">
            New Course
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading ? (
        <div className="cards-grid">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="card p-4" style={{ minHeight: 110 }}>
              <div
                className="skeleton"
                style={{ height: 18, width: "50%", marginBottom: 8 }}
              />
              <div
                className="skeleton"
                style={{ height: 12, width: "80%", marginBottom: 10 }}
              />
              <div className="skeleton" style={{ height: 36, width: "30%" }} />
            </div>
          ))}
        </div>
      ) : courses && total === 0 ? (
        <div className="card empty-state">
          <div className="empty-bg-blob" aria-hidden />
          <div className="empty-illustration" aria-hidden>
            {/* simple inline SVG illustration with gentle float */}
            <svg
              className="float"
              width="180"
              height="120"
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
              <rect x="28" y="30" width="48" height="8" rx="4" fill="#E8E6FF" />
              <rect x="28" y="46" width="36" height="8" rx="4" fill="#E8E6FF" />
              <rect
                x="108"
                y="28"
                width="54"
                height="72"
                rx="8"
                fill="#FFF7F0"
                stroke="#FFEBE0"
              />
              <circle cx="135" cy="56" r="12" fill="#FFE3D0" />
              <path
                d="M8 96c8-6 20-10 36-10 20 0 36 6 44 10H8z"
                fill="#F0F6F2"
              />
            </svg>
          </div>

          <div className="empty-body">
            <div className="empty-title">No courses yet</div>
            <div className="empty-sub">
              Create a course to share lessons, tutorials or paid content with
              students.
            </div>

            <div className="empty-actions">
              <button
                onClick={() => navigate("/courses/new")}
                className="comic-button empty-cta-primary"
              >
                Create course
              </button>
              <button onClick={onImportClick} className="btn-ghost btn-sm">
                Import CSV
              </button>
              <Link
                to="/courses/new?template=starter"
                className="btn-ghost btn-sm"
              >
                Create sample
              </Link>
            </div>
            <input
              ref={fileInputRef}
              className="import-input"
              type="file"
              accept=".csv,text/csv"
              onChange={onImportChange}
            />

            <div className="empty-tips">
              <div className="muted">Quick tips</div>
              <div className="empty-tip-list">
                <div className="empty-tip">
                  Add a short description — helps students discover your course.
                </div>
                <div className="empty-tip">
                  Use lessons with videos to increase engagement.
                </div>
                <div className="empty-tip">
                  Publish when ready — you can always update later.
                </div>
                <div className="empty-tip">
                  Create sample quizzes to keep learners involved.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="cards-grid">
            {current.map((c) => (
              <div key={c.id} className="card course-row p-4">
                <div className="course-thumb">
                  {c.title ? c.title.charAt(0).toUpperCase() : "C"}
                </div>

                <div style={{ flex: 1 }}>
                  <div className="title" style={{ fontSize: 16 }}>
                    {c.title}
                  </div>
                  <div className="muted line-clamp-2" style={{ marginTop: 6 }}>
                    {c.description ?? "No description"}
                  </div>
                  <div className="mt-3 card-actions">
                    <Link to={`/courses/${c.id}`} className="btn-ghost btn-sm">
                      View
                    </Link>
                    <Link
                      to={`/courses/${c.id}/edit`}
                      className="btn-ghost btn-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="btn-ghost btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="course-meta">
                  <div className="muted" style={{ fontSize: 13 }}>
                    {formatDate(c.createdAt)}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span
                      className={
                        "badge " +
                        (c.published ? "badge-success" : "badge-muted")
                      }
                    >
                      {c.published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="muted">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, total)} of {total}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="form-select"
              >
                <option value={5}>5 / page</option>
                <option value={8}>8 / page</option>
                <option value={12}>12 / page</option>
              </select>

              <div className="pagination">
                <button
                  className="btn-ghost"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </button>
                <span className="muted px-2">
                  {page} / {totalPages}
                </span>
                <button
                  className="btn-ghost"
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
