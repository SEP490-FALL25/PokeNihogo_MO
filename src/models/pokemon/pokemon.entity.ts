import { at, byUser } from "@models/common/common.request";
import { PokemonEvolutionSchema, PokemonTypeSchema, PokemonWeaknessSchema } from "@models/pokemon/pokemon.common";
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


/**
 * Pokemon By Id Entity Schema - Extends PokemonEntitySchema with additional attributes
 */
export const PokemonByIdEntitySchema = PokemonEntitySchema.extend({
    types: z.array(PokemonTypeSchema),
    nextPokemons: z.array(PokemonEvolutionSchema),
    previousPokemons: z.array(PokemonEvolutionSchema),
    weaknesses: z.array(PokemonWeaknessSchema),
});

export type PokemonByIdEntityType = z.infer<typeof PokemonByIdEntitySchema>; 