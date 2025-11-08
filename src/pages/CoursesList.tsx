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

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    courseId: string | null;
    courseName: string | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    courseId: null,
    courseName: null,
    isDeleting: false,
  });

  // Success/Error toast state
  const [toast, setToast] = useState<{
    isVisible: boolean;
    type: "success" | "error";
    message: string;
  }>({
    isVisible: false,
    type: "success",
    message: "",
  });

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

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast.isVisible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, isVisible: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.isVisible]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ isVisible: true, type, message });
  };

  const openDeleteModal = (
    id: string,
    name: string,
    event?: React.MouseEvent
  ) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setDeleteModal({
      isOpen: true,
      courseId: id,
      courseName: name,
      isDeleting: false,
    });
  };

  const closeDeleteModal = () => {
    if (deleteModal.isDeleting) return; // Prevent closing while deleting
    setDeleteModal({
      isOpen: false,
      courseId: null,
      courseName: null,
      isDeleting: false,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.courseId || deleteModal.isDeleting) return;

    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      await deleteCourse(deleteModal.courseId);
      setCourses(
        (c) => c?.filter((x) => x.id !== deleteModal.courseId) ?? null
      );
      closeDeleteModal();
      showToast("success", "Course deleted successfully!");
    } catch (err: any) {
      console.error("Delete error:", err);
      showToast("error", err.message || "Failed to delete course");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
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
    <div className="p-3 md:p-6 lg:p-8 md:mx-10 ">
      {/* Header Section */}
      <div className="mb-6 md:mb-8 md:mt-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <svg
                className="w-7 h-7 md:w-8 md:h-8 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
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
            className="w-full md:w-auto bg-linear-to-r from-primary to-accent text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
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
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
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
                <span className="font-semibold text-gray-900">{total}</span>{" "}
                course{total !== 1 ? "s" : ""} found
              </span>
              {debounced && (
                <span className="text-primary">
                  Searching for "{debounced}"
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <div className="font-semibold text-red-900">
              Error loading courses
            </div>
            <div className="text-sm text-red-700 mt-1">{error}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
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
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 md:w-12 md:h-12 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
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
                  className="bg-linear-to-r from-primary to-accent text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
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
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Quick Tips
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Add Description
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Helps students discover your course
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Use Videos
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Increase student engagement
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Publish Anytime
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        You can always update later
                      </div>
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
                    className="w-full h-40 md:h-48 bg-linear-to-br from-primary to-accent flex items-center justify-center text-4xl md:text-5xl font-bold text-white group-hover:scale-105 transition-transform duration-300"
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
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Published
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
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
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
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
                      className="flex-1 text-center px-3 py-2 bg-linear-to-r from-primary to-accent text-white rounded-lg hover:shadow-md transition-all font-medium text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={(e) =>
                        openDeleteModal(c.id, c.title || "Untitled Course", e)
                      }
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      aria-label="Delete course"
                      type="button"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
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
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {(page - 1) * pageSize + 1}
                </span>
                –
                <span className="font-semibold text-gray-900">
                  {Math.min(page * pageSize, total)}
                </span>{" "}
                of <span className="font-semibold text-gray-900">{total}</span>{" "}
                course{total !== 1 ? "s" : ""}
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
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
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
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
            onClick={closeDeleteModal}
          />

          {/* Modal container - centering wrapper */}
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Modal panel */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-14 sm:w-14">
                    <svg
                      className="h-7 w-7 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Delete Course
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-3">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-gray-900">
                          "{deleteModal.courseName}"
                        </span>
                        ?
                      </p>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-xs text-red-800">
                            This action cannot be undone. All course content,
                            lessons, and quizzes will be permanently deleted.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  disabled={deleteModal.isDeleting}
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-red-600 text-base font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {deleteModal.isDeleting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Delete Course
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={deleteModal.isDeleting}
                  onClick={closeDeleteModal}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border-2 border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.isVisible && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`rounded-xl shadow-2xl p-4 pr-12 max-w-md ${
              toast.type === "success"
                ? "bg-green-50 border-2 border-green-500"
                : "bg-red-50 border-2 border-red-500"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  toast.type === "success" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {toast.type === "success" ? (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h4
                  className={`font-semibold text-sm ${
                    toast.type === "success" ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {toast.type === "success" ? "Success" : "Error"}
                </h4>
                <p
                  className={`text-sm mt-1 ${
                    toast.type === "success" ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() =>
                  setToast((prev) => ({ ...prev, isVisible: false }))
                }
                className={`absolute top-2 right-2 p-1 rounded-full hover:bg-opacity-20 transition-colors ${
                  toast.type === "success"
                    ? "text-green-600 hover:bg-green-600"
                    : "text-red-600 hover:bg-red-600"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
