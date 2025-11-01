import { IQueryRequest } from "@models/common/common.request";
import { IGachaBannerSchema } from "@models/gacha/gacha.entity";
import { IGachaPurchaseRequest } from "@models/gacha/gacha.request";
import gachaService from "@services/gacha";
import { useGlobalStore } from "@stores/global/global.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


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


export const useGetGachaPurchaseHistory = (params?: IQueryRequest) => {
    const language = useGlobalStore((state) => state.language);
    return useQuery({
        queryKey: ['gacha-roll-history-user', params, language],
        queryFn: () => gachaService.getHistoryByUser(params),
    });
}
//--------------------------End------------------------//
//---------------------------------------------End---------------------------------------------//
