import { z } from "zod";

export const QueryRequestSchema = z.object({
    currentPage: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(100).default(20),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
}).catchall(z.any());

export type IQueryRequest = z.infer<typeof QueryRequestSchema>;