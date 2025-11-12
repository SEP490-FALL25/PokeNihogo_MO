import z from "zod";

/**
 * Battle User Matching History Entity Schema
 */
export const BattleUserMatchingHistoryEntitySchema = z.object({

});

export type IBattleUserMatchingHistoryEntity = z.infer<typeof BattleUserMatchingHistoryEntitySchema>;
//------------------------End------------------------//