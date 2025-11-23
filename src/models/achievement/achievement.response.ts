import { BackendResponsePaginationModel } from "@models/backend/common";
import { PaginationSchema } from "@models/user-pokemon/user-pokemon.common";
import z from "zod";
import { AchievementEntitySchema, AchievementGroupEntitySchema } from "./achievement.entity";
//---------------------End---------------------//


/**
 * Achievement List Response Schema (full backend response)
 */
export const AchievementListResponseSchema = BackendResponsePaginationModel(AchievementEntitySchema);
export type IAchievementListResponse = z.infer<typeof AchievementListResponseSchema>;
//---------------------End---------------------//


/**
 * User Achievements Data Schema (results + pagination only, without response wrapper)
 */
export const UserAchievementsDataSchema = z.object({
    results: z.array(AchievementGroupEntitySchema),
    pagination: PaginationSchema,
});
export type UserAchievementsData = z.infer<typeof UserAchievementsDataSchema>;
//---------------------End---------------------//


/**
 * User Achievements Response Schema (full backend response)
 */
export const UserAchievementsResponseSchema = z.object({
    statusCode: z.number(),
    message: z.string(),
    data: UserAchievementsDataSchema,
});
export type UserAchievementsResponse = z.infer<typeof UserAchievementsResponseSchema>;
//---------------------End---------------------//