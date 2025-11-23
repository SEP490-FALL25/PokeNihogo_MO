import { rewardEntitySchema } from "@models/reward/reward.entity";
import { z } from "zod";

/**
 * Leaderboard Entity Schema
 */
export const leaderboardEntitySchema = z.object({
    position: z.number(),
    userId: z.number(),
    name: z.string(),
    avatar: z.string().nullable(),
    finalElo: z.number(),
    finalRank: z.string(),
});

export type ILeaderboardEntity = z.infer<typeof leaderboardEntitySchema>;
//------------------------End------------------------//


/**
 * Leaderboard Season Now Entity Schema
 */
export const leaderboardSeasonNowEntitySchema = z.object({
    id: z.number(),
    startDate: z.string(),
    endDate: z.string(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    nameTranslation: z.string(),
    seasonRankRewards: z.array(z.object({
        id: z.number(),
        rankName: z.string(),
        order: z.number(),
        rewards: z.array(rewardEntitySchema),
    })),
});

export type ILeaderboardSeasonNowEntity = z.infer<typeof leaderboardSeasonNowEntitySchema>;
//------------------------End------------------------//