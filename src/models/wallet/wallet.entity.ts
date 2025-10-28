import { at, byUser } from "@models/common/common.request";
import z from "zod";

/**
 * Wallet Entity Schema
 */
export const WalletEntitySchema = z.object({
    id: z.number(),
    userId: z.number(),
    type: z.enum(["SPARKLES", "POKE_COINS"]),
    balance: z.number(),
    ...byUser,
    ...at
});

export type IWalletEntity = z.infer<typeof WalletEntitySchema>;
//----------------------End----------------------//