import userTestService from "@services/user-test";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetTestAttempt = (testId: string | number, testType?: string) => {
  return useQuery({
    queryKey: ["test", testId, testType],
    queryFn: async () => {
      // Nếu là LESSON_TEST, gọi API lesson-review
      if (testType === "LESSON_TEST") {
        const res = await userTestService.getLessonReviewQuestions(testId);
        return res.data;
      }
      // Các test khác (READING_TEST, LISTENING_TEST) giữ nguyên
      const res = await userTestService.getAttemptByTestId(testId);
      return res.data;
    },
    enabled: !!testId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useCheckTestCompletion = () => {
  return useMutation({
    mutationFn: async (attemptId: string) => {
      const res = await userTestService.checkCompletion(attemptId);
      return res.data;
    },
  });
};

export const useSubmitTestCompletion = () => {
  return useMutation({
    mutationFn: async ({ attemptId, time }: { attemptId: string; time: number }) => {
      const res = await userTestService.submitCompletion(attemptId, time);
      return res.data;
    },
  });
};

export const useCheckReviewAccessTest = () => {
  return useMutation({
    mutationFn: async ({
      userTestAttemptId,
      testType,
    }: {
      userTestAttemptId: string;
      testType?: string;
    }) => {
      const isLessonTest = (testType || "").toUpperCase() === "LESSON_TEST";
      const res = isLessonTest
        ? await userTestService.getLessonTestReview(userTestAttemptId)
        : await userTestService.getReviewResult(userTestAttemptId);
      return res.data;
    },
  });
};

export const useAbandonTest = () => {
  return useMutation({
    mutationFn: async (userTestAttemptId: string | number) => {
      const res = await userTestService.abandonTest(userTestAttemptId);
      return res.data;
    },
  });
};


