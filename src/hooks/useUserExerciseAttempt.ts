import {
  ICheckCompletionResponse,
  ISubmitCompletionResponse,
} from "@models/user-exercise-attempt/user-exercise-attempt.response";
import userExerciseAttemptService from "@services/user-exercise-attempt";
import { useGlobalStore } from "@stores/global/global.config";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useUserExerciseAttempt = (lessonId: string) => {
  return useQuery({
    queryKey: ["user-exercise-attempt-latest", lessonId],
    queryFn: async () => {
      const res =
        await userExerciseAttemptService.getLatestExerciseAttempt(lessonId);
      return res.data;
    },
    enabled: !!lessonId,
    staleTime: 60 * 1000,
  });
};

export const useUserExerciseQuestions = (exerciseAttemptId: string) => {
  const language = useGlobalStore((state) => state.language);

  return useQuery({
    queryKey: ["user-exercise-questions", exerciseAttemptId, language],
    queryFn: async () => {
      const res =
        await userExerciseAttemptService.getExerciseQuestions(
          exerciseAttemptId
        );
      return res.data;
    },
    enabled: !!exerciseAttemptId,
    staleTime: 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useCheckCompletion = () => {
  return useMutation({
    mutationFn: async (
      exerciseAttemptId: string
    ): Promise<ICheckCompletionResponse> => {
      const res =
        await userExerciseAttemptService.checkCompleted(exerciseAttemptId);
      return res.data;
    },
  });
};

export const useSubmitCompletion = () => {
  return useMutation({
    mutationFn: async ({
      exerciseAttemptId,
      time,
    }: {
      exerciseAttemptId: string;
      time: number;
    }): Promise<ISubmitCompletionResponse> => {
      const res = await userExerciseAttemptService.submitCompletion(
        exerciseAttemptId,
        time
      );
      return res.data;
    },
  });
};

export const useReviewResult = (exerciseAttemptId: string) => {
  const language = useGlobalStore((state) => state.language);

  return useQuery({
    queryKey: ["review-result", exerciseAttemptId, language],
    queryFn: async () => {
      const res =
        await userExerciseAttemptService.getReviewResult(exerciseAttemptId);
      return res.data;
    },
    enabled: !!exerciseAttemptId,
    staleTime: 60 * 1000,
  });
};
