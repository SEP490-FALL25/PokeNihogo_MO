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
  status: z.enum(["IN_PROGRESS", "COMPLETED", "PENDING"]),
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
  status: z.enum(["IN_PROGRESS", "COMPLETED", "PENDING", "FAIL"]),
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
  status: z.string(),
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

