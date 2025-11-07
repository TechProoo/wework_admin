export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  duration: number; // in minutes
  order: number;
  isPreview: boolean;
  content: string;
  videoUrl: string;
  muxPlaybackId: string | null;
  quizId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Course {
  id: string;
  title: string;
  category: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  duration: number; // in minutes
  students: number;
  rating: number;
  price: number;
  thumbnail: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
}

export interface CoursesResponse {
  statusCode: number;
  message: string;
  data: Course[];
}
