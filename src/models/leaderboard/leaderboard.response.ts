import { PaginationSchema } from "@models/pokemon/pokemon.response";
import { z } from "zod";
import { leaderboardEntitySchema } from "./leaderboard.entity";

/**
 * Leaderboard Response Schema
 */
const leaderboardResponseSchema = z.object({
    results: z.array(leaderboardEntitySchema),
    pagination: PaginationSchema,
    me: leaderboardEntitySchema.optional(),
});

export type ILeaderboardResponse = z.infer<typeof leaderboardResponseSchema>;
//------------------------End------------------------//