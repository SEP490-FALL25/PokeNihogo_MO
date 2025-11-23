import { z } from "zod";

/**
 * Season Entity Schema
 */
export const SeasonEntitySchema = z.object({
    leaderboardSeason: z.object({
        id: z.number(),
        name: z.string().nullable(),
        startDate: z.string(),
        endDate: z.string(),
    }),
    rank: z.object({
        rankName: z.string(),
        eloscore: z.number(),
    }),
    totalMatches: z.number(),
    totalWins: z.number(),
    rateWin: z.number(),
    currentWinStreak: z.number(),
});

export type ISeasonEntity = z.infer<typeof SeasonEntitySchema>;
//--------------------------------End--------------------------------//