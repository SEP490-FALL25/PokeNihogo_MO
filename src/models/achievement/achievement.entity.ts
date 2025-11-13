import z from "zod";

/**
 * Achievement Entity Schema
 */
export const AchievementEntitySchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    image: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type AchievementEntity = z.infer<typeof AchievementEntitySchema>;
//---------------------End---------------------//