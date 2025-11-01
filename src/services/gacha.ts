import { axiosPrivate } from "@configs/axios";
import { IQueryRequest } from "@models/common/common.request";
import { IGachaPurchaseRequest } from "@models/gacha/gacha.request";

const gachaService = {
    getGachaBannerToday: async () => {
        return axiosPrivate.get(`/gacha-banner/today/user`);
    },

    getHistoryByUser: async (params?: IQueryRequest) => {
        const queryParams = new URLSearchParams();
        const filters: string[] = [];

        if (params?.currentPage) queryParams.append('currentPage', params.currentPage.toString());
        if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

        if (params?.sort) {
            filters.push(`sort:${params.sort}`);
        }

        if (filters.length > 0) {
            const qsValue = filters.join(',');
            queryParams.append('qs', qsValue);
        }

        const queryString = queryParams.toString();
        return axiosPrivate.get(`/gacha-roll-history/user${queryString ? `?${queryString}` : ''}`);
    },

    getPityByUser: async () => {
        return axiosPrivate.get(`/user-gacha-pity/user/present`);
    },

    getGachaItemsByBannerId: async (gachaBannerId: number, params?: IQueryRequest) => {
        const queryParams = new URLSearchParams();
        if (params?.currentPage) queryParams.append('currentPage', params.currentPage.toString());
        if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
        return axiosPrivate.get(`/gacha-item/gacha-banner/${gachaBannerId}?${queryParams.toString()}`);
    },

    gachaPurchase: async (data: IGachaPurchaseRequest) => {
        return axiosPrivate.post(`/gacha-purchase`, data);
    },
}

export default gachaService;