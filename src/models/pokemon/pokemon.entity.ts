import { PokemonRarity } from "@constants/pokemon.enum";
import { at, byUser } from "@models/common/common.request";
import { PokemonEvolutionSchema, PokemonTypeSchema, PokemonWeaknessSchema, TranslationSchema } from "@models/pokemon/pokemon.common";
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


export const PokemonEntityLiteSchema = PokemonEntitySchema.omit({
    createdById: true,
    updatedById: true,
    deletedById: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    description: true,
    isStarted: true,
    conditionLevel: true,
});

export type PokemonEntityLiteType = z.infer<typeof PokemonEntityLiteSchema>;


export const PokemonEntitySchemaWithoutUser = PokemonEntitySchema.omit({
    createdById: true,
    updatedById: true,
    deletedById: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
});

export type PokemonEntitySchemaWithoutUserType = z.infer<typeof PokemonEntitySchemaWithoutUser>;
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
//------------------------End------------------------//


/**
 * Evolution Pokemon Entity Schema
 */
export const EvolutionPokemonEntitySchema: z.ZodType<any> = z.lazy(() => z.object({
    id: z.number(),
    pokedex_number: z.number(),
    nameJp: z.string(),
    nameTranslations: TranslationSchema,
    imageUrl: z.string().url(),
    rarity: z.enum([PokemonRarity.COMMON, PokemonRarity.UNCOMMON, PokemonRarity.RARE, PokemonRarity.EPIC, PokemonRarity.LEGENDARY]),
    conditionLevel: z.number(),
    isStarted: z.boolean(),
    userPokemon: z.boolean(),
    nextPokemons: z.array(EvolutionPokemonEntitySchema),
}));

export type IEvolutionPokemonEntityType = z.infer<typeof EvolutionPokemonEntitySchema>;
//------------------------End------------------------//