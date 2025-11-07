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

export const updateLesson = async (lessonId: string, payload: any) => {
  try {
    const res = await httpClient.patch(`/courses/lessons/${lessonId}`, payload);
    return (res.data as any)?.data;
  } catch (error: unknown) {
    console.error("Failed to update lesson:", error);
    throw new Error("Failed to update lesson");
  }
};

export const deleteLesson = async (lessonId: string) => {
  try {
    const res = await httpClient.delete(`/courses/lessons/${lessonId}`);
    return (res.data as any)?.data;
  } catch (error: unknown) {
    console.error("Failed to delete lesson:", error);
    throw new Error("Failed to delete lesson");
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

export const createQuiz = async (lessonId: string, payload: any) => {
  try {
    const res = await httpClient.post(
      `/courses/lessons/${lessonId}/quiz`,
      payload
    );
    return (res.data as any)?.data;
  } catch (error: unknown) {
    console.error("Failed to create quiz:", error);
    throw new Error("Failed to create quiz");
  }
};

export const updateQuiz = async (lessonId: string, payload: any) => {
  try {
    const res = await httpClient.patch(
      `/courses/lessons/${lessonId}/quiz`,
      payload
    );
    return (res.data as any)?.data;
  } catch (error: unknown) {
    console.error("Failed to update quiz:", error);
    throw new Error("Failed to update quiz");
  }
};

export const deleteQuiz = async (lessonId: string) => {
  try {
    const res = await httpClient.delete(`/courses/lessons/${lessonId}/quiz`);
    return (res.data as any)?.data;
  } catch (error: unknown) {
    console.error("Failed to delete quiz:", error);
    throw new Error("Failed to delete quiz");
  }
};

export const uploadThumbnail = async (courseId: string, file: File) => {
  try {
    const fd = new FormData();
    fd.append("file", file, file.name);
    const res = await httpClient.post(`/courses/${courseId}/thumbnail`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return (res.data as any)?.data;
  } catch (error: unknown) {
    console.error("Failed to upload thumbnail:", error);
    throw new Error("Failed to upload thumbnail");
  }
};

/**
 * Converts a base64 data URL to a File object
 */
const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

/**
 * Orchestrates the full course update process including:
 * - Metadata update with optional thumbnail upload
 * - Lesson synchronization (create, update, delete)
 * - Quiz synchronization per lesson
 *
 * @param courseId - The ID of the course to update
 * @param payload - The complete course payload with lessons and quizzes
 * @param initial - The initial course data for comparison
 * @param onProgress - Optional callback for progress updates
 */
export const updateCourseWithLessons = async (
  courseId: string,
  payload: any,
  initial: any,
  onProgress?: (
    step: string,
    status: "pending" | "done" | "failed",
    message?: string
  ) => void
) => {
  try {
    // Step 1: Update course metadata
    onProgress?.("meta", "pending", "Saving metadata…");

    const metadata = {
      title: payload.title,
      category: payload.category,
      level: payload.level,
      duration: payload.duration,
      students: payload.students,
      rating: payload.rating,
      price: payload.price,
      thumbnail: payload.thumbnail,
      description: payload.description,
      isPublished: payload.isPublished,
    };

    // Handle thumbnail upload if it's a base64 data URL
    if (metadata.thumbnail && String(metadata.thumbnail).startsWith("data:")) {
      try {
        const file = dataUrlToFile(
          String(metadata.thumbnail),
          `thumb-${Date.now()}.png`
        );
        const uploaded = await uploadThumbnail(courseId, file);
        const newThumb =
          uploaded?.thumbnail ??
          uploaded?.data?.thumbnail ??
          uploaded?.secure_url ??
          uploaded;
        if (newThumb) metadata.thumbnail = newThumb;
      } catch (upErr: any) {
        console.warn("Thumbnail upload failed, using original URL", upErr);
      }
    }

    await updateCourse(courseId, metadata);
    onProgress?.("meta", "done", "Metadata saved");

    // Step 2: Synchronize lessons
    onProgress?.("lessons", "pending", "Syncing lessons…");

    const initialLessonMap = new Map(
      (initial?.lessons || []).map((l: any) => [l.id, l])
    );
    const payloadLessons = payload.lessons || [];
    const payloadIds = new Set(payloadLessons.map((l: any) => l.id));

    // Update or create lessons and sync their quizzes
    for (const lesson of payloadLessons) {
      const lessonPayload = {
        title: lesson.title,
        order: lesson.order,
        duration: lesson.duration,
        isPreview: lesson.isPreview,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
      };

      let lessonIdToUse = lesson.id;

      // Update existing or create new lesson
      if (initialLessonMap.has(lesson.id)) {
        await updateLesson(lesson.id, lessonPayload);
      } else {
        const created = await createLesson(courseId, lessonPayload);
        lessonIdToUse = created?.id ?? lessonIdToUse;
      }

      // Sync quiz for this lesson
      const initialLesson = initialLessonMap.get(lesson.id) as any;
      const hasInitialQuiz = !!(initialLesson && initialLesson.quizId);

      if (lesson.quiz) {
        // Create or update quiz
        if (hasInitialQuiz) {
          await updateQuiz(lessonIdToUse, lesson.quiz);
        } else {
          await createQuiz(lessonIdToUse, lesson.quiz);
        }
      } else if (hasInitialQuiz) {
        // Delete quiz if it was removed
        await deleteQuiz(lessonIdToUse);
      }
    }

    // Delete removed lessons and their quizzes
    for (const oldLesson of initial?.lessons || []) {
      if (!payloadIds.has(oldLesson.id)) {
        if (oldLesson.quizId) {
          try {
            await deleteQuiz(oldLesson.id);
          } catch (err) {
            console.warn(
              `Failed to delete quiz for lesson ${oldLesson.id}`,
              err
            );
          }
        }
        await deleteLesson(oldLesson.id);
      }
    }

    onProgress?.("lessons", "done", "Lessons synced");

    return { success: true };
  } catch (error: unknown) {
    console.error("Course update orchestration failed:", error);
    onProgress?.("meta", "failed", "Update failed");
    throw error;
  }
};

/**
 * Creates a new course with lessons and quizzes
 *
 * @param payload - The complete course payload with lessons and quizzes
 * @param onProgress - Optional callback for progress updates
 * @returns The created course with ID
 */
export const createCourseWithLessons = async (
  payload: any,
  onProgress?: (
    step: string,
    status: "pending" | "done" | "failed",
    message?: string
  ) => void
) => {
  try {
    onProgress?.("course", "pending", "Creating course…");

    // Create the course with metadata only first
    const courseData = {
      title: payload.title,
      category: payload.category,
      level: payload.level,
      duration: payload.duration,
      students: payload.students,
      rating: payload.rating,
      price: payload.price,
      thumbnail: payload.thumbnail,
      description: payload.description,
      isPublished: payload.isPublished,
    };

    const created = await createCourse(courseData);
    const courseId = created?.id;

    if (!courseId) {
      throw new Error("Failed to get course ID from creation response");
    }

    onProgress?.("course", "done", "Course created");

    // Handle thumbnail upload if it's a base64 data URL
    if (payload.thumbnail && String(payload.thumbnail).startsWith("data:")) {
      try {
        const file = dataUrlToFile(
          String(payload.thumbnail),
          `thumb-${Date.now()}.png`
        );
        const uploaded = await uploadThumbnail(courseId, file);
        const newThumb =
          uploaded?.thumbnail ??
          uploaded?.data?.thumbnail ??
          uploaded?.secure_url ??
          uploaded;
        if (newThumb) {
          await updateCourse(courseId, { thumbnail: newThumb });
        }
      } catch (upErr: any) {
        console.warn("Thumbnail upload failed, using original URL", upErr);
      }
    }

    // Create lessons if provided
    if (payload.lessons && payload.lessons.length > 0) {
      onProgress?.("lessons", "pending", "Creating lessons…");

      for (const lesson of payload.lessons) {
        const lessonPayload = {
          title: lesson.title,
          order: lesson.order,
          duration: lesson.duration,
          isPreview: lesson.isPreview,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
        };

        const createdLesson = await createLesson(courseId, lessonPayload);
        const lessonId = createdLesson?.id;

        // Create quiz for this lesson if provided
        if (lesson.quiz && lessonId) {
          await createQuiz(lessonId, lesson.quiz);
        }
      }

      onProgress?.("lessons", "done", "Lessons created");
    }

    return { ...created, id: courseId };
  } catch (error: unknown) {
    console.error("Course creation orchestration failed:", error);
    onProgress?.("course", "failed", "Creation failed");
    throw error;
  }
};
