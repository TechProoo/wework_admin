export type Course = {
  id: string;
  title: string;
  description?: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const json = async (res: Response) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export async function fetchCourses(): Promise<Course[]> {
  const res = await fetch(`${BASE}/courses`, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to load courses: ${res.status}`);
  return (await json(res)).data ?? (await json(res));
}

export async function fetchCourse(id: string): Promise<Course> {
  const res = await fetch(`${BASE}/courses/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to load course: ${res.status}`);
  return (await json(res)).data ?? (await json(res));
}

export async function createCourse(payload: Partial<Course>) {
  const res = await fetch(`${BASE}/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Create failed: ${res.status}`);
  return (await json(res)).data ?? (await json(res));
}

export async function updateCourse(id: string, payload: Partial<Course>) {
  const res = await fetch(`${BASE}/courses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  return (await json(res)).data ?? (await json(res));
}

export async function deleteCourse(id: string) {
  const res = await fetch(`${BASE}/courses/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  return await json(res);
}
