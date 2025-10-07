import { PokemonTypeSchema, TranslationSchema } from "@models/pokemon/pokemon.common";
import { z } from "zod";

// Level schema
export const LevelSchema = z.object({
    id: z.number(),
    levelNumber: z.number(),
    requiredExp: z.number(),
    levelType: z.string(),
});

// Pagination schema
export const PaginationSchema = z.object({
    current: z.number(),
    pageSize: z.number(),
    totalPage: z.number(),
    totalItem: z.number(),
});

// Simplified Pokemon schema for user-pokemon response (without evolution data)
export const UserPokemonPokemonSchema = z.object({
    id: z.number(),
    pokedex_number: z.number(),
    nameJp: z.string(),
    nameTranslations: TranslationSchema,
    description: z.string(),
    imageUrl: z.string(),
    rarity: z.string(),
    types: z.array(PokemonTypeSchema),
});

// User schema (simplified for user-pokemon response)
export const UserSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    // Add other user fields as needed
});

// User Pokemon schema
export const UserPokemonSchema = z.object({
    id: z.number(),
    userId: z.number(),
    pokemonId: z.number(),
    levelId: z.number(),
    nickname: z.string(),
    exp: z.number(),
    isEvolved: z.boolean(),
    isMain: z.boolean(),
    deletedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    pokemon: UserPokemonPokemonSchema,
    level: LevelSchema,
    user: UserSchema,
});

// Export types
export type ILevel = z.infer<typeof LevelSchema>;
export type IPagination = z.infer<typeof PaginationSchema>;
export type IUser = z.infer<typeof UserSchema>;
export type IUserPokemonPokemon = z.infer<typeof UserPokemonPokemonSchema>;
export type IUserPokemon = z.infer<typeof UserPokemonSchema>;
