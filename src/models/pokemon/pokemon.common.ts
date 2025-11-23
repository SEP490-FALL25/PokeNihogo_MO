import { PokemonRarity } from "@constants/pokemon.enum";
import { at, byUser } from "@models/common/common.request";
import { z } from "zod";

// Translation schema for multi-language support
export const TranslationSchema = z.object({
    en: z.string(),
    ja: z.string(),
    vi: z.string(),
});

// Type schema for Pokemon types
export const PokemonTypeSchema = z.object({
    id: z.number(),
    type_name: z.string(),
    display_name: TranslationSchema,
    color_hex: z.string(),
});

// Weakness schema with effectiveness multiplier
export const PokemonWeaknessSchema = z.object({
    id: z.number(),
    type_name: z.string(),
    display_name: TranslationSchema,
    color_hex: z.string(),
    effectiveness_multiplier: z.number(),
});

// Next/Previous Pokemon schema (simplified version)
export const PokemonEvolutionSchema = z.object({
    id: z.number(),
    pokedex_number: z.number(),
    nameJp: z.string(),
    nameTranslations: TranslationSchema,
    imageUrl: z.string(),
    rarity: z.enum([PokemonRarity.COMMON, PokemonRarity.UNCOMMON, PokemonRarity.RARE, PokemonRarity.EPIC, PokemonRarity.LEGENDARY]),
    conditionLevel: z.number(),
    isStarted: z.boolean(),
    // Indicates whether the user owns this evolution candidate (present in some responses)
    userPokemon: z.boolean().optional(),
});

// Main Pokemon schema
export const PokemonSchema = z.object({
    id: z.number(),
    pokedex_number: z.number(),
    nameJp: z.string(),
    nameTranslations: TranslationSchema,
    description: z.string(),
    conditionLevel: z.number(),
    isStarted: z.boolean(),
    imageUrl: z.string(),
    rarity: z.enum([PokemonRarity.COMMON, PokemonRarity.UNCOMMON, PokemonRarity.RARE, PokemonRarity.EPIC, PokemonRarity.LEGENDARY]),
    ...byUser,
    ...at,
    types: z.array(PokemonTypeSchema),
    nextPokemons: z.array(PokemonEvolutionSchema),
    previousPokemons: z.array(PokemonEvolutionSchema),
    weaknesses: z.array(PokemonWeaknessSchema),
});

/**
 * Pokemon Evolution Response Schema
 */
export const PokemonResponseSchema = PokemonSchema.omit({
    description: true,
    isStarted: true,
    createdById: true,
    updatedById: true,
    deletedById: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
});
export type IPokemonResponseSchema = z.infer<typeof PokemonResponseSchema>;
//------------------------End------------------------//

// Export types
export type ITranslation = z.infer<typeof TranslationSchema>;
export type IPokemonType = z.infer<typeof PokemonTypeSchema>;
export type IPokemonWeakness = z.infer<typeof PokemonWeaknessSchema>;
export type IPokemonEvolution = z.infer<typeof PokemonEvolutionSchema>;
export type IPokemon = z.infer<typeof PokemonSchema>;
