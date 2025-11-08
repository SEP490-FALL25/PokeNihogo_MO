import elementalService from "@services/elemental";
import { useGlobalStore } from "@stores/global/global.config";
import { useQuery } from "@tanstack/react-query";

/**
 * List elemental
 * @returns List elemental data
 */
export const useListElemental = () => {
    const language = useGlobalStore((state) => state.language);
    const { data, isLoading, isError } = useQuery({
        queryKey: ['list-elemental', language],
        queryFn: () => elementalService.getListElemental(),
    });
    return { data: data?.data.data, isLoading, isError };
};
//------------------------End------------------------//