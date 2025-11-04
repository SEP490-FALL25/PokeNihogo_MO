import { useUpsertUserTestAnswerLog } from "@hooks/useUserTestAnswerLog";
import {
    useAbandonTest,
    useCheckTestCompletion,
    useSubmitTestCompletion,
} from "@hooks/useUserTestAttempt";
import { TestSet } from "@utils/test.utils";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

interface UseTestLogicProps {
  userTestAttemptId: number | null;
  sets: TestSet[];
}

export const useTestLogic = ({ userTestAttemptId, sets }: UseTestLogicProps) => {
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [unansweredQuestionIds, setUnansweredQuestionIds] = useState<number[]>([]);

  const scaleAnims = useRef<Record<string, Animated.Value[]>>({}).current;

  const { mutate: upsertAnswer } = useUpsertUserTestAnswerLog();
  const { mutate: checkCompletion, data: checkCompletionData } =
    useCheckTestCompletion();
  const { mutate: submitCompletion } = useSubmitTestCompletion();
  const { mutate: abandonTest } = useAbandonTest();

  const allQuestions = sets.flatMap((s) => s.questions);

  // Initialize animations for questions
  useEffect(() => {
    allQuestions.forEach((q) => {
      if (!scaleAnims[q.uid] && q.options) {
        scaleAnims[q.uid] = q.options.map(() => new Animated.Value(1));
      }
    });
  }, [allQuestions]);

  // Timer
  useEffect(() => {
    if (!isTimerPaused) {
      const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isTimerPaused]);

  const handleAnswerSelect = (
    bankId: string,
    selected: string[],
    optionIndex?: number,
    uid?: string
  ) => {
    const animKey = uid || bankId;
    if (uid) {
      setSelections((prev) => ({ ...prev, [uid]: selected }));
    }

    if (!scaleAnims[animKey]) {
      const question = allQuestions.find((q) => q.bankId === bankId);
      if (question?.options) {
        scaleAnims[animKey] = question.options.map(() => new Animated.Value(1));
      }
    }

    if (optionIndex !== undefined && scaleAnims[animKey]?.[optionIndex]) {
      Animated.sequence([
        Animated.timing(scaleAnims[animKey][optionIndex], {
          toValue: 0.95,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims[animKey][optionIndex], {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (userTestAttemptId && selected.length > 0) {
      const questionBankId = parseInt(bankId, 10);
      const answerId = parseInt(selected[selected.length - 1], 10);
      if (!isNaN(questionBankId) && !isNaN(answerId)) {
        upsertAnswer({ userTestAttemptId, questionBankId, answerId });
      }
    }
  };

  const handleSubmitPress = () => {
    if (!userTestAttemptId) return;
    setIsTimerPaused(true);
    checkCompletion(String(userTestAttemptId), {
      onSuccess: (response) => {
        if (response.data) {
          setUnansweredQuestionIds(response.data.unansweredQuestionIds || []);
        }
        setShowCompletionModal(true);
      },
      onError: () => setIsTimerPaused(false),
    });
  };

  const handleExitConfirm = () => {
    if (userTestAttemptId) {
      abandonTest(userTestAttemptId, {
        onSuccess: () => {
          setShowExitConfirmModal(false);
          router.back();
        },
        onError: () => {
          setShowExitConfirmModal(false);
          router.back();
        },
      });
    } else {
      setShowExitConfirmModal(false);
      router.back();
    }
  };

  const handleCompletionSubmit = () => {
    if (!userTestAttemptId) return;
    setShowCompletionModal(false);
    submitCompletion(
      { attemptId: String(userTestAttemptId), time: elapsedSeconds },
      {
        onSuccess: (res) => {
          setIsTimerPaused(false);
          if (res?.data) {
            router.replace({
              pathname: "/quiz/result",
              params: {
                resultId: String(userTestAttemptId),
                resultData: JSON.stringify(res.data),
                message: res.message || "",
                timeSpent: String(elapsedSeconds),
              },
            });
          }
        },
        onError: () => setIsTimerPaused(false),
      }
    );
  };

  const answeredCount = Object.values(selections).filter((a) => a.length > 0).length;

  const unansweredUids = unansweredQuestionIds
    .map((bankId: number) => {
      const question = allQuestions.find((q) => q.bankId === String(bankId));
      return question?.uid;
    })
    .filter((uid: string | undefined): uid is string => !!uid);

  return {
    selections,
    showExitConfirmModal,
    setShowExitConfirmModal,
    showCompletionModal,
    setShowCompletionModal,
    elapsedSeconds,
    isTimerPaused,
    setIsTimerPaused,
    unansweredQuestionIds,
    scaleAnims,
    allQuestions,
    answeredCount,
    unansweredUids,
    checkCompletionData,
    handleAnswerSelect,
    handleSubmitPress,
    handleExitConfirm,
    handleCompletionSubmit,
  };
};
