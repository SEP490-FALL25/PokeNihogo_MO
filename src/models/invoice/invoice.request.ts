import { z } from "zod";

/**
 * Create Invoice Request Schema
 */
export const createInvoiceRequest = z.object({
    subscriptionPlanId: z.number(),
    discountAmount: z.number(),
});

export type ICreateInvoiceRequest = z.infer<typeof createInvoiceRequest>;
//----------------------End----------------------//