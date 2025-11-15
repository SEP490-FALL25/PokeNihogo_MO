import { z } from "zod";

export const createInvoiceRequest = z.object({
    subscriptionPlanId: z.number(),
    discountAmount: z.number(),
});

export type ICreateInvoiceRequest = z.infer<typeof createInvoiceRequest>;