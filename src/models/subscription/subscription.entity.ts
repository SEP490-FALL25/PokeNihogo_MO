import { z } from "zod";

/**
 * Subscription Marketplace Entity Schema
 */
export const SubscriptionMarketplaceEntitySchema = z.object({
    id: z.number(),
    tagName: z.string(),
    nameTranslation: z.string(),
    descriptionTranslation: z.string(),
    plans: z.array(z.object({
        id: z.number(),
        subscriptionId: z.number(),
        price: z.number(),
        type: z.string(),
        durationInDays: z.number().nullable(),
        isActive: z.boolean(),
        pendingInvoice: z.object({
            id: z.number(),
            subtotalAmount: z.number(),
            discountAmount: z.number(),
            totalAmount: z.number(),
            status: z.string(),
        }).nullable(),
    })),
    features: z.array(z.object({
        id: z.number(),
        featureId: z.number(),
        value: z.string().nullable(),
        feature: z.object({
            id: z.number(),
            featureKey: z.string(),
            nameKey: z.string(),
            nameTranslation: z.string(),
        })
    })),
    isPopular: z.boolean(),
    canBuy: z.boolean(),
});

export type ISubscriptionMarketplaceEntity = z.infer<typeof SubscriptionMarketplaceEntitySchema>;
//----------------------End----------------------//


/**
 * User Subscription Feature Item Schema
 */
export const UserSubscriptionFeatureItemSchema = z.object({
    id: z.number().optional(),
    featureId: z.number().optional(),
    value: z.string().nullable().optional(),
    featureKey: z.string().optional(),
    feature: z.object({
        id: z.number(),
        featureKey: z.string(),
        nameKey: z.string(),
        nameTranslation: z.string(),
    }).optional(),
});
//----------------------End----------------------//


/**
 * User Subscription Entity Schema
 */
export const UserSubscriptionEntitySchema = z.object({
    id: z.number(),
    userId: z.number(),
    subscriptionPlanId: z.number(),
    invoiceId: z.number(),
    startDate: z.string(),
    expiresAt: z.string(),
    status: z.string(),
    createdById: z.number().nullable(),
    deletedById: z.number().nullable(),
    updatedById: z.number().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    deletedAt: z.string().nullable(),
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
    subscriptionPlan: z.object({
        id: z.number(),
        subscriptionId: z.number(),
        isActive: z.boolean(),
        price: z.number(),
        type: z.string(),
        durationInDays: z.number().nullable(),
        createdById: z.number().nullable(),
        deletedById: z.number().nullable(),
        updatedById: z.number().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable(),
        subscription: z.object({
            id: z.number(),
            tagName: z.string(),
            nameKey: z.string(),
            descriptionKey: z.string(),
            createdById: z.number().nullable(),
            deletedById: z.number().nullable(),
            updatedById: z.number().nullable(),
            createdAt: z.string(),
            updatedAt: z.string(),
            deletedAt: z.string().nullable(),
            nameTranslation: z.string(),
            descriptionTranslation: z.string(),
        }),
    }),
});

export type IUserSubscriptionEntity = z.infer<typeof UserSubscriptionEntitySchema>;
//----------------------End----------------------//