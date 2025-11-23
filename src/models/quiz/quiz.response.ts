import { z } from 'zod';
import { BackendResponseModel } from '../backend/common';
import { QuizQuestionSchema, QuizResultSchema, QuizSessionSchema, QuizStatsSchema } from './quiz.common';

// Create Quiz Session Response
export const CreateQuizSessionResponse = BackendResponseModel(
  z.object({
    session: QuizSessionSchema,
  })
);

// Get Quiz Questions Response
export const GetQuizQuestionsResponse = BackendResponseModel(
  z.object({
    questions: z.array(QuizQuestionSchema),
  })
);

// Submit Quiz Answer Response
export const SubmitQuizAnswerResponse = BackendResponseModel(
  z.object({
    isCorrect: z.boolean(),
    points: z.number(),
    explanation: z.string().optional(),
  })
);

// Complete Quiz Response
export const CompleteQuizResponse = BackendResponseModel(
  z.object({
    result: QuizResultSchema,
  })
);

// Get Quiz Review (completed session with user's answers)
export const GetQuizReviewResponse = BackendResponseModel(
  z.object({
    session: QuizSessionSchema,
  })
);

// Get Quiz Stats Response
export const GetQuizStatsResponse = BackendResponseModel(
  z.object({
    stats: QuizStatsSchema,
  })
);

// Get Quiz History Response
export const GetQuizHistoryResponse = BackendResponseModel(
  z.object({
    results: z.array(QuizResultSchema),
    totalCount: z.number(),
    hasMore: z.boolean(),
  })
);

// Export types
export type ICreateQuizSessionResponse = z.infer<typeof CreateQuizSessionResponse>;
export type IGetQuizQuestionsResponse = z.infer<typeof GetQuizQuestionsResponse>;
export type ISubmitQuizAnswerResponse = z.infer<typeof SubmitQuizAnswerResponse>;
export type ICompleteQuizResponse = z.infer<typeof CompleteQuizResponse>;
export type IGetQuizStatsResponse = z.infer<typeof GetQuizStatsResponse>;
export type IGetQuizHistoryResponse = z.infer<typeof GetQuizHistoryResponse>;
export type IGetQuizReviewResponse = z.infer<typeof GetQuizReviewResponse>;
