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
});

export const HistoryListResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    results: z.array(HistoryItemSchema),
    allTime: z.number(),
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

