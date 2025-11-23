import { z } from "zod";

/**
 * Upsert User Answer Log Request Schema
 * Tạo hoặc cập nhật log câu trả lời (nếu chưa có thì tạo, có rồi thì update)
 */
export const UpsertUserTestAnswerLogRequestSchema = z.object({
  userTestAttemptId: z.number().min(1),
  questionBankId: z.number().min(1),
  answerId: z.number().min(1),
});

export type IUpsertUserTestAnswerLogRequest = z.infer<typeof UpsertUserTestAnswerLogRequestSchema>;

