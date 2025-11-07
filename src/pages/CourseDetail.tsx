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

  const formatDate = (d?: string) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };

  const formatDuration = (mins?: number) => {
    if (!mins && mins !== 0) return "-";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (!id) return <div className="p-6">Invalid course id</div>;

  return (
    <div className="p-6">
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="h-48 bg-gray-200 rounded" />
            <div className="h-48 bg-gray-200 rounded lg:col-span-2" />
          </div>
        </div>
      ) : error ? (
        <div className="card p-6 bg-red-50 text-red-700">{error}</div>
      ) : course ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 items-start">
              <div className="w-full h-48 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl font-bold text-white bg-primary-600 w-full h-full flex items-center justify-center">
                    {course.title ? course.title.charAt(0).toUpperCase() : "C"}
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900">{course.title}</h1>
                    <div className="mt-1 text-sm text-slate-500">{course.category} • {course.level}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-slate-500 text-right">
                      <div>Created</div>
                      <div className="font-medium">{formatDate(course.createdAt)}</div>
                    </div>

                    <Link to={`/courses/${id}/edit`} className="inline-flex items-center rounded-md bg-primary-600 text-white px-3 py-2 text-sm">
                      Edit
                    </Link>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 items-center">
                  <span className={"inline-flex items-center px-2 py-1 rounded text-xs font-medium " + (course.isPublished ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700")}>
                    {course.isPublished ? "Published" : "Draft"}
                  </span>

                  <div className="text-sm text-slate-600 px-2 py-1 bg-slate-50 rounded">Duration: {formatDuration(course.duration)}</div>
                  <div className="text-sm text-slate-600 px-2 py-1 bg-slate-50 rounded">Students: {course.students}</div>
                  <div className="text-sm text-slate-600 px-2 py-1 bg-slate-50 rounded">Rating: {course.rating ?? 0}</div>
                  <div className="text-sm text-slate-600 px-2 py-1 bg-slate-50 rounded">Price: {course.price === 0 ? "Free" : `$${course.price}`}</div>
                </div>

                <div className="mt-6 text-slate-700 whitespace-pre-wrap">{course.description}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Lessons ({course.lessons?.length ?? 0})</h3>
              <div className="text-sm text-slate-500">Total: {formatDuration((course.lessons || []).reduce((s, l) => s + (l.duration || 0), 0))}</div>
            </div>

            <div className="mt-4 divide-y">
              {(course.lessons || []).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)).map((lesson: any) => (
                <div key={lesson.id} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-slate-900">{lesson.title}</div>
                    <div className="text-sm text-slate-500 mt-1">{formatDuration(lesson.duration)} • {lesson.isPreview ? "Preview" : "Full"}</div>
                    <div className="text-sm text-slate-600 mt-2 line-clamp-3 whitespace-pre-wrap">{lesson.content}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {lesson.videoUrl && (
                      <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-600">Open video</a>
                    )}
                    <div className="text-sm text-slate-500">Created: {formatDate(lesson.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6">No course data</div>
      )}
    </div>
  );
}
