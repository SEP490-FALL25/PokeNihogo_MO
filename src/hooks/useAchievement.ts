import { UserAchievementsData } from "@models/achievement/achievement.response";
import achievementService from "@services/achievement";
import { useQuery } from "@tanstack/react-query";

export const useAchievement = (params?: {
    sort?: string | string[];
    currentPage?: number;
    achPageSize?: number;
    achCurrentPage?: number;
    achievementGroupId?: number;
}): {
    data: UserAchievementsData | undefined;
    isLoading: boolean;
    error: Error | null;
} => {
    const { data, isLoading, error } = useQuery<UserAchievementsData, Error>({
        queryKey: ['user-achievements', params],
        queryFn: () => achievementService.getUserAchievements(params),
        staleTime: 60 * 1000,
    });

    return { data, isLoading, error: error || null };
};