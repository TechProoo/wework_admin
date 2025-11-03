import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseForm from "./CourseForm";
// import { fetchCourse, updateCourse } from "../api/courses";

export default function CourseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const c = await fetchCourse(id);
      setInitial(c);
    })();
  }, [id]);

  if (!id) return <div>Invalid course id</div>;
  if (!initial) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Course</h2>
      <CourseForm
        initial={initial}
        onSubmit={async (payload) => {
          await updateCourse(id, payload);
          navigate(`/courses/${id}`);
        }}
        submitLabel="Save"
      />
    </div>
  );
}
