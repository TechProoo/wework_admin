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
        status === "published" ? c.isPublished : !c.isPublished
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
    <div className="p-3 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-7 h-7 md:w-8 md:h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Courses
            </h2>
            <div className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
              Manage course content, tutorials and lessons
            </div>
          </div>

          <button
            onClick={() => newCourse?.open()}
            className="w-full md:w-auto bg-gradient-to-r from-primary to-accent text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Course
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm md:text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search courses"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 md:gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="flex-1 md:flex-none px-3 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm md:text-base bg-white"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="flex-1 md:flex-none px-3 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm md:text-base bg-white"
                aria-label="Sort courses"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">By Title</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          {!loading && courses && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs md:text-sm text-gray-600">
              <span>
                <span className="font-semibold text-gray-900">{total}</span> course{total !== 1 ? 's' : ''} found
              </span>
              {debounced && (
                <span className="text-primary">Searching for "{debounced}"</span>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="font-semibold text-red-900">Error loading courses</div>
            <div className="text-sm text-red-700 mt-1">{error}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="w-full h-40 md:h-48 bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
                <div className="flex items-center justify-between mt-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : courses && total === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {debounced ? "No courses found" : "No courses yet"}
          </h3>
          <p className="text-sm md:text-base text-gray-500 max-w-md mb-6 md:mb-8">
            {debounced
              ? `No courses match "${debounced}". Try adjusting your search.`
              : "Create your first course to share lessons, tutorials or paid content with students."}
          </p>

          {!debounced && (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  onClick={() => navigate("/courses/new")}
                  className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Create Your First Course
                </button>
                <button
                  onClick={onImportClick}
                  className="px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-primary hover:text-primary transition-all font-semibold"
                >
                  Import CSV
                </button>
              </div>

              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                accept=".csv,text/csv"
                onChange={onImportChange}
              />

              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200 w-full max-w-2xl">
                <div className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Quick Tips
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Add Description</div>
                      <div className="text-xs text-gray-500 mt-1">Helps students discover your course</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Use Videos</div>
                      <div className="text-xs text-gray-500 mt-1">Increase student engagement</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Publish Anytime</div>
                      <div className="text-xs text-gray-500 mt-1">You can always update later</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          {/* Course Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {current.map((c) => (
              <div
                key={c.id}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Course Thumbnail */}
                <div className="relative overflow-hidden">
                  <div
                    className="w-full h-40 md:h-48 bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl md:text-5xl font-bold text-white group-hover:scale-105 transition-transform duration-300"
                    style={
                      c.thumbnail || (c as any).thumbnailUrl
                        ? {
                            backgroundImage: `url(${
                              c.thumbnail ?? (c as any).thumbnailUrl
                            })`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  >
                    {!c.thumbnail &&
                      !(c as any).thumbnailUrl &&
                      (c.title ? c.title.charAt(0).toUpperCase() : "C")}
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        c.isPublished
                          ? "bg-green-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      {c.isPublished ? (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Published
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Draft
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-4 md:p-5 flex-1 flex flex-col">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {c.title || "Untitled Course"}
                  </h3>

                  <p className="text-xs md:text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {c.description || "No description available"}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {formatDate(c.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/courses/${c.id}`}
                      className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                    >
                      View
                    </Link>
                    <Link
                      to={`/courses/${c.id}/edit`}
                      className="flex-1 text-center px-3 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-md transition-all font-medium text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      aria-label="Delete course"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 md:mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Results Info */}
              <div className="text-xs md:text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{(page - 1) * pageSize + 1}</span>–
                <span className="font-semibold text-gray-900">{Math.min(page * pageSize, total)}</span> of{" "}
                <span className="font-semibold text-gray-900">{total}</span> course{total !== 1 ? 's' : ''}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-3">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
                >
                  <option value={5}>5 per page</option>
                  <option value={8}>8 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={20}>20 per page</option>
                </select>

                <div className="flex items-center gap-2">
                  <button
                    className="px-3 md:px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700 transition-all font-medium text-sm flex items-center gap-1"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Prev</span>
                  </button>
                  
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-900 min-w-[4rem] text-center">
                    {page} / {totalPages}
                  </div>
                  
                  <button
                    className="px-3 md:px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700 transition-all font-medium text-sm flex items-center gap-1"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
