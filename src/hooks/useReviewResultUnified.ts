import userExerciseAttemptService from "@services/user-exercise-attempt";
import userTestService from "@services/user-test";
import { useQuery } from "@tanstack/react-query";

type ReviewType = "quiz" | "test"; // "quiz" => exercise attempt, "test" => user test attempt

export const useReviewResultUnified = (
  sessionId: string | undefined,
  type: ReviewType,
  initialData?: any
) => {
  return useQuery({
    queryKey: ["review-result", type, sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      if (type === "test") {
        const res = await userTestService.getReviewResult(sessionId);
        return res.data;
      }
      const res = await userExerciseAttemptService.getReviewResult(String(sessionId));
      return res.data;
    },
    enabled: !!sessionId,
    initialData,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export type { ReviewType };


