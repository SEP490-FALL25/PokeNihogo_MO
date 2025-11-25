import userExerciseAttemptService from "@services/user-exercise-attempt";
import userTestService from "@services/user-test";
import { useQuery } from "@tanstack/react-query";

type ReviewType = "quiz" | "test"; // "quiz" => exercise attempt, "test" => user test attempt

type ReviewResultOptions = {
  initialData?: any;
  testType?: string;
};

export const useReviewResultUnified = (
  sessionId: string | undefined,
  type: ReviewType,
  options?: ReviewResultOptions
) => {
  const { initialData, testType } = options || {};

  return useQuery({
    queryKey: ["review-result", type, sessionId, options?.testType],
    queryFn: async () => {
      if (!sessionId) return null;
      if (type === "test") {
        const isLessonTest = (testType || "").toUpperCase() === "LESSON_TEST";
        const res = isLessonTest
          ? await userTestService.getLessonTestReview(sessionId)
          : await userTestService.getReviewResult(sessionId);
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


