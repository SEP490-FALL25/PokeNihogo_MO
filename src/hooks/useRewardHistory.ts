import { IRewardHistoryResponse } from "@models/reward/reward.response";
import rewardService from "@services/reward";
import { useInfiniteQuery } from "@tanstack/react-query";

type GetRewardHistoryParams = {
  currentPage?: number;
  pageSize?: number;
};

/**
 * Hook to get reward history with pagination
 */
export const useRewardHistory = (params?: GetRewardHistoryParams) => {
  return useInfiniteQuery({
    queryKey: ["reward-history", params],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await rewardService.getRewardHistory({
        ...params,
        currentPage: pageParam as number,
        pageSize: params?.pageSize ?? 10,
      });
      return res as IRewardHistoryResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination) return undefined;
      if (pagination.current < pagination.totalPage) {
        return pagination.current + 1;
      }
      return undefined;
    },
  });
};

