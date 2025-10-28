import { at, byUser } from "@models/common/common.request";
import z from "zod";

/**
 * Pokemon Entity Schema
 */
export const PokemonEntitySchema = z.object({
    id: z.number(),
    pokedex_number: z.number(),
    nameJp: z.string(),
    nameTranslations: z.object({ en: z.string(), ja: z.string(), vi: z.string() }),
    description: z.string(),
    conditionLevel: z.number(),
    isStarted: z.boolean(),
    imageUrl: z.string().url(),
    rarity: z.string(),
    ...byUser,
    ...at,
});

export type PokemonEntityType = z.infer<typeof PokemonEntitySchema>;
//------------------------End------------------------//