import { IGachaBannerSchema } from "@models/gacha/gacha.entity";
import { IGachaPurchaseRequest } from "@models/gacha/gacha.request";
import gachaService from "@services/gacha";
import { useGlobalStore } from "@stores/global/global.config";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


//--------------------------------Gacha Hook--------------------------------//
/**
 * Gacha banner today hook
 * @returns Gacha banner list data
 */
export const useGachaBannerToday = () => {
    const language = useGlobalStore((state) => state.language);
    const { data: gachaBannerToday, isLoading, isError, error } = useQuery({
        queryKey: ['gacha-banner-today', language],
        queryFn: () => gachaService.getGachaBannerToday(),
    });
    return { gachaBannerList: gachaBannerToday?.data.data as IGachaBannerSchema[] | undefined, isLoading, isError, error };
};
//--------------------------End------------------------//
//---------------------------------------------End---------------------------------------------//



//--------------------------------Gacha Purchase--------------------------------//
export const useGachaPurchase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: IGachaPurchaseRequest) => gachaService.gachaPurchase(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gacha-banner-today'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-user'] });
            queryClient.invalidateQueries({ queryKey: ['user-pokemons-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['gacha-roll-history-user'] });
        },
        onError: (error) => {
            console.error(error);
        },
    });
}
//--------------------------End------------------------//
//---------------------------------------------End---------------------------------------------//


/**
 * Get gacha purchase history hook with infinite scroll
 * @returns Infinite query for gacha history (max 50 records, sorted by createdAt DESC)
 */
export const useGetGachaPurchaseHistory = () => {
    const language = useGlobalStore((state) => state.language);
    return useInfiniteQuery({
        queryKey: ['gacha-roll-history-user', language],
        queryFn: ({ pageParam = 1 }) =>
            gachaService.getHistoryByUser({
                currentPage: pageParam as number,
                pageSize: 10,
                sort: '-createdAt',
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const pagination = (lastPage as any)?.data?.data?.pagination;
            if (!pagination) return undefined;

            // Limit to 50 records total (5 pages x 10 records)
            const totalLoaded = allPages.reduce((sum, page) => {
                const pageResults = (page as any)?.data?.data?.results || [];
                return sum + pageResults.length;
            }, 0);

            if (totalLoaded >= 50) return undefined;

            const { current, totalPage } = pagination;
            return current < totalPage ? current + 1 : undefined;
        },
    });
}
//--------------------------End------------------------//
//---------------------------------------------End---------------------------------------------//
