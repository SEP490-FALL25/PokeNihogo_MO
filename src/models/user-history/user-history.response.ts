import { ExerciseAttemptStatus } from "@constants/exercise.enum";
import { z } from "zod";

/**
 * History Item Schema (for both exercises and tests)
 */
export const HistoryItemSchema = z.object({
  attemptId: z.number(),
  testId: z.number().optional(), // For tests
  exerciseId: z.number().optional(), // For exercises
  testName: z.string().optional(), // For tests
  exerciseName: z.string().optional(), // For exercises
  status: z.nativeEnum(ExerciseAttemptStatus),
  score: z.number().nullable(),
  totalQuestions: z.number(),
  correctAnswers: z.number(),
  incorrectAnswers: z.number(),
  updatedAt: z.string(),
  testType: z.string().optional(), // For tests: LESSON_REVIEW, LESSON_TEST, etc.
});

export const HistoryListResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    results: z.array(HistoryItemSchema),
    allTime: z.number(),
    allAttempts: z.number(),
    completedAttempts: z.number(),
    failedAttempts: z.number(),
    skippedAttempts: z.number(),
    abandonedAttempts: z.number(),
    pagination: z.object({
      current: z.number(),
      pageSize: z.number(),
      totalPage: z.number(),
      totalItem: z.number(),
    }),
  }),
});

export type IHistoryItem = z.infer<typeof HistoryItemSchema>;
export type IHistoryListResponse = z.infer<typeof HistoryListResponseSchema>;

/**
 * Recent Exercise Item Schema
 */
export const RecentExerciseItemSchema = z.object({
  exerciseId: z.number(),
  exerciseName: z.string(),
  lessonId: z.number(),
  lessonTitle: z.string(),
  status: z.string(), // FAILED, SKIPPED, COMPLETED, etc.
});

export const RecentExercisesResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    results: z.array(RecentExerciseItemSchema),
    pagination: z.object({
      current: z.number(),
      pageSize: z.number(),
      totalPage: z.number(),
      totalItem: z.number(),
    }),
  }),
});

export type IRecentExerciseItem = z.infer<typeof RecentExerciseItemSchema>;
export type IRecentExercisesResponse = z.infer<typeof RecentExercisesResponseSchema>;

