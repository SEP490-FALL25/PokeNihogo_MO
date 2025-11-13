import { IHistoryListResponse } from "@models/user-history/user-history.response";
import userHistoryService from "@services/user-history";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

type GetHistoryExercisesParams = {
  currentPage?: number;
  pageSize?: number;
};

type GetHistoryTestsParams = {
  currentPage?: number;
  pageSize?: number;
};

/**
 * Hook to get exercise history with pagination
 */
export const useHistoryExercises = (params?: GetHistoryExercisesParams) => {
  return useInfiniteQuery({
    queryKey: ["history-exercises", params],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await userHistoryService.getHistoryExercises({
        ...params,
        currentPage: pageParam as number,
        pageSize: params?.pageSize ?? 10,
      });
      return res.data as IHistoryListResponse;
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

/**
 * Hook to get test history with pagination
 */
export const useHistoryTests = (params?: GetHistoryTestsParams) => {
  return useInfiniteQuery({
    queryKey: ["history-tests", params],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await userHistoryService.getHistoryTests({
        ...params,
        currentPage: pageParam as number,
        pageSize: params?.pageSize ?? 10,
      });
      return res.data as IHistoryListResponse;
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

/**
 * Hook to get combined history (both exercises and tests)
 */
export const useCombinedHistory = (params?: {
  currentPage?: number;
  pageSize?: number;
}) => {
  const exercisesQuery = useHistoryExercises(params);
  const testsQuery = useHistoryTests(params);

  return {
    exercises: exercisesQuery,
    tests: testsQuery,
    isLoading: exercisesQuery.isLoading || testsQuery.isLoading,
    isError: exercisesQuery.isError || testsQuery.isError,
    refetch: () => {
      exercisesQuery.refetch();
      testsQuery.refetch();
    },
  };
};

