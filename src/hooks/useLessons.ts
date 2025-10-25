import { IQueryRequest } from "@models/common/common.request";
import { ILessonCategoryResponse } from "@models/lesson-category/lesson-category.response";
import { lessonService } from "@services/lesson";
import lessonCategoriesService from "@services/lesson-categories";
import userProgressService from "@services/user-progres";
import { useGlobalStore } from "@stores/global/global.config";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const useLessons = (level: "N5" | "N4" | "N3") => {
  const language = useGlobalStore((state) => state.language);
  
  return useQuery({
    queryKey: ["lessons", level, language],
    queryFn: () => lessonService.getLessonsByLevel(level),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!level, // Only run query if level is provided
  });
};

export const useLesson = (lessonId: string) => {
  const language = useGlobalStore((state) => state.language);
  
  return useQuery({
    queryKey: ["lesson", lessonId, language],
    queryFn: () => lessonService.getLessonById(lessonId),
    enabled: !!lessonId,
  });
};

export const useUpdateLessonProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      progress,
      isCompleted,
    }: {
      lessonId: string;
      progress: number;
      isCompleted?: boolean;
    }) => lessonService.updateLessonProgress(lessonId, progress, isCompleted),
    onSuccess: (data, variables) => {
      // Invalidate and refetch lessons
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({
        queryKey: ["lesson", variables.lessonId],
      });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    },
  });
};

export const useUserProgress = () => {
  const language = useGlobalStore((state) => state.language);
  
  return useQuery({
    queryKey: ["userProgress", language],
    queryFn: () => lessonService.getUserProgress(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUserProgressWithParams = (params: IQueryRequest) => {
  const language = useGlobalStore((state) => state.language);
  
  return useQuery({
    queryKey: ["userProgress", params, language],
    queryFn: () => userProgressService.getMyProgress(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1, // Only retry once
  });
};

export const useUserProgressInfinite = (
  params: Omit<IQueryRequest, "currentPage">
) => {
  const language = useGlobalStore((state) => state.language);
  
  return useInfiniteQuery({
    queryKey: ["userProgressInfinite", params, language],
    queryFn: ({ pageParam = 1 }) =>
      userProgressService.getMyProgress({
        ...params,
        currentPage: pageParam as number,
        pageSize: params.pageSize || 10,
      }),
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1, // Only retry once
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      const { data } = lastPage;
      if (
        data &&
        data.results &&
        data.results.length === (params.pageSize || 10)
      ) {
        return allPages.length + 1;
      }
      return undefined;
    },
  });
};

/**
 * Infinite list of user lessons with pagination support
 */
export const useInfiniteUserLessons = (params: Omit<IQueryRequest, "currentPage">) => {
  const language = useGlobalStore((state) => state.language);
  
  return useInfiniteQuery({
    queryKey: ["user-lessons-infinite", params, language],
    queryFn: ({ pageParam = 1 }) =>
      userProgressService.getMyProgress({
        ...params,
        currentPage: pageParam as number,
        pageSize: (params as IQueryRequest).pageSize ?? 10,
      }),
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1, // Only retry once
    getNextPageParam: (lastPage) => {
      const pagination = (lastPage as any)?.data?.pagination;
      if (!pagination) return undefined;
      const { current, totalPage } = pagination;
      return current < totalPage ? current + 1 : undefined;
    },
  });
};

export const useLessonCategories = () => {
  const language = useGlobalStore((state) => state.language);
  
  return useQuery<ILessonCategoryResponse>({
    queryKey: ["lessonCategories", language],
    queryFn: () => lessonCategoriesService.getAllLessonCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
    enabled: true, // Only run query if enabled
  });
};
