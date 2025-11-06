import { PokemonRarity } from "@constants/pokemon.enum";
import { at } from "@models/common/common.request";
import { LevelSchema } from "@models/user-pokemon/user-pokemon.common";
import { z } from "zod";
import { BackendResponseModel, BackendResponsePaginationModel } from "../backend/common";
import { PokemonResponseSchema } from "./pokemon.common";
import { EvolutionPokemonEntitySchema, UserPokemonRoundEntitySchema } from "./pokemon.entity";

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
export const PokemonResponseDataSchema = BackendResponseModel(PokemonResponseSchema);
export const PokemonListResponseSchema = BackendResponseModel(
    z.object({
        results: z.array(PokemonResponseSchema),
        pagination: PaginationSchema,
    })
);

/**
 * Evolution Pokemon Response Schema
 */
export const EvolutionPokemonSchema = z.object({
    id: z.number(),
    userId: z.number(),
    pokemonId: z.number(),
    levelId: z.number(),
    nickname: z.string().nullable(),
    exp: z.number(),
    isEvolved: z.boolean(),
    isMain: z.boolean(),
    ...at,
    pokemon: PokemonResponseSchema,
    nextPokemons: z.array(EvolutionPokemonEntitySchema),
    previousPokemons: z.array(EvolutionPokemonEntitySchema),
    level: LevelSchema,
});
export type IEvolutionPokemonSchema = z.infer<typeof EvolutionPokemonSchema>;
//------------------------End------------------------//


/**
 * List User Pokemon Round Response Schema
 */
export const ListUserPokemonRoundResponseSchema = BackendResponsePaginationModel(UserPokemonRoundEntitySchema);
export type IListUserPokemonRoundResponse = z.infer<typeof ListUserPokemonRoundResponseSchema>;
//------------------------End------------------------//


// Export types
export type IGetPokemonListRequest = z.infer<typeof GetPokemonListRequestSchema>;
export type IGetPokemonByIdRequest = z.infer<typeof GetPokemonByIdRequestSchema>;
export type IGetPokemonByPokedexNumberRequest = z.infer<typeof GetPokemonByPokedexNumberRequestSchema>;
export type IPagination = z.infer<typeof PaginationSchema>;
export type IPokemonResponse = z.infer<typeof PokemonResponseDataSchema>;
export type IPokemonListResponse = z.infer<typeof PokemonListResponseSchema>;