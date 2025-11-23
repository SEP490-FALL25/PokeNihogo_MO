import { axiosPrivate } from "@configs/axios";

const shopBannerService = {
    getShopBannerToday: async () => {
        return axiosPrivate.get(`/shop-banner/today/user`);
    },
}

export default shopBannerService