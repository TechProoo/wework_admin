import { httpClient } from "./axiosClient";
import type { Course } from "../types/courses.types";

export type { Course };

export const getTotalCourses = async (): Promise<number> => {
  try {
    const res = await httpClient.get("/courses/count");
    const body = res.data as any;
    if (body && typeof body.data?.total === "number") return body.data.total;
    if (typeof body === "number") return body;
    return 0;
  } catch (error: unknown) {
    console.error("Failed to fetch total courses:", error);
    throw new Error("Failed to get total courses");
  }
};

export const fetchCourses = async (): Promise<Course[]> => {
  try {
    const res = await httpClient.get("/courses");
    const body = res.data as any;
    return body?.data ?? [];
  } catch (error: unknown) {
    console.error("Failed to fetch courses:", error);
    throw new Error("Failed to get courses");
  }
};

export const fetchCourse = async (id: string): Promise<Course | null> => {
  try {
    const res = await httpClient.get(`/courses/${id}`);
    const body = res.data as any;
    return body?.data ?? null;
  } catch (error: unknown) {
    console.error("Failed to fetch course:", error);
    throw new Error("Failed to get course");
  }
};

export const createCourse = async (payload: any, files?: File[]) => {
  try {
    if (files && files.length) {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f, f.name));
      Object.keys(payload || {}).forEach((k) => {
        const v = (payload as any)[k];
        fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
      });
      const res = await httpClient.post(`/courses`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return (res.data as any)?.data;
    }
    const res = await httpClient.post(`/courses`, payload);
    return (res.data as any)?.data;
  } catch (error: unknown) {
    console.error("Failed to create course:", error);
    throw new Error("Failed to create course");
  }
};

export const updateCourse = async (id: string, payload: any) => {
  try {
    const res = await httpClient.patch(`/courses/${id}`, payload);
    return (res.data as any)?.data;
  } catch (error: unknown) {
    console.error("Failed to update course:", error);
    throw new Error("Failed to update course");
  }
};

export const deleteCourse = async (id: string) => {
  try {
    const res = await httpClient.delete(`/courses/${id}`);
    return (res.data as any)?.data;
  } catch (error: unknown) {
    console.error("Failed to delete course:", error);
    throw new Error("Failed to delete course");
  }
};

export const listLessons = async (courseId: string) => {
  try {
    const res = await httpClient.get(`/courses/${courseId}/lessons`);
    return (res.data as any)?.data ?? [];
  } catch (error: unknown) {
    console.error("Failed to list lessons:", error);
    throw new Error("Failed to list lessons");
  }
};

export const createLesson = async (courseId: string, payload: any) => {
  try {
    const res = await httpClient.post(`/courses/${courseId}/lessons`, payload);
    return (res.data as any)?.data;
  } catch (error: unknown) {
    console.error("Failed to create lesson:", error);
    throw new Error("Failed to create lesson");
  }
};

export const publishCourse = async (courseId: string, isPublished: boolean) => {
  try {
    const res = await httpClient.patch(`/courses/${courseId}/publish`, {
      isPublished,
    });
    return (res.data as any)?.data;
  } catch (error: unknown) {
    console.error("Failed to publish course:", error);
    throw new Error("Failed to publish course");
  }
};

export const importCourse = async (payload: any) => {
  try {
    const res = await httpClient.post(`/courses/import`, payload);
    return (res.data as any)?.data;
  } catch (error: unknown) {
    console.error("Failed to import course:", error);
    throw new Error("Failed to import course");
  }
};
