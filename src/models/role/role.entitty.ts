import { at, byUser } from "@models/common/common.request";
import z from "zod";

export const RoleEntitySchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    isActive: z.boolean().optional(),
    ...at,
    ...byUser,
});

export type IRoleEntitySchema = z.infer<typeof RoleEntitySchema>;