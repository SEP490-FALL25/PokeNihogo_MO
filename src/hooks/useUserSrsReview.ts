import userSrsReviewService from "@services/user-srs-review";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to mark SRS review as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id: number) => userSrsReviewService.markAsRead(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-srs-review"] });
    },
  });
};

