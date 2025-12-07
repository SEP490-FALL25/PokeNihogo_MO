import z from "zod";

/**
 * Battle User Matching History Entity Schema
 */
export const BattleUserMatchingHistoryEntitySchema = z.object({
    isWin: z.boolean(),
    leaderboardSeasonName: z.string(),
    eloGain: z.number(),
    opponent: z.object({
        id: z.number(),
        name: z.string(),
        avatar: z.string().nullable(),
    }),
    createdAt: z.string(),
    timeMatch: z.number(),
});

export type IBattleUserMatchingHistoryEntity = z.infer<typeof BattleUserMatchingHistoryEntitySchema>;
//------------------------End------------------------//