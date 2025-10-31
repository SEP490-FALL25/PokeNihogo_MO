import { z } from "zod";

/**
 * Upsert User Answer Log Request Schema
 * Tạo hoặc cập nhật log câu trả lời (nếu chưa có thì tạo, có rồi thì update)
 */
export const UpsertUserAnswerLogRequestSchema = z.object({
  userExerciseAttemptId: z.number().min(1),
  questionBankId: z.number().min(1),
  answerId: z.number().min(1),
});

export type IUpsertUserAnswerLogRequest = z.infer<typeof UpsertUserAnswerLogRequestSchema>;

