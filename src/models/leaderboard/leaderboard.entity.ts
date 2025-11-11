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