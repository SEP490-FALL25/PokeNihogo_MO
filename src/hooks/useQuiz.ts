import { quizService } from "@services/quiz";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ICompleteQuizResponse,
  ICreateQuizSessionResponse,
  IGetQuizHistoryResponse,
  IGetQuizQuestionsResponse,
  IGetQuizReviewResponse,
  IGetQuizStatsResponse,
  ISubmitQuizAnswerResponse,
} from "@models/quiz/quiz.response";

//--------------------------------Quiz Session--------------------------------//
/**
 * Create a new quiz session
 * @returns Mutation hook for creating quiz session
 */
export const useCreateQuizSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      lessonId?: string;
      category?: string;
      level?: 'N5' | 'N4' | 'N3';
      questionCount?: number;
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      exerciseAttemptId?: number | string;
    }) => quizService.createQuizSession(params),
    onSuccess: (data) => {
      // Invalidate and refetch quiz sessions
      queryClient.invalidateQueries({ queryKey: ["quiz-session"] });
      // Optionally set the new session in cache
      if (data?.data?.session?.id) {
        queryClient.setQueryData(
          ["quiz-session", data.data.session.id],
          data
        );
      }
    },
  });
};

/**
 * Get quiz session by ID
 * @param sessionId - Quiz session ID
 * @returns Query hook for getting quiz session
 */
export const useQuizSession = (sessionId: string | null) => {
  return useQuery({
    queryKey: ["quiz-session", sessionId],
    queryFn: () => quizService.getQuizSession(sessionId!),
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

//--------------------------------Quiz Questions--------------------------------//
/**
 * Get quiz questions for a session
 * @param sessionId - Quiz session ID
 * @returns Query hook for getting quiz questions
 */
export const useQuizQuestions = (sessionId: string | null) => {
  return useQuery<IGetQuizQuestionsResponse>({
    queryKey: ["quiz-questions", sessionId],
    queryFn: () => quizService.getQuizQuestions(sessionId!),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

//--------------------------------Quiz Answer--------------------------------//
/**
 * Submit an answer for a quiz question
 * @returns Mutation hook for submitting quiz answer
 */
export const useSubmitQuizAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      sessionId: string;
      questionId: string;
      selectedAnswers: string[];
      timeSpent: number;
    }) => quizService.submitAnswer(params),
    onSuccess: (data, variables) => {
      // Invalidate quiz session and questions to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ["quiz-session", variables.sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["quiz-questions", variables.sessionId],
      });
    },
  });
};

//--------------------------------Complete Quiz--------------------------------//
/**
 * Complete the quiz and get results
 * @returns Mutation hook for completing quiz
 */
export const useCompleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      sessionId: string;
      answers: {
        questionId: string;
        selectedAnswers: string[];
        timeSpent: number;
      }[];
      totalTimeSpent: number;
    }) => quizService.completeQuiz(params),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["quiz-session", variables.sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["quiz-questions", variables.sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["quiz-stats"] });
      queryClient.invalidateQueries({ queryKey: ["quiz-history"] });
      // Set the result in cache for review
      if (data?.data?.result) {
        queryClient.setQueryData(
          ["quiz-review", variables.sessionId],
          data
        );
      }
    },
  });
};

//--------------------------------Quiz Stats--------------------------------//
/**
 * Get user's quiz statistics
 * @returns Query hook for getting quiz stats
 */
export const useQuizStats = () => {
  return useQuery<IGetQuizStatsResponse>({
    queryKey: ["quiz-stats"],
    queryFn: () => quizService.getQuizStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

//--------------------------------Quiz History--------------------------------//
/**
 * Get quiz history with pagination support
 * @param params - Query parameters for quiz history
 * @returns Infinite query hook for getting quiz history
 */
export const useQuizHistoryInfinite = (params?: {
  limit?: number;
  category?: string;
}) => {
  return useInfiniteQuery<IGetQuizHistoryResponse>({
    queryKey: ["quiz-history", params],
    queryFn: ({ pageParam = 0 }) =>
      quizService.getQuizHistory({
        offset: pageParam as number,
        limit: params?.limit || 10,
        category: params?.category,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce(
        (sum, page) => sum + (page?.data?.results?.length || 0),
        0
      );
      const hasMore = lastPage?.data?.hasMore ?? false;
      return hasMore ? totalLoaded : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get quiz history (simple query)
 * @param params - Query parameters for quiz history
 * @returns Query hook for getting quiz history
 */
export const useQuizHistory = (params?: {
  limit?: number;
  offset?: number;
  category?: string;
}) => {
  return useQuery<IGetQuizHistoryResponse>({
    queryKey: ["quiz-history", params],
    queryFn: () => quizService.getQuizHistory(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

//--------------------------------Quiz Review--------------------------------//
/**
 * Get a completed quiz session with user's answers for review
 * @param sessionId - Quiz session ID
 * @returns Query hook for getting quiz review
 */
export const useQuizReview = (sessionId: string | null) => {
  return useQuery<IGetQuizReviewResponse>({
    queryKey: ["quiz-review", sessionId],
    queryFn: () => quizService.getQuizReview(sessionId!),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

