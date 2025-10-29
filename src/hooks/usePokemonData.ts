import { IQueryRequest } from "@models/common/common.request";
import pokemonService from "@services/pokemon";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import starters from "../../mock-data/starters.json";

// ============================================================================
// TYPES
// ============================================================================
type Starter = { id: string; name: string; type: string[]; image: string };

type SelectedPokemon = {
  id: number;
  name: string;
  nameJp: string;
  image: string;
  types: {
    name: string;
    displayName: string;
    color: string;
  }[];
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================
/**
 * Custom hook to safely parse Pokemon data from route params
 * Provides fallback mechanism and error handling
 * @param params - Route parameters from useLocalSearchParams
 * @param starterId - Fallback starter ID from store
 * @returns Parsed Pokemon data or fallback
 */
export const usePokemonData = (params: any, starterId: string) => {
  return useMemo(() => {
    // Try to get Pokemon data from route params first
    if (params.selectedPokemon && typeof params.selectedPokemon === "string") {
      try {
        const pokemonData: SelectedPokemon = JSON.parse(params.selectedPokemon);

        // Validate required fields
        if (pokemonData?.id && pokemonData?.name && pokemonData?.image) {
          return {
            id: pokemonData.id.toString(),
            name: pokemonData.name,
            nameJp: pokemonData.nameJp || pokemonData.name,
            image: pokemonData.image,
            type: pokemonData.types?.map((t) => t.displayName) || [],
          };
        }
      } catch (error) {
        console.warn("Failed to parse selectedPokemon from params:", error);
      }
    }

    // Fallback to mock data using starterId from store
    const fallbackStarter =
      starters.find((starter: Starter) => starter.id === starterId) ||
      starters[0];
    return fallbackStarter;
  }, [params.selectedPokemon, starterId]);
};

export default usePokemonData;


/**
 * List of pokemons
 * @param params 
 * @returns 
 */
export const useListPokemons = (params: IQueryRequest) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['pokemons', params],
    queryFn: () => pokemonService.getAll(params),
  });
  return { data: data?.data, isLoading, isError };
};
//------------------------End------------------------//


/**
 * Get pokemon by id
 * @param id 
 * @returns 
 */
export const usePokemonById = (id: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => pokemonService.getById(id),
  });
  return { data: data?.data.data, isLoading, isError };
};
//------------------------End------------------------//