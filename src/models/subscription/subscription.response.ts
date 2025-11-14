import { z } from "zod";
import { SubscriptionPackageType } from "./subscription.request";

/**
 * Subscription Package Response Schema
 */
export const SubscriptionPackageResponseSchema = z.object({
    id: z.number(),
    packageType: z.nativeEnum(SubscriptionPackageType),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    duration: z.string().nullable(), // "lifetime" or "1 month" etc.
    benefits: z.array(z.string()),
    isActive: z.boolean(),
});

export type ISubscriptionPackageResponse = z.infer<typeof SubscriptionPackageResponseSchema>;

/**
 * Subscription Purchase Response Schema
 */
export const SubscriptionPurchaseResponseSchema = z.object({
    message: z.string(),
    subscriptionId: z.number(),
    expiresAt: z.string().nullable(), // null for lifetime subscriptions
});

export type ISubscriptionPurchaseResponse = z.infer<typeof SubscriptionPurchaseResponseSchema>;
//----------------------End----------------------//

