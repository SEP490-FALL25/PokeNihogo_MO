import { axiosClient, axiosPrivate } from "@configs/axios";
import { Lesson, LessonCategory } from "@models/lesson/lesson.common";
import {
  GetLessonByIdResponse,
  GetLessonsResponse,
  GetUserProgressResponse,
  UpdateLessonProgressResponse,
} from "@models/lesson/lesson.response";
import mockData from "../../mock-data/lessons.json";

// Feature flags - simple configuration
const USE_MOCK_DATA =
  process.env.NODE_ENV === "development" || !process.env.EXPO_PUBLIC_API_URL;

export const lessonService = {
  // Get all lessons for a specific level
  getLessonsByLevel: async (
    level: "N5" | "N4" | "N3"
  ): Promise<GetLessonsResponse> => {
    // Real API implementation
    const response = await axiosClient.get(`/api/v1/lessons/level/${level}`);

    return response.data;
  },

  // Get all lessons for user's current level
  getAllLessons: async (): Promise<GetLessonsResponse> => {
    // If no level is specified, return empty categories
    return {
      success: true,
      data: {
        categories: [],
        totalLessons: 0,
        completedLessons: 0,
        userLevel: "N5",
      },
      message: "No level specified",
    };
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

  // Get user progress overview
  getUserProgress: async (): Promise<GetUserProgressResponse> => {
    try {
      if (USE_MOCK_DATA) {
        // Mock data implementation
        return {
          success: true,
          data: {
            totalProgress: 25,
            levelProgress: {
              N5: 25,
              N4: 0,
              N3: 0,
            },
            recentLessons: [],
            achievements: ["First Lesson Completed", "Vocabulary Master"],
          },
          message: "User progress retrieved successfully",
        };
      }

      // Real API implementation
      const response = await axiosPrivate.get("/api/v1/user/progress");

      return response.data;
    } catch (error) {
      console.error("Error fetching user progress:", error);
      throw error;
    }
  },
};
