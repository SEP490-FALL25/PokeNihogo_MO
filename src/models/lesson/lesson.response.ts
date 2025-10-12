import { Lesson, LessonCategory, LessonProgress } from './lesson.common';

export interface GetLessonsResponse {
  success: boolean;
  data: {
    categories: LessonCategory[];
    totalLessons: number;
    completedLessons: number;
    userLevel: 'N5' | 'N4' | 'N3';
  };
  message: string;
}

export interface GetLessonByIdResponse {
  success: boolean;
  data: Lesson;
  message: string;
}

export interface UpdateLessonProgressResponse {
  success: boolean;
  data: LessonProgress;
  message: string;
}

export interface GetUserProgressResponse {
  success: boolean;
  data: {
    totalProgress: number;
    levelProgress: {
      N5: number;
      N4: number;
      N3: number;
    };
    recentLessons: Lesson[];
    achievements: string[];
  };
  message: string;
}
