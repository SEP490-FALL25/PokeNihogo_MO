import { z } from "zod";

/**
 * Create Shop Purchase Request Schema
 */
export const createShopPurchaseRequest = z.object({
    shopItemId: z.number(),
    quantity: z.number(),
});

export type IShopPurchaseRequest = z.infer<typeof createShopPurchaseRequest>;
//----------------------End----------------------//