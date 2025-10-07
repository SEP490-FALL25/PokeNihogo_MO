import { BackendResponseModel } from "@models/backend/common";
import { UserPokemonSchema } from "@models/user-pokemon/user-pokemon.common";
import { z } from "zod";

// User Pokemon list response data schema (direct array, no pagination)
export const UserPokemonListDataSchema = z.array(UserPokemonSchema);

// User Pokemon list response schema
export const UserPokemonListResponseSchema = BackendResponseModel(UserPokemonListDataSchema);

// Export types
export type IUserPokemonListData = z.infer<typeof UserPokemonListDataSchema>;
export type IUserPokemonListResponse = z.infer<typeof UserPokemonListResponseSchema>;