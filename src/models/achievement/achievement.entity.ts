import { PaginationSchema } from "@models/user-pokemon/user-pokemon.common";
import z from "zod";

export const RewardEntitySchema = z.object({
    id: z.number(),
    nameKey: z.string(),
    rewardType: z.string(),
    rewardItem: z.number(),
    rewardTarget: z.string(),
    createdById: z.number(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    nameTranslation: z.string(),
});

export type RewardEntity = z.infer<typeof RewardEntitySchema>;

export const UserAchievementEntitySchema = z.object({
    id: z.number(),
    userId: z.number(),
    achievementId: z.number(),
    achievedAt: z.string().nullable(),
    status: z.string(),
    deletedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type UserAchievementEntity = z.infer<typeof UserAchievementEntitySchema>;

export const AchievementEntitySchema = z.object({
    id: z.number(),
    nameKey: z.string(),
    descriptionKey: z.string(),
    conditionTextKey: z.string(),
    imageUrl: z.string().nullable(),
    isActive: z.boolean(),
    achievementTierType: z.string(),
    conditionType: z.string(),
    conditionValue: z.number(),
    conditionElementId: z.number().nullable(),
    rewardId: z.number(),
    groupId: z.number(),
    createdById: z.number(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    nameTranslation: z.string(),
    userAchievement: UserAchievementEntitySchema.nullable(),
    reward: RewardEntitySchema.nullable(),
});

export type AchievementEntity = z.infer<typeof AchievementEntitySchema>;

/**
 * Achievement List Data Schema (results + pagination only, without response wrapper)
 * Note: pagination is optional for nested achievements list
 */
export const AchievementListDataSchema = z.object({
    results: z.array(AchievementEntitySchema),
    pagination: PaginationSchema.optional(),
});
export type AchievementListData = z.infer<typeof AchievementListDataSchema>;

export const AchievementGroupEntitySchema = z.object({
    id: z.number(),
    nameKey: z.string(),
    displayOrder: z.number(),
    isActive: z.boolean(),
    createdById: z.number(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    nameTranslation: z.string(),
    achievements: AchievementListDataSchema,
});

export type AchievementGroupEntity = z.infer<typeof AchievementGroupEntitySchema>;
