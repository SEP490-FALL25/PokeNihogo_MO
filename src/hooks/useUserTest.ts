import { TestStatus } from "@constants/test.enum";
import { TestDetail } from "@models/user-test/test-full-user.response";
import userTestService from "@services/user-test";
import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

type GetMyUserTestsParams = {
  currentPage?: number;
  pageSize?: number;
  status?: string;
  testId?: string | number;
  type: TestStatus | string;
};

//--------------------------------User Test - Get My Tests--------------------------------//
/**
 * Get user's tests with pagination support
 * @param params - Query parameters for user tests
 * @returns Infinite query hook for getting user tests
 */
export const useUserTestsInfinite = (params: Omit<GetMyUserTestsParams, "currentPage">) => {
  return useInfiniteQuery({
    queryKey: ["user-tests", params],
    queryFn: ({ pageParam = 1 }) =>
      userTestService.getMy({
        ...params,
        currentPage: pageParam as number,
        pageSize: params.pageSize || 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      const pagination = lastPage?.data?.data?.pagination;
      if (!pagination) return undefined;
      
      const { current, totalPage } = pagination;
      return current < totalPage ? current + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get user's tests (simple query)
 * @param params - Query parameters for user tests
 * @returns Query hook for getting user tests
 */
export const useUserTests = (params: GetMyUserTestsParams) => {
  return useQuery({
    queryKey: ["user-tests", params],
    queryFn: () => userTestService.getMy(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

//--------------------------------User Test - Get Test Full User--------------------------------//
/**
 * Get full test details with sets and questions for user
 * @param testId - Test ID
 * @returns Query hook for getting test full user details
 */
export const useTestFullUser = (testId: string | number | null) => {
  return useQuery<TestDetail>({
    queryKey: ["test-full-user", testId],
    queryFn: () => userTestService.getTestFullUser(testId!),
    enabled: !!testId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

