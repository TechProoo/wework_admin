import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCourse } from "../api/courses";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const c = await fetchCourse(id);
      setCourse(c);
    })();
  }, [id]);

  if (!id) return <div>Invalid id</div>;
  if (!course) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="card">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold">{course.title}</h2>
            <div className="muted">
              {course.published ? "Published" : "Draft"}
            </div>
          </div>
          <div>
            <Link to={`/courses/${id}/edit`} className="btn">
              Edit
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <p className="muted">{course.description}</p>
        </div>
      </div>
    </div>
  );
}
