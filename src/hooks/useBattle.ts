import { IQueryRequest } from "@models/common/common.request";
import battleService from "@services/battle";
import { useGlobalStore } from "@stores/global/global.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * List match round
 * @param matchId Optional match ID to include in query key for cache invalidation
 * @returns List match round data
 */
export const useListMatchRound = (matchId?: string | number) => {
    const language = useGlobalStore((state) => state.language);
    const { data, isLoading, isError } = useQuery({
        queryKey: ['list-match-round', language, matchId],
        queryFn: () => battleService.getListMatchRound(),
        enabled: true, // Always enabled, matchId is just for cache key
    });
    return { data: data?.data.data, isLoading, isError };
};
//------------------------End------------------------//


/**
 * List user pokemon round
 * @param typeId Type ID
 * @param matchId Current match identifier to bust cache between matches
 * @returns List user pokemon round data
 */
export const useListUserPokemonRound = (typeId: number, matchId?: string | number) => {
    const language = useGlobalStore((state) => state.language);
    const { data, isLoading, isError } = useQuery({
        queryKey: ['list-user-pokemon-round', language, typeId, matchId ?? 'global'],
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


/**
 * Get user matching history
 * @param params Optional query parameters (currentPage, pageSize)
 * @returns User matching history data with results and pagination
 */
export const useUserMatchingHistory = (params?: IQueryRequest) => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['user-matching-history', params?.currentPage, params?.pageSize],
        queryFn: () => battleService.getUserMatchingHistory(params),
    });
    return {
        data: data?.data.data?.results || [],
        isLoading,
        isError
    };
};
//------------------------End------------------------//


/**
 * Claim reward season
 * @param userSeasonHistoryId User season history ID
 * @returns Claim reward season data
 */
export const useClaimRewardSeason = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userSeasonHistoryId: number) => battleService.claimRewardSeason(userSeasonHistoryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-stats-season'] });
        },
        onError: (error: any) => {
            console.error(error.response.data.message);
        },
    });
};
//------------------------End------------------------//


/**
 * Join new season
 * @returns Join new season mutation
 */
export const useJoinNewSeason = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => battleService.joinNewSeason(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-stats-season'] });
        },
        onError: (error: any) => {
            console.error(error.response?.data?.message || error.message);
        },
    });
};
//------------------------End------------------------//



/**
 * Match tracking
 * @param enabled Whether to enable the query
 * @param refetchInterval Interval to refetch in milliseconds (0 to disable)
 * @returns Match tracking data
 */
export const useMatchTracking = (enabled: boolean = true, refetchInterval: number = 0) => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['match-tracking'],
        queryFn: () => battleService.matchTracking(),
        enabled,
        refetchInterval: refetchInterval > 0 ? refetchInterval : false,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });
    return { data: data?.data.data, isLoading, isError, refetch };
};
//------------------------End------------------------//