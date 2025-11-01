import { BackendResponseModel } from "@models/backend/common";
import { PokemonEntityLiteSchema } from "@models/pokemon/pokemon.entity";
import { z } from "zod";
import { GachaBannerSchema } from "./gacha.entity";

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