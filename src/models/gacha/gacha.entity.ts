import { at, byUser, TranslationInputSchema } from "@models/common/common.request";
import { PokemonEntitySchemaWithoutUser } from "@models/pokemon/pokemon.entity";
import { z } from "zod";

//--------------------------------Gacha Item Schema--------------------------------//
/**
 * Gacha Item Schema
 */
export const GachaItemSchema = z.object({
    id: z.number(),
    bannerId: z.number(),
    pokemonId: z.number(),
    gachaItemRateId: z.number().optional(),
    ...byUser,
    ...at,
    pokemon: PokemonEntitySchemaWithoutUser,
}).passthrough();
export type IGachaItemSchema = z.infer<typeof GachaItemSchema>;
//------------------------End------------------------//
//---------------------------------------------End---------------------------------------------//

//--------------------------------Gacha Banner Schema--------------------------------//
/**
 * Gacha Banner Schema
 */
export const GachaBannerSchema = z.object({
    id: z.number(),
    nameKey: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    status: z.enum(["PREVIEW", "EXPIRED", "INACTIVE", "ACTIVE"]),
    enablePrecreate: z.boolean(),
    precreateBeforeEndDays: z.number(),
    isRandomItemAgain: z.boolean(),
    hardPity5Star: z.number(),
    costRoll: z.number(),
    amount5Star: z.number(),
    amount4Star: z.number(),
    amount3Star: z.number(),
    amount2Star: z.number(),
    amount1Star: z.number(),
    ...byUser,
    ...at,
    nameTranslation: z.string(),
    nameTranslations: TranslationInputSchema.optional(),
    pokemon: PokemonEntitySchemaWithoutUser.extend({
        starType: z.string().optional(),
    }),
});
export type IGachaBannerSchema = z.infer<typeof GachaBannerSchema>;
//------------------------End------------------------//
//---------------------------------------------End---------------------------------------------//