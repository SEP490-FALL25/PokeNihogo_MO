import { UserAchievementsData } from "@models/achievement/achievement.response";
import achievementService from "@services/achievement";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useLanguage from "./useLanguage";

/**
 * Hook to get the user achievements.
 * @param params - The parameters for the achievement service.
 * @returns The user achievements data.
 */
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
    const language = useLanguage();
    const { data, isLoading, error } = useQuery<UserAchievementsData, Error>({
        queryKey: ['user-achievements', params, language],
        queryFn: () => achievementService.getUserAchievements(params),
        staleTime: 60 * 1000,
    });

    return { data, isLoading, error: error || null };
};
//---------------------End---------------------//


/**
 * Hook to receive the achievement reward.
 * @returns The mutation hook to receive the achievement reward.
 */
export const useReceiveAchievementReward = (): {
    mutate: (achievementId: number, options?: { onSuccess?: () => void; onError?: (error: any) => void }) => void;
    isPending: boolean;
    error: Error | null;
} => {
    const queryClient = useQueryClient();
    const { mutate, isPending, error } = useMutation({
        mutationFn: (achievementId: number) => achievementService.receiveAchievementReward(achievementId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
        },
        onError: (error: any) => {
            console.error('Error receiving reward:', error.response?.data?.message || error.message);
        },
    });

    return {
        mutate: (achievementId: number, options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
            mutate(achievementId, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
                    options?.onSuccess?.();
                },
                onError: (error: any) => {
                    console.error('Error receiving reward:', error.response?.data?.message || error.message);
                    options?.onError?.(error);
                },
            });
        },
        isPending,
        error: error || null
    };
};
//---------------------End---------------------//