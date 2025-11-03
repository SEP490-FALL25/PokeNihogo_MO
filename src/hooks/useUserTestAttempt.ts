import userTestService from "@services/user-test";
import { useMutation } from "@tanstack/react-query";

export const useCheckReadingCompletion = () => {
  return useMutation({
    mutationFn: async (attemptId: string) => {
      const res = await userTestService.checkCompletion(attemptId);
      return res.data;
    },
  });
};

export const useSubmitReadingCompletion = () => {
  return useMutation({
    mutationFn: async ({ attemptId, time }: { attemptId: string; time: number }) => {
      const res = await userTestService.submitCompletion(attemptId, time);
      return res.data;
    },
  });
};

export const useCheckReviewAccessTest = () => {
  return useMutation({
    mutationFn: async (userTestAttemptId: string) => {
      const res = await userTestService.getReviewResult(userTestAttemptId);
      return res.data;
    },
  });
};


