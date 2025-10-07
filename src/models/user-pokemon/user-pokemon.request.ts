import { z } from "zod";

// Request schema for getting a new Pokemon
export const GetNewPokemonRequestSchema = z.object({
  pokemonId: z.number().min(1),
  nickname: z.string().optional().default(""),
});

// Export types
export type IGetNewPokemonRequest = z.infer<typeof GetNewPokemonRequestSchema>;
