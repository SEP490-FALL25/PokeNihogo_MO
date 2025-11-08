import battleService from "@services/battle";
import { useGlobalStore } from "@stores/global/global.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * List match round
 * @returns List match round data
 */
export const useListMatchRound = () => {
    const language = useGlobalStore((state) => state.language);
    const { data, isLoading, isError } = useQuery({
        queryKey: ['list-match-round', language],
        queryFn: () => battleService.getListMatchRound(),
    });
    return { data: data?.data.data, isLoading, isError };
};
//------------------------End------------------------//


/**
 * List user pokemon round
 * @param typeId Type ID
 * @returns List user pokemon round data
 */
export const useListUserPokemonRound = (typeId: number) => {
    const language = useGlobalStore((state) => state.language);
    const { data, isLoading, isError } = useQuery({
        queryKey: ['list-user-pokemon-round', language, typeId],
        queryFn: () => battleService.getListUserPokemonRound(typeId),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
    return { data: data?.data.data, isLoading, isError };
};
//------------------------End------------------------//


/**
 * Choose pokemon
 * @returns Choose pokemon data
 */
export const useChoosePokemon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ matchId, pokemonId }: { matchId: number, pokemonId: number }) => battleService.choosePokemon(matchId, pokemonId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['list-match-round'] });
            queryClient.invalidateQueries({ queryKey: ['list-user-pokemon-round'] });
        },
        onError: (error: any) => {
            console.error(error.response.data.message);
        },
    });
};
//------------------------End------------------------//