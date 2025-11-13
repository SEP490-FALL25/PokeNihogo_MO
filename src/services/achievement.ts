import { axiosPrivate } from "@configs/axios";
import { UserAchievementsData, UserAchievementsResponseSchema } from "@models/achievement/achievement.response";

const achievementService = {
    getUserAchievements: async (params?: {
        sort?: string | string[];
        currentPage?: number;
        achPageSize?: number;
        achCurrentPage?: number;
        achievementGroupId?: number;
    }): Promise<UserAchievementsData> => {
        const queryParams = new URLSearchParams();

        // Handle sort parameter - can be string or array
        if (params?.sort) {
            const sortValue = Array.isArray(params.sort)
                ? params.sort.join(',')
                : params.sort;
            queryParams.append('qs', `sort:${sortValue}`);
        }

        if (params?.currentPage) queryParams.append('currentPage', params.currentPage.toString());
        if (params?.achPageSize) queryParams.append('achPageSize', params.achPageSize.toString());
        if (params?.achCurrentPage) queryParams.append('achCurrentPage', params.achCurrentPage.toString());
        if (params?.achievementGroupId) queryParams.append('achievementGroupId', params.achievementGroupId.toString());

        const queryString = queryParams.toString();
        const url = `/user-achievement/user${queryString ? `?${queryString}` : ''}`;
        const response = await axiosPrivate.get(url);

        if (!response.data) {
            throw new Error('Response data is undefined');
        }

        const parsed = UserAchievementsResponseSchema.safeParse(response.data);
        if (!parsed.success) {
            throw parsed.error;
        }
        return parsed.data.data;
    },
};

export default achievementService;