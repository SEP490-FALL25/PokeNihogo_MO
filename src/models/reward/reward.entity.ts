import z from "zod";

/**
 * Reward Entity Schema
 */
export const rewardEntitySchema = z.object({
    id: z.number(),
    rewardType: z.string(),
    rewardItem: z.number(),
    rewardTarget: z.string(),
    nameTranslation: z.string().nullable(),
});

export type IRewardEntity = z.infer<typeof rewardEntitySchema>;
//------------------------End------------------------//