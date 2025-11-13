import achievementService from "@services/achievement";
import { useQuery } from "@tanstack/react-query";

export const useAchievement = (params?: {
    sort?: string;
    currentPage?: number;
    achPageSize?: number;
    achCurrentPage?: number;
    achievementGroupId?: number;
}) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['user-achievements', params],
        queryFn: () => achievementService.getUserAchievements(params),
    });

    return { data, isLoading, error };
};