import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCourse } from "../api/courses";
import type { Course } from "../api/courses";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const c = await fetchCourse(id);
        if (!c) {
          setError("Course not found");
          setCourse(null);
        } else {
          setCourse(c as Course);
        }
      } catch (err: any) {
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const formatDuration = (mins?: number) => {
    if (!mins && mins !== 0) return "-";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (!id) return <div className="p-4 md:p-6">Invalid course id</div>;

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto">
      {loading ? (
        <div className="space-y-3 md:space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Card Skeleton */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-6 space-y-4">
            <div className="space-y-3">
              <div className="h-40 md:h-64 bg-gray-200 rounded-lg animate-pulse" />
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-1">
            Error Loading Course
          </h3>
          <p className="text-red-700">{error}</p>
          <Link to="/courses" className="btn mt-4 inline-block">
            Back to Courses
          </Link>
        </div>
      ) : course ? (
        <div className="space-y-3 md:space-y-6">
          {/* Breadcrumb & Actions */}
          <div className="flex flex-col gap-2 md:gap-3">
            <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-600 overflow-x-auto">
              <Link
                to="/courses"
                className="hover:text-primary transition-colors whitespace-nowrap"
              >
                Courses
              </Link>
              <svg
                className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0"
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
              <span className="text-gray-900 font-medium truncate">
                {course.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/courses/${id}/edit`}
                className="btn-ghost text-xs md:text-sm w-full sm:w-auto justify-center"
              >
                <svg
                  className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 inline-block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Course
              </Link>
            </div>
          </div>

          {/* Course Header Card */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="p-3 md:p-6 space-y-3 md:space-y-4">
              {/* Thumbnail */}
              <div className="w-full h-40 md:h-56 rounded-lg overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center group relative">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-4xl md:text-6xl font-extrabold text-white">
                    {course.title ? course.title.charAt(0).toUpperCase() : "C"}
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs font-bold shadow-lg ${
                      course.isPublished
                        ? "bg-green-500 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {course.isPublished ? "✓ Published" : "Draft"}
                  </span>
                </div>
              </div>

              {/* Course Info */}
              <div className="space-y-3 md:space-y-4">
                <div>
                  <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
                    {course.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 md:px-3 md:py-1 bg-primary/10 text-primary rounded-full font-semibold">
                      {course.category}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 md:px-3 md:py-1 bg-blue-50 text-blue-700 rounded-full font-semibold">
                      {course.level}
                    </span>
                    <span className="text-gray-500 text-xs md:text-sm">
                      • {new Date(course.createdAt || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2.5 md:p-3 border border-blue-200">
                    <div className="text-[10px] md:text-xs font-medium text-blue-600 uppercase mb-0.5 md:mb-1">
                      Duration
                    </div>
                    <div className="text-base md:text-lg font-bold text-blue-900">
                      {formatDuration(course.duration)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2.5 md:p-3 border border-purple-200">
                    <div className="text-[10px] md:text-xs font-medium text-purple-600 uppercase mb-0.5 md:mb-1">
                      Students
                    </div>
                    <div className="text-base md:text-lg font-bold text-purple-900">
                      {course.students || 0}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-2.5 md:p-3 border border-amber-200">
                    <div className="text-[10px] md:text-xs font-medium text-amber-600 uppercase mb-0.5 md:mb-1">
                      Rating
                    </div>
                    <div className="text-base md:text-lg font-bold text-amber-900">
                      {course.rating ?? 0} ★
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2.5 md:p-3 border border-green-200">
                    <div className="text-[10px] md:text-xs font-medium text-green-600 uppercase mb-0.5 md:mb-1">
                      Price
                    </div>
                    <div className="text-base md:text-lg font-bold text-green-900">
                      {course.price === 0 ? "Free" : `$${course.price}`}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {course.description && (
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-100">
                    <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2 uppercase tracking-wide">
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-xs md:text-base">
                      {course.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lessons Section */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-3 md:p-6">
            <div className="flex flex-col gap-2 mb-3 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 md:w-6 md:h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base md:text-xl font-bold text-gray-900">
                    Course Lessons
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500">
                    {course.lessons?.length ?? 0} lessons • Total:{" "}
                    {formatDuration(
                      (course.lessons || []).reduce(
                        (s, l) => s + (l.duration || 0),
                        0
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>

            {(course.lessons || []).length === 0 ? (
              <div className="text-center py-8 md:py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <svg
                  className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-2 md:mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <h4 className="text-sm md:text-base font-semibold text-gray-700 mb-1">
                  No Lessons Yet
                </h4>
                <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
                  Add lessons to this course to get started
                </p>
                <Link
                  to={`/courses/${id}/edit`}
                  className="btn inline-flex items-center text-xs md:text-sm"
                >
                  <svg
                    className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Lessons
                </Link>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {(course.lessons || [])
                  .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
                  .map((lesson: any, index: number) => (
                    <div
                      key={lesson.id}
                      className="group bg-gray-50 hover:bg-white border border-gray-200 hover:border-primary/30 rounded-lg p-3 md:p-4 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start gap-2 md:gap-4">
                        {/* Lesson Number */}
                        <div className="flex-shrink-0 w-7 h-7 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xs md:text-base shadow-sm">
                          {index + 1}
                        </div>

                        {/* Lesson Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm md:text-lg group-hover:text-primary transition-colors leading-tight">
                                {lesson.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1 md:mt-1.5">
                                <span className="inline-flex items-center px-1.5 py-0.5 md:px-2 md:py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] md:text-xs font-medium">
                                  <svg
                                    className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {formatDuration(lesson.duration)}
                                </span>
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 md:px-2 md:py-0.5 rounded text-[10px] md:text-xs font-medium ${
                                    lesson.isPreview
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-200 text-gray-700"
                                  }`}
                                >
                                  {lesson.isPreview ? "👁️ Preview" : "🔒 Full"}
                                </span>
                                {lesson.videoUrl && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 md:px-2 md:py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] md:text-xs font-medium">
                                    🎥 Video
                                  </span>
                                )}
                                {lesson.quiz && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 md:px-2 md:py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] md:text-xs font-medium">
                                    📝 Quiz
                                  </span>
                                )}
                              </div>
                            </div>

                            {lesson.videoUrl && (
                              <a
                                href={lesson.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-ghost text-[10px] md:text-sm whitespace-nowrap self-start mt-1 md:mt-0 px-2 md:px-3 py-1 md:py-1.5"
                              >
                                <svg
                                  className="w-3 h-3 md:w-4 md:h-4 mr-0.5 md:mr-1 inline-block"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Watch
                              </a>
                            )}
                          </div>

                          {lesson.content && (
                            <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mt-1.5 md:mt-2">
                              {lesson.content
                                .replace(/<[^>]*>/g, "")
                                .substring(0, 150)}
                              {lesson.content.length > 150 && "..."}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            No course data
          </h3>
          <Link to="/courses" className="btn mt-3 inline-block">
            Back to Courses
          </Link>
        </div>
      )}
    </div>
  );
}
