import battleService from "@services/battle";
import { useGlobalStore } from "@stores/global/global.config";
import { useQuery } from "@tanstack/react-query";

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
    });
    return { data: data?.data.data, isLoading, isError };
};
//------------------------End------------------------//