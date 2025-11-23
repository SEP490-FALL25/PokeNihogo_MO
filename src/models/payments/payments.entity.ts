import { at } from "@models/common/common.request";
import z from "zod";

/**
 * Recall Payments Payos Entity Schema
 */
export const RecallPaymentsPayosEntitySchema = z.object({
    payment: z.object({
        id: z.number(),
        userId: z.number(),
        invoiceId: z.number(),
        paymentMethod: z.string(),
        amount: z.number(),
        status: z.string(),
        payosOrderId: z.string(),
        payosPaymentLinkId: z.string(),
        payosTransactionId: z.string().nullable(),
        payosQrCode: z.string(),
        payosCheckoutUrl: z.string(),
        receivedAmount: z.number().nullable(),
        changeAmount: z.number().nullable(),
        gatewayResponse: z.any().nullable(),
        failureReason: z.any().nullable(),
        paidAt: z.string().nullable(),
        expiredAt: z.string(),
        processedById: z.number(),
        ...at,
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
//------------------------End------------------------//