import notificationService from "@services/notification";
import { useGlobalStore } from "@stores/global/global.config";
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

/**
 * Hook to get notification data with infinite scroll support
 * @returns Notification data with pagination helpers
 */
export const useNotification = () => {
    const language = useGlobalStore((state) => state.language);
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["notification", language],
        queryFn: ({ pageParam = 1 }) =>
            notificationService.showNotification(pageParam, 10),
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.data?.data?.pagination;
            if (!pagination) return undefined;
            const { current, totalPage } = pagination;
            return current < totalPage ? current + 1 : undefined;
        },
        initialPageParam: 1,
    });

    const notifications =
        data?.pages?.flatMap((page: any) => page?.data?.data?.results || []) ??
        [];

    const sortedNotifications = [...notifications].sort(
        (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const unreadCount = notifications.filter((item: any) => !item.isRead).length;

    return {
        data,
        notifications: sortedNotifications,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage: !!hasNextPage,
        isFetchingNextPage,
        refetch,
        unreadCount,
    };
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
            console.log("Marked as read success");
            queryClient.invalidateQueries({ queryKey: ['notification'] });
        },
        onError: (error) => {
            console.error("Mark as read failed:", error);
        }
    });
};
//------------------------End------------------------//
