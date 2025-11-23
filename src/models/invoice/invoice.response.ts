import { at } from "@models/common/common.request";
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
        ...at
    }),
    payment: z.object({
        payment: z.object({
            id: z.number(),
            userId: z.number(),
            invoiceId: z.number(),
            changeAmount: z.number().nullable(),
            expiredAt: z.string(),
            failureReason: z.string().nullable(),
            gatewayResponse: z.string().nullable(),
            paymentMethod: z.string(),
            amount: z.number(),
            status: z.string(),
            paidAt: z.string().nullable(),
            payosCheckoutUrl: z.string(),
            payosOrderId: z.string(),
            payosPaymentLinkId: z.string(),
            payosQrCode: z.string(),
            payosTransactionId: z.string().nullable(),
            processedById: z.number(),
            receivedAmount: z.number().nullable(),
            ...at
        }),
        payosData: z.object({
            amount: z.number(),
            checkoutUrl: z.string(),
            expiredAt: z.number(),
            orderCode: z.number(),
            paymentLinkId: z.string(),
            qrCode: z.string(),
        }),
    }),
})

export type ICreateInvoiceResponse = z.infer<typeof createInvoiceResponse>;
//----------------------End----------------------//