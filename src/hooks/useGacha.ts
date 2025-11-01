import gachaService from "@services/gacha";
import { useGlobalStore } from "@stores/global/global.config";
import { useQuery } from "@tanstack/react-query";
import { MOCK_GACHA_BANNERS } from "../../mock-data/gacha";

/**
 * Gacha banner today hook
 * @returns Gacha banner today data
 */
export const useGachaBannerToday = () => {
    const language = useGlobalStore((state) => state.language);
    const { data: gachaBannerToday, isLoading, isError, error } = useQuery({
        queryKey: ['gacha-banner-today', language],
        queryFn: () => gachaService.getGachaBannerToday(),
    });
    return { gachaBannerToday: gachaBannerToday?.data.data, isLoading, isError, error };
};
//--------------------------End------------------------//

/**
 * Gacha banner list hook
 * @returns List of all gacha banners
 * @note Currently using mock data - switch to API by changing queryFn
 */
export const useGachaBannerList = () => {
    const language = useGlobalStore((state) => state.language);

    // TODO: Uncomment to use real API
    // const { data: gachaBannerList, isLoading, isError, error } = useQuery({
    //     queryKey: ['gacha-banner-list', language],
    //     queryFn: () => gachaService.getGachaBannerList(),
    // });
    // return { 
    //     gachaBannerList: gachaBannerList?.data?.data || [], 
    //     isLoading, 
    //     isError, 
    //     error 
    // };

    // Temporary: Using mock data
    return {
        gachaBannerList: MOCK_GACHA_BANNERS,
        isLoading: false,
        isError: false,
        error: null
    };
};
//--------------------------End------------------------//