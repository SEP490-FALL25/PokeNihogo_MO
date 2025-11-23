import z from "zod";

/**
 * Gacha Purchase Request Schema
 */
export const gachaPurchaseRequest = z.object({
    bannerId: z.number(),
    rollCount: z.number(),
});

export type IGachaPurchaseRequest = z.infer<typeof gachaPurchaseRequest>;
//------------------------End------------------------//