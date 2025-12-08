import { PlacementQuestion } from "@models/placement-test/placement-question.common";
import { quizService } from "@services/quiz";
import userTestService from "@services/user-test";
import { useCallback, useEffect, useMemo, useState } from "react";

type Difficulty = "N5" | "N4" | "N3";
type QuestionType = "text" | "audio";

export type PlacementUiQuestion = {
  id: string;
  questionBankId: number;
  type: QuestionType;
  question: string;
  options: string[];
  optionIds: number[];
  answerIndex: number;
  difficulty: Difficulty;
  audioUrl?: string;
};

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function computeRecommendation(
  questions: PlacementUiQuestion[],
  answers: number[]
): Difficulty {
  let correct = 0;
  let correctN3 = 0;
  let correctN4 = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const a = answers[i];
    const isCorrect = a === q.answerIndex;
    if (isCorrect) {
      correct++;
      if (q.difficulty === "N3") correctN3++;
      if (q.difficulty === "N4") correctN4++;
    }
  }

  if (correct >= 8 || correctN3 >= 3) return "N3";
  if (correct >= 5 || correctN4 >= 3) return "N4";
  return "N5";
}

export function usePlacementTest(testId: number | string = 1) {
  const [questions, setQuestions] = useState<PlacementUiQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [userTestAttemptId, setUserTestAttemptId] = useState<number | null>(null);

  const current = useMemo(() => questions[currentIndex], [questions, currentIndex]);
  const isLast = useMemo(
    () => questions.length > 0 && currentIndex === questions.length - 1,
    [questions.length, currentIndex]
  );
  const progress = useMemo(
    () => (questions.length ? (currentIndex + 1) / questions.length : 0),
    [currentIndex, questions.length]
  );

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await quizService.getPlacementQuestions(testId);

      const attemptId = (response.data as any).userTestAttemptId || (response.data as any).userExerciseAttemptId;
      if (attemptId) setUserTestAttemptId(attemptId);

      const transformed: PlacementUiQuestion[] = (response.data as any).questions
        .filter((q: PlacementQuestion) => q.answers && q.answers.length > 0)
        .map((q: PlacementQuestion) => {
          const correctAnswerIndex = q.answers.findIndex((a) => a.isCorrect);
          const answerIndex = correctAnswerIndex !== -1 ? correctAnswerIndex : 0;
          const hasAudio = q.audioUrl !== null && q.audioUrl !== undefined && q.audioUrl !== "";
          const type: QuestionType = hasAudio ? "audio" : "text";
          const difficulty: Difficulty = `N${q.levelN}` as Difficulty;

          return {
            id: q.id.toString(),
            questionBankId: q.id,
            type,
            question: q.question,
            options: q.answers.map((a) => a.answer),
            optionIds: q.answers.map((a) => a.id),
            answerIndex,
            difficulty,
            audioUrl: q.audioUrl || undefined,
          };
        });

      setQuestions(shuffle(transformed));
      setCurrentIndex(0);
      setSelectedIndex(null);
      setAnswers([]);
    } catch (err: any) {
      setError(err?.message || "Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const selectOption = useCallback((idx: number) => {
    // Only update local selection; API upsert will be sent when user presses Next
    setSelectedIndex(idx);
  }, []);

  const next = useCallback(async () => {
    if (selectedIndex == null || !current) return { finished: false as const };
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = selectedIndex;
    setAnswers(nextAnswers);
    setSelectedIndex(null);

    // Persist answer for current question on "Next"
    if (userTestAttemptId && current) {
      const answerId = current.optionIds[selectedIndex];
      if (answerId) {
        try {
          await userTestService.upsertTestAnswerLog({
            userTestAttemptId,
            questionBankId: current.questionBankId,
            answerId,
          });
        } catch (_) {
          // ignore logging failure
        }
      }
    }

    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      return { finished: false as const };
    }

    try {
      setIsLoading(true);
      if (userTestAttemptId) {
        // Nộp bài placement test và lấy thông tin từ response
        try {
          const submitRes = await userTestService.submitPlacementTestCompletion(userTestAttemptId, 0);
          const responseData = (submitRes.data as any)?.data;
          if (responseData) {
            const levelN = responseData.levelN;
            const levelId = responseData.levelId || null;
            const totalCorrect = responseData.totalCorrect;
            const totalQuestions = responseData.totalQuestions;
            const percentage = responseData.percentage;
            
            if (levelN) {
              const recommended: Difficulty = `N${levelN}` as Difficulty;
              return { 
                finished: true as const, 
                recommended,
                levelN,
                levelId,
                totalCorrect,
                totalQuestions,
                percentage,
              };
            }
          }
        } catch (submitError) {
          console.error("Error submitting placement test:", submitError);
        }
        // Fallback to computed recommendation if no levelN from API
        const recommended = computeRecommendation(questions, nextAnswers);
        return { finished: true as const, recommended };
      }
      const recommended = computeRecommendation(questions, nextAnswers);
      return { finished: true as const, recommended };
    } catch (_) {
      const recommended = computeRecommendation(questions, nextAnswers);
      return { finished: true as const, recommended };
    } finally {
      setIsLoading(false);
    }
  }, [selectedIndex, current, answers, currentIndex, isLast, userTestAttemptId, questions]);

  return {
    // state
    questions,
    current,
    isLast,
    progress,
    isLoading,
    error,
    selectedIndex,
    userTestAttemptId,
    // actions
    setSelectedIndex,
    selectOption,
    next,
    refetch: fetchQuestions,
  } as const;
}

export default usePlacementTest;

