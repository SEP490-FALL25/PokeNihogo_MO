import { IQueryRequest } from "@models/common/common.request";
import { ILessonCategoryResponse } from "@models/lesson-category/lesson-category.response";
import { ILessonExercisesResponse } from "@models/user-exercise-attempt/user-exercise-attempt.response";
import exerciseService from "@services/exercise";
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

export const useLesson = (lessonId: string) => {
  const language = useGlobalStore((state) => state.language);

  return useQuery({
    queryKey: ["lesson", lessonId, language],
    queryFn: () => lessonService.getLessonById(lessonId, language),
    enabled: !!lessonId,
  });
};

export const useLessonExercises = (lessonId: string) => {
  return useQuery<ILessonExercisesResponse>({
    queryKey: ["lesson-exercises", lessonId],
    queryFn: () => exerciseService.getExercisesByLesson(lessonId),
    enabled: !!lessonId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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

/**
 * Infinite list of user lessons with pagination support
 */
export const useInfiniteUserLessons = (
  params: Omit<IQueryRequest, "currentPage">
) => {
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
