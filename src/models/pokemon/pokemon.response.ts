import { PokemonRarity } from "@constants/pokemon.enum";
import { z } from "zod";
import { BackendResponseModel } from "../backend/common";
import { PokemonSchema } from "./pokemon.common";

// Request schemas for Pokemon operations
export const GetPokemonListRequestSchema = z.object({
    page: z.number().min(1).optional().default(1),
    limit: z.number().min(1).max(100).optional().default(20),
    search: z.string().optional(),
    type: z.string().optional(),
    rarity: z.enum([PokemonRarity.COMMON, PokemonRarity.UNCOMMON, PokemonRarity.RARE, PokemonRarity.EPIC, PokemonRarity.LEGENDARY]).optional(),
});

export const GetPokemonByIdRequestSchema = z.object({
    id: z.number().min(1),
});

export const GetPokemonByPokedexNumberRequestSchema = z.object({
    pokedexNumber: z.number().min(1),
});

// Pagination schema
export const PaginationSchema = z.object({
    current: z.number(),
    pageSize: z.number(),
    totalPage: z.number(),
    totalItem: z.number(),
});

// Response schemas using BackendResponseModel
export const PokemonResponseSchema = BackendResponseModel(PokemonSchema);
export const PokemonListResponseSchema = BackendResponseModel(
    z.object({
        results: z.array(PokemonSchema),
        pagination: PaginationSchema,
    })
);

// Export types
export type IGetPokemonListRequest = z.infer<typeof GetPokemonListRequestSchema>;
export type IGetPokemonByIdRequest = z.infer<typeof GetPokemonByIdRequestSchema>;
export type IGetPokemonByPokedexNumberRequest = z.infer<typeof GetPokemonByPokedexNumberRequestSchema>;
export type IPagination = z.infer<typeof PaginationSchema>;
export type IPokemonResponse = z.infer<typeof PokemonResponseSchema>;
export type IPokemonListResponse = z.infer<typeof PokemonListResponseSchema>;