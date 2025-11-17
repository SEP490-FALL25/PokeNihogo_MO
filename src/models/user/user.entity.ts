import { at, byUser } from "@models/common/common.request";
import { RoleEntitySchema } from "@models/role/role.entitty";
import z from "zod";

/**
 * User Entity Schema
 */
export const UserEntity = z.object({
    id: z.number(),
    email: z.string().email(),
    name: z.string(),
    phoneNumber: z.string().nullable(),
    avatar: z.string().nullable(),
    exp: z.number(),
    eloscore: z.number(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    levelId: z.number(),
    roleId: z.number(),
    ...byUser,
    ...at,
    role: RoleEntitySchema,
    level: z.object({
        id: z.number(),
        levelNumber: z.number(),
        requiredExp: z.number(),
        levelType: z.enum(["USER", "ADMIN"]),
        nextLevelId: z.number().nullable(),
        rewardId: z.number().nullable(),
        createdById: z.number().nullable(),
        updatedById: z.number().nullable(),
        deletedById: z.number().nullable(),
        deletedAt: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
        nextLevel: z.object({
            id: z.number(),
            levelNumber: z.number(),
            requiredExp: z.number(),
            levelType: z.enum(["USER", "ADMIN"]),
            nextLevelId: z.number().nullable(),
            rewardId: z.number().nullable(),
            createdById: z.number().nullable(),
            updatedById: z.number().nullable(),
            deletedById: z.number().nullable(),
            deletedAt: z.string().nullable(),
            createdAt: z.string(),
            updatedAt: z.string(),
        }).nullable(),
    }),
    pokemonCount: z.number(),
    rankName: z.string(),
    subscription: z.object({
        canRead: z.boolean(),
        canListen: z.boolean(),
        isUltra: z.boolean(),
        ultraExpiresAt: z.string().nullable(),
    }),
});

export type IUserEntity = z.infer<typeof UserEntity>;
//---------------------End---------------------//