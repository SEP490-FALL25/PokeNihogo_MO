import { axiosPrivate } from "@configs/axios";

const achievementService = {
    getUserAchievements: async (params?: {
        sort?: string;
        currentPage?: number;
        achPageSize?: number;
        achCurrentPage?: number;
        achievementGroupId?: number;
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.sort) queryParams.append('qs', `sort:${params.sort}`);
        if (params?.currentPage) queryParams.append('currentPage', params.currentPage.toString());
        if (params?.achPageSize) queryParams.append('achPageSize', params.achPageSize.toString());
        if (params?.achCurrentPage) queryParams.append('achCurrentPage', params.achCurrentPage.toString());
        if (params?.achievementGroupId) queryParams.append('achievementGroupId', params.achievementGroupId.toString());

        const queryString = queryParams.toString();
        const url = `/user-achievement/user${queryString ? `?${queryString}` : ''}`;
        return await axiosPrivate.get(url);
    },
};

export default achievementService;