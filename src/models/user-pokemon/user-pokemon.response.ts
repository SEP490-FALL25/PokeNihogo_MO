import { BackendResponseModel, BackendResponsePaginationModel } from "@models/backend/common";
import { PokemonTypeSchema } from "@models/pokemon/pokemon.common";
import { UserPokemonSchema } from "@models/user-pokemon/user-pokemon.common";
import { z } from "zod";

// User Pokemon list response data schema (direct array, no pagination)
export const UserPokemonListDataSchema = z.array(UserPokemonSchema);

// User Pokemon list response schema
export const UserPokemonListResponseSchema = BackendResponseModel(UserPokemonListDataSchema);

// Export types
export type IUserPokemonListData = z.infer<typeof UserPokemonListDataSchema>;
export type IUserPokemonListResponse = z.infer<typeof UserPokemonListResponseSchema>;

/**
 * User Pokemon list response pagination schema
 */
export const UserPokemonResponseSchema = z.object({
    id: z.number(),
    pokedex_number: z.number(),
    nameJp: z.string(),
    nameTranslations: z.object({
        en: z.string(),
        ja: z.string(),
        vi: z.string(),
    }),
    description: z.string(),
    conditionLevel: z.number(),
    isStarted: z.boolean(),
    imageUrl: z.string().url(),
    rarity: z.string(),
    createdById: z.null(),
    updatedById: z.null(),
    deletedById: z.null(),
    deletedAt: z.null(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    types: z.array(PokemonTypeSchema),
    weaknesses: z.array(z.unknown()),
    userPokemon: z.boolean(),
});

export const UserPokemonResponsePaginationSchema = BackendResponsePaginationModel(UserPokemonResponseSchema).extend({
    ownershipPercentage: z.number(),
    userPokemonsCount: z.number(),
    totalPokemons: z.number(),
});
export type IUserPokemonResponse = z.infer<typeof UserPokemonResponseSchema>;
export type IUserPokemonResponsePagination = z.infer<typeof UserPokemonResponsePaginationSchema>;
//------------------------End------------------------//