import notificationService from "@services/notification";
import { useGlobalStore } from "@stores/global/global.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to get notification data
 * @returns Notification data
 */
export const useNotification = () => {
    const language = useGlobalStore((state) => state.language);
    const { data, isLoading, error } = useQuery({
        queryKey: ['notification', language],
        queryFn: () => notificationService.showNotification(1, 10),
    });
    return { data, isLoading, error };
};
//------------------------End------------------------//


/**
 * Hook to read notification
 * @returns Mutation object with mutate function
 */
export const useReadNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (notificationId: number) => notificationService.readNotification(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification'] });
        },
    });
};
//------------------------End------------------------//
