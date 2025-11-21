import { axiosPrivate } from "@configs/axios";
import {
  GetLessonByIdResponse,
  GetLessonsResponse,
  UpdateLessonProgressResponse,
} from "@models/lesson/lesson.response";
export const lessonService = {
  // Get all lessons for user's current level
  getAllLessons: async (): Promise<GetLessonsResponse> => {
    const response = await axiosPrivate.get(`/lessons`);
    return response.data;
  },

  // Get specific lesson by ID
  getLessonById: async (
    lessonId: string,
    lang: string
  ): Promise<GetLessonByIdResponse> => {
    const response = await axiosPrivate.get(
      `/lesson-contents/${lessonId}?lang=${lang}`
    );
    return response.data;
  },

  // Update lesson progress
  updateLessonProgress: async (
    lessonId: string,
    progress: number,
    isCompleted: boolean = false
  ): Promise<UpdateLessonProgressResponse> => {
    // Real API implementation
    const response = await axiosPrivate.put(
      `/api/v1/lessons/${lessonId}/progress`,
      {
        progress,
        isCompleted,
      }
    );

    return response.data;
  },
};
