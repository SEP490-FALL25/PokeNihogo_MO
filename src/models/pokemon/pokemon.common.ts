import { PokemonRarity } from "@constants/pokemon.enum";
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
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    types: z.array(PokemonTypeSchema),
    nextPokemons: z.array(PokemonEvolutionSchema),
    previousPokemons: z.array(PokemonEvolutionSchema),
    weaknesses: z.array(PokemonWeaknessSchema),
});

// Export types
export type ITranslation = z.infer<typeof TranslationSchema>;
export type IPokemonType = z.infer<typeof PokemonTypeSchema>;
export type IPokemonWeakness = z.infer<typeof PokemonWeaknessSchema>;
export type IPokemonEvolution = z.infer<typeof PokemonEvolutionSchema>;
export type IPokemon = z.infer<typeof PokemonSchema>;
