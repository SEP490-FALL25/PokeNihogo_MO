import { z } from "zod";

/**
 * Create Invoice Response Schema
 */
export const createInvoiceResponse = z.object({
    invoice: z.object({
        id: z.number(),
        userId: z.number(),
        subscriptionPlanId: z.number(),
        walletTransactionId: z.number().nullable(),
        subtotalAmount: z.number(),
        discountAmount: z.number(),
        totalAmount: z.number(),
        status: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable(),
    }),
    payment: z.object({
        id: z.number(),
        userId: z.number(),
        invoiceId: z.number(),
        paymentMethod: z.string(),
        amount: z.number(),
        status: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable(),
    }),
    payosData: z.object({
        orderCode: z.number(),
        checkoutUrl: z.string(),
        qrCode: z.string(),
        paymentLinkId: z.string(),
        expiredAt: z.number(),
        amount: z.number(),
    }),
});

export type ICreateInvoiceResponse = z.infer<typeof createInvoiceResponse>;
//----------------------End----------------------//