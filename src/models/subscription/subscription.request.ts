import { z } from "zod";

/**
 * Subscription Package Types
 */
export enum SubscriptionPackageType {
    READING = "READING",
    LISTENING = "LISTENING",
    READING_LISTENING = "READING_LISTENING",
    ULTRA_EXPLORER = "ULTRA_EXPLORER",
}

/**
 * Create Subscription Purchase Request Schema
 */
export const createSubscriptionPurchaseRequest = z.object({
    packageType: z.nativeEnum(SubscriptionPackageType),
});

export type ISubscriptionPurchaseRequest = z.infer<typeof createSubscriptionPurchaseRequest>;
//----------------------End----------------------//

