import gachaService from "@services/gacha";
import { useGlobalStore } from "@stores/global/global.config";
import { useQuery } from "@tanstack/react-query";

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