import { z } from "zod";

export const QueryRequestSchema = z.object({
    currentPage: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(100).default(20),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
}).catchall(z.any());

export type IQueryRequest = z.infer<typeof QueryRequestSchema>;

/**
 * By User 
 * This is a object that contains the createdById, updatedById, and deletedById fields
 */
export const byUser = {
    createdById: z.number(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
}
//----------------------End----------------------//


/**
 * At
 * This is a object that contains the createdAt, updatedAt, and deletedAt fields
 */
export const at = {
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
    deletedAt: z.string().nullable(),
}
//----------------------End----------------------//


/**
 * Translation Input Schema
 */
export const TranslationInputSchema = z.array(
    z.object({
        key: z.string(),
        value: z.string()
    })
)
//----------------------End----------------------//

