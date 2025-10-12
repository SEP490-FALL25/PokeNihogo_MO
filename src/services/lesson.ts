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
    try {
      if (USE_MOCK_DATA) {
        // Mock data implementation
        const filteredCategories = mockData.categories.filter(
          (category: any) => category.level === level
        ) as LessonCategory[];

        return {
          success: true,
          data: {
            categories: filteredCategories,
            totalLessons: filteredCategories.reduce(
              (total: number, category: any) => total + category.lessons.length,
              0
            ),
            completedLessons: 0,
            userLevel: level,
          },
          message: "Lessons retrieved successfully",
        };
      }

      // Real API implementation
      const response = await axiosClient.get(`/api/v1/lessons/level/${level}`);

      return response.data;
    } catch (error) {
      console.error("Error fetching lessons:", error);
      throw error;
    }
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
  getLessonById: async (lessonId: string): Promise<GetLessonByIdResponse> => {
    try {
      if (USE_MOCK_DATA) {
        // Mock data implementation
        let foundLesson: Lesson | null = null;

        for (const category of mockData.categories) {
          const lesson = category.lessons.find((l: any) => l.id === lessonId);
          if (lesson) {
            foundLesson = lesson as Lesson;
            break;
          }
        }

        if (!foundLesson) {
          throw new Error("Lesson not found");
        }

        return {
          success: true,
          data: foundLesson,
          message: "Lesson retrieved successfully",
        };
      }

      // Real API implementation
      const response = await axiosClient.get(`/api/v1/lessons/${lessonId}`);

      return response.data;
    } catch (error) {
      console.error("Error fetching lesson:", error);
      throw error;
    }
  },

  // Update lesson progress
  updateLessonProgress: async (
    lessonId: string,
    progress: number,
    isCompleted: boolean = false
  ): Promise<UpdateLessonProgressResponse> => {
    try {
      if (USE_MOCK_DATA) {
        // Mock data implementation
        return {
          success: true,
          data: {
            lessonId,
            userId: "current-user",
            isCompleted,
            progress,
            completedAt: isCompleted ? new Date().toISOString() : undefined,
            timeSpent: 0,
            score: progress,
          },
          message: "Lesson progress updated successfully",
        };
      }

      // Real API implementation
      const response = await axiosPrivate.put(
        `/api/v1/lessons/${lessonId}/progress`,
        {
          progress,
          isCompleted,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating lesson progress:", error);
      throw error;
    }
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
