import { ExerciseAttemptStatus } from "@constants/exercise.enum";
import { QuizCompletionStatus } from "@constants/quiz.enum";
import { z } from "zod";

/**
 * Check Completion Response Schema
 */
export const CheckCompletionDataSchema = z.object({
  isCompleted: z.boolean(),
  totalQuestions: z.number(),
  answeredQuestions: z.number(),
  unansweredQuestions: z.number(),
  unansweredQuestionIds: z.array(z.number()),
  allCorrect: z.boolean(),
  status: z.nativeEnum(QuizCompletionStatus),
});

export const CheckCompletionResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: CheckCompletionDataSchema.optional(),
});

export type ICheckCompletionResponse = z.infer<typeof CheckCompletionResponseSchema>;
export type ICheckCompletionData = z.infer<typeof CheckCompletionDataSchema>;

/**
 * Submit Completion Response Schema
 */
export const SubmitCompletionDataSchema = z.object({
  isCompleted: z.boolean(),
  totalQuestions: z.number(),
  answeredQuestions: z.number(),
  unansweredQuestions: z.number(),
  allCorrect: z.boolean(),
  status: z.nativeEnum(QuizCompletionStatus),
  score: z.number().optional(),
});

export const SubmitCompletionResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: SubmitCompletionDataSchema.optional(),
});

export type ISubmitCompletionResponse = z.infer<typeof SubmitCompletionResponseSchema>;
export type ISubmitCompletionData = z.infer<typeof SubmitCompletionDataSchema>;

/**
 * Review Result Response Schema
 */
export const ReviewResultAnswerSchema = z.object({
  id: z.number(),
  answer: z.string(),
  type: z.enum(["correct_answer", "user_selected_incorrect"]).optional(),
  explantion: z.string().optional(), // Note: API has typo "explantion" instead of "explanation"
});

export const ReviewResultQuestionBankSchema = z.object({
  id: z.number(),
  question: z.string(),
  isCorrect: z.boolean(),
  answers: z.array(ReviewResultAnswerSchema),
});

export const ReviewResultTestSetQuestionBankSchema = z.object({
  id: z.number(),
  questionOrder: z.number(),
  questionBank: ReviewResultQuestionBankSchema,
});

export const ReviewResultTestSetSchema = z.object({
  id: z.number(),
  testSetQuestionBanks: z.array(ReviewResultTestSetQuestionBankSchema),
});

export const ReviewResultDataSchema = z.object({
  id: z.number(),
  exerciseType: z.string(),
  isBlocked: z.boolean(),
  testSetId: z.number(),
  testSet: ReviewResultTestSetSchema,
  totalQuestions: z.number(),
  answeredCorrect: z.number(),
  answeredInCorrect: z.number(),
  time: z.number(),
  status: z.nativeEnum(ExerciseAttemptStatus),
});

export const ReviewResultResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: ReviewResultDataSchema.optional(),
});

export type IReviewResultResponse = z.infer<typeof ReviewResultResponseSchema>;
export type IReviewResultData = z.infer<typeof ReviewResultDataSchema>;
export type IReviewResultAnswer = z.infer<typeof ReviewResultAnswerSchema>;
export type IReviewResultQuestionBank = z.infer<typeof ReviewResultQuestionBankSchema>;

/**
 * Exercise History Response Schema
 */
export const ExerciseHistoryItemSchema = z.object({
  id: z.number(),
  exerciseAttemptId: z.number(),
  exerciseName: z.string(),
  exerciseType: z.string(), // skill type: reading, listening, speaking, etc.
  levelJlpt: z.number(), // 5, 4, 3 for N5, N4, N3
  totalQuestions: z.number(),
  answeredCorrect: z.number(),
  answeredInCorrect: z.number(),
  score: z.number(), // percentage score
  time: z.number(), // time spent in seconds
  status: z.nativeEnum(ExerciseAttemptStatus),
  completedAt: z.string(),
  lesson: z.object({
    id: z.number(),
    titleJp: z.string(),
    levelJlpt: z.number(),
  }).optional(),
});

export const ExerciseHistoryListResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    results: z.array(ExerciseHistoryItemSchema),
    totalCount: z.number(),
    hasMore: z.boolean().optional(),
  }).optional(),
});

export type IExerciseHistoryItem = z.infer<typeof ExerciseHistoryItemSchema>;
export type IExerciseHistoryListResponse = z.infer<typeof ExerciseHistoryListResponseSchema>;

/**
 * Lesson Exercises (including rewards) Response Schema
 */
export const ExerciseRewardSchema = z.object({
  id: z.number(),
  name: z.string(),
  rewardType: z.string(),
  rewardItem: z.number(),
  rewardTarget: z.string(),
});

export const LessonExerciseItemSchema = z.object({
  id: z.number(),
  lessonId: z.number().optional(),
  exerciseType: z.string(),
  isBlocked: z.boolean().optional(),
  testSetId: z.number().nullable().optional(),
  rewardId: z.array(z.number()).optional(),
  status: z.nativeEnum(ExerciseAttemptStatus).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  rewards: z.array(ExerciseRewardSchema).optional(),
  rewardLesson: z.array(ExerciseRewardSchema).optional(),
});

export const LessonExercisesResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.array(LessonExerciseItemSchema).optional(),
});

export type IExerciseReward = z.infer<typeof ExerciseRewardSchema>;
export type ILessonExerciseItem = z.infer<typeof LessonExerciseItemSchema>;
export type ILessonExercisesResponse = z.infer<typeof LessonExercisesResponseSchema>;

