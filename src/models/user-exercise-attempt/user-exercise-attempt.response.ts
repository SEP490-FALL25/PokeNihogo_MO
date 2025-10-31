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

