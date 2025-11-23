import { z } from "zod";
import { rewardEntitySchema } from "./reward.entity";

/**
 * Reward History Item Schema
 */
export const RewardHistoryItemSchema = z.object({
  id: z.number(),
  userId: z.number(),
  rewardId: z.number(),
  rewardTargetSnapshot: z.string(),
  amount: z.number(),
  sourceType: z.string(),
  sourceId: z.number().nullable(),
  note: z.string().nullable(),
  meta: z.any().nullable(),
  createdAt: z.string(),
  reward: z.object({
    id: z.number(),
    nameKey: z.string(),
    rewardType: z.string(),
    rewardItem: z.number(),
    rewardTarget: z.string(),
  }),
});

/**
 * Reward History Response Schema
 */
export const RewardHistoryResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    results: z.array(RewardHistoryItemSchema),
    pagination: z.object({
      current: z.number(),
      pageSize: z.number(),
      totalPage: z.number(),
      totalItem: z.number(),
    }),
  }),
});

export type IRewardHistoryItem = z.infer<typeof RewardHistoryItemSchema>;
export type IRewardHistoryResponse = z.infer<typeof RewardHistoryResponseSchema>;

