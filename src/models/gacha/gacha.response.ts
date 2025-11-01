import { BackendResponseModel, BackendResponsePaginationModel } from "@models/backend/common";
import { PokemonEntityLiteSchema } from "@models/pokemon/pokemon.entity";
import { z } from "zod";
import { GachaBannerSchema } from "./gacha.entity";
import { at } from "@models/common/common.request";

/**
 * Gacha Banner List Response Schema
 */
export const GachaBannerListResponseSchema = BackendResponseModel(z.array(GachaBannerSchema));
export type IGachaBannerListResponse = z.infer<typeof GachaBannerListResponseSchema>;
//------------------------End------------------------//


/**
 * Gacha Purchase Response Schema
 */
export const GachaPurchaseResponseSchema = BackendResponseModel(z.array(z.object({
    id: z.number(),
    name: z.string(),
    starType: z.enum(['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE']),
    isDuplicate: z.boolean(),
    pokemon: PokemonEntityLiteSchema,
    parseItem: z.object({
        sparkles: z.number()
    })
})));
export type IGachaPurchaseResponse = z.infer<typeof GachaPurchaseResponseSchema>;
//------------------------End------------------------//


/**
 * Gacha Purchase History Response Schema
 */
export const GachaPurchaseHistoryResponseSchema = BackendResponsePaginationModel(z.object({
    id: z.number(),
    purchaseId: z.number(),
    userId: z.number(),
    bannerId: z.number(),
    pokemonId: z.number(),
    rarity: z.enum(['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE']),
    pityId: z.number(),
    pityNow: z.number(),
    pityStatus: z.enum(['PENDING', 'COMPLETED', 'FAILED']),
    deletedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    pokemon: PokemonEntityLiteSchema,
    purchase: z.object({
        id: z.number(),
        rollCount: z.number(),
        totalCost: z.number()
    })
}));
export type IGachaPurchaseHistoryResponse = z.infer<typeof GachaPurchaseHistoryResponseSchema>;
//------------------------End------------------------//


/**
 * Gacha Pity Response Schema
 */
export const GachaPityResponseSchema = BackendResponseModel(z.object({
    id: z.number(),
    userId: z.number(),
    pityCount: z.number(),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED']),
    ...at
}));
export type IGachaPityResponse = z.infer<typeof GachaPityResponseSchema>;
//------------------------End------------------------//