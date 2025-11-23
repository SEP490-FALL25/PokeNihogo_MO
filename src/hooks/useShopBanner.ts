import shopBannerService from "@services/shop-banner";
import { useGlobalStore } from "@stores/global/global.config";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to get shop banner data
 * @returns Shop banner data
 */
export const useShopBanner = () => {
    const language = useGlobalStore((state) => state.language);
    const { data: shopBanner, isLoading, isError, error } = useQuery({
        queryKey: ['shop-banner', language],
        queryFn: () => shopBannerService.getShopBannerToday(),
    });

    return {
        shopBanner: shopBanner?.data.data,
        isLoading,
        isError,
        error,
    }
}
//------------------------End------------------------//