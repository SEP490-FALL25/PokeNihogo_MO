import { axiosPrivate } from "@configs/axios";

const gachaService = {
    getGachaBannerToday: async () => {
        return axiosPrivate.get(`/gacha-banner/today/user`);
    },
}

export default gachaService;