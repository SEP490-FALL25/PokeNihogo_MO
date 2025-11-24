import DiscomfortVision from "@components/atoms/DiscomfortVision";
import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { HapticPressable } from "@components/HapticPressable";
import { ThemedView } from "@components/ThemedView";
import { getSocket } from "@configs/socket";
import { MATCH_DEBUFF_TYPE } from "@constants/battle.enum";
import useAuth from "@hooks/useAuth";
import { useListMatchRound } from "@hooks/useBattle";
import useOwnedPokemons from "@hooks/useOwnedPokemons";
import { IBattleMatchRound } from "@models/battle/battle.response";
import battleService from "@services/battle";
import { useAuthStore } from "@stores/auth/auth.config";
import { useMatchingStore } from "@stores/matching/matching.config";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  ShieldAlert,
  XCircle,
  Zap,
} from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TYPE_MATCHUPS } from "../../../../mock-data/type-matchups";

const BASE_POINT_PER_QUESTION = 100;
const MIN_POINT_PER_QUESTION = 50;

interface BattleArenaScreenProps { }

export default function BattleArenaScreen({ }: BattleArenaScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const matchId = params.matchId as string;
  const roundNumber = params.roundNumber as string;
  const { ownedPokemons } = useOwnedPokemons();
  const { user } = useAuth();
  const currentUserId = user?.data?.id as number | undefined;
  const accessToken = useAuthStore((s) => s.accessToken);

  // --- STORE HOOKS ---
  const setCurrentMatchId = useMatchingStore((s) => s.setCurrentMatchId);
  const setLastMatchResult = useMatchingStore((s) => s.setLastMatchResult);
  const serverTimeOffset = useMatchingStore((s) => s.serverTimeOffset);
  const setServerTimeOffset = useMatchingStore((s) => s.setServerTimeOffset);
  const startRoundPayload = useMatchingStore((s) => s.startRoundPayload);
  const setStartRoundPayload = useMatchingStore((s) => s.setStartRoundPayload);

  const queryClient = useQueryClient();

  const { data: matchRound, isLoading: isLoadingMatchRound } =
    useListMatchRound(matchId) as {
      data: IBattleMatchRound;
      isLoading: boolean;
    };

  // States
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [battleComplete, setBattleComplete] = useState(false);
  const [matchSummary, setMatchSummary] = useState<any>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [playerPokemonIndex, setPlayerPokemonIndex] = useState(0);
  const [opponentPokemonIndex, setOpponentPokemonIndex] = useState(0);
  const [typeAdvantage, setTypeAdvantage] = useState<any>(null);
  const [showFog, setShowFog] = useState(false);
  const [showConfusion, setShowConfusion] = useState(false);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [upcomingDebuff, setUpcomingDebuff] = useState<{
    debuff: any;
    roundQuestionId?: number | null;
  } | null>(null);
  const [roundStarted, setRoundStarted] = useState(false);
  const [roundData, setRoundData] = useState<any>(null);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<
    number | null
  >(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(
    null
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [isLastQuestion, setIsLastQuestion] = useState(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const [currentQuestionPoints, setCurrentQuestionPoints] = useState(
    BASE_POINT_PER_QUESTION
  );
  const pointProgress = useRef(new Animated.Value(1)).current;
  const pointProgressWidth = pointProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });
  const upcomingDebuffTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const getDebuffDisplay = useCallback(
    (debuff?: { typeDebuff?: string | null; valueDebuff?: number | null }) => {
      if (!debuff?.typeDebuff) return null;
      switch (debuff.typeDebuff) {
        case MATCH_DEBUFF_TYPE.ADD_QUESTION:
          return {
            title: t("battle.arena.debuff.add_question"),
            description:
              typeof debuff.valueDebuff === "number"
                ? t("battle.arena.debuff.add_question_description", {
                  value: debuff.valueDebuff,
                })
                : null,
          };
        case MATCH_DEBUFF_TYPE.DECREASE_POINT:
          return {
            title: t("battle.arena.debuff.decrease_point"),
            description:
              typeof debuff.valueDebuff === "number"
                ? t("battle.arena.debuff.decrease_point_description", {
                  value: debuff.valueDebuff,
                })
                : null,
          };
        case MATCH_DEBUFF_TYPE.DISCOMFORT_VISION:
          return {
            title: t("battle.arena.debuff.discomfort_vision"),
            description: t(
              "battle.arena.debuff.discomfort_vision_description"
            ),
          };
        default:
          return {
            title: t("battle.arena.debuff.title"),
            description: null,
          };
      }
    },
    [t]
  );
  const currentDebuffDisplay = useMemo(
    () => getDebuffDisplay(currentQuestion?.debuff),
    [currentQuestion?.debuff, getDebuffDisplay]
  );

  // --- LOGIC XỬ LÝ ROUND STARTED (Dùng chung) ---
  const handleRoundStartedData = useCallback((payload: any) => {
    console.log("[ARENA] Processing Round Data:", payload);
    setRoundStarted(true);

    // Parse Round
    if (payload?.round?.roundNumber) {
      const roundNumStr = payload.round.roundNumber;
      if (roundNumStr === "ONE") setCurrentRound(1);
      else if (roundNumStr === "TWO") setCurrentRound(2);
      else if (roundNumStr === "THREE") setCurrentRound(3);
    }

    if (payload?.round) {
      setRoundData({
        participant: payload.round.participant,
        opponent: payload.round.opponent,
      });
    }

    // Parse Question
    if (payload?.firstQuestion) {
      const qData = payload.firstQuestion;
      const qBank = qData.questionBank;
      const answers = qBank?.answers || qData.answers || [];

      const parseAnswerText = (answer: any) => {
        if (answer.answerJp) {
          const parts = answer.answerJp.split("+");
          const viPart = parts.find((p: string) => p.startsWith("vi:"));
          const enPart = parts.find((p: string) => p.startsWith("en:"));
          if (viPart) return viPart.replace("vi:", "");
          if (enPart) return enPart.replace("en:", "");
          return answer.answerJp;
        }
        return answer.answer || answer.text || answer;
      };

      const options = answers.map(parseAnswerText);
      const correctIdx = answers.findIndex((a: any) => a.isCorrect);
      const roundQId = qData.roundQuestionId || qData.id;

      pointProgress.setValue(1);
      setCurrentQuestionPoints(BASE_POINT_PER_QUESTION);
      setUpcomingDebuff(null);

      setCurrentQuestion({
        id: qData.id || qBank?.id,
        question: qBank?.questionJp || qData.question,
        options: options,
        answers: answers,
        correctAnswer: correctIdx >= 0 ? correctIdx : undefined,
        endTimeQuestion: qData.endTimeQuestion,
        timeLimitMs: qData.timeLimitMs,
        questionType: qBank?.questionType || qData.questionType,
        debuff: qData.debuff,
        roundQuestionId: roundQId,
        orderNumber: qData.orderNumber,
      });

      // --- FORCE SYNC TIME ---
      if (qData.endTimeQuestion && qData.timeLimitMs) {
        const endTime = new Date(qData.endTimeQuestion).getTime();
        const theoreticalStart = endTime - qData.timeLimitMs;
        const newOffset = theoreticalStart - Date.now();

        console.log(`[ARENA] Syncing Time Offset: ${newOffset}`);
        setServerTimeOffset(newOffset); // Update store

        // Calc remaining immediately
        const now = Date.now() + newOffset;
        const rem = Math.max(0, Math.floor((endTime - now) / 1000));
        const maxTime = Math.floor(qData.timeLimitMs / 1000);
        setQuestionTimeRemaining(Math.min(rem, maxTime));
      } else if (qData.endTimeQuestion) {
        const endTime = new Date(qData.endTimeQuestion).getTime();
        const now = Date.now() + useMatchingStore.getState().serverTimeOffset;
        setQuestionTimeRemaining(
          Math.max(0, Math.floor((endTime - now) / 1000))
        );
      }

      setQuestionStartTime(Date.now());
      setCurrentQuestionIndex((prev) => prev + 1);
      if (payload?.isLastQuestion !== undefined)
        setIsLastQuestion(payload.isLastQuestion);
      if (payload?.totalQuestions) setTotalQuestions(payload.totalQuestions);
    }

    setIsWaitingForOpponent(false);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setShowResult(false);
  }, []);

  // --- [FIXED] UNIFIED INITIALIZATION EFFECT (Gộp Handover & Reset) ---
  useEffect(() => {
    if (!matchId) return;
    setCurrentMatchId(matchId);

    const handoverPayload = useMatchingStore.getState().startRoundPayload;

    if (handoverPayload) {
      // Scenario A: Đến từ Pick Screen -> Dùng dữ liệu có sẵn
      console.log("[ARENA] 🚀 Handover data found! Initializing round...");
      handleRoundStartedData(handoverPayload);
      setStartRoundPayload(null); // Clear immediately
    } else {
      // Scenario B: Vào trực tiếp hoặc Reload -> Reset State sạch sẽ
      console.log("[ARENA] No handover data. Resetting state...");
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setShowResult(false);
      setBattleComplete(false);
      setMatchSummary(null);
      setPlayerScore(0);
      setOpponentScore(0);
      setCurrentTurn(1);
      setPlayerPokemonIndex(0);
      setOpponentPokemonIndex(0);
      setTypeAdvantage(null);
      setShowFog(false);
      setShowConfusion(false);
      setIsWaitingForOpponent(false);
      setQuestionTimeRemaining(null);
      setQuestionStartTime(null);
      setCurrentQuestionIndex(0);
      setTotalQuestions(null);
      setIsLastQuestion(false);
      setCurrentQuestionPoints(BASE_POINT_PER_QUESTION);
      pointProgress.setValue(1);
      shakeAnimation.setValue(0);

      queryClient.invalidateQueries({ queryKey: ["list-match-round"] });
      queryClient.invalidateQueries({ queryKey: ["list-user-pokemon-round"] });
    }

    return () => setCurrentMatchId(null);
  }, [matchId, queryClient]); // Bỏ startRoundPayload khỏi dep để chỉ chạy on mount

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    if (!accessToken || !matchId) return;
    const socket = getSocket("matching", accessToken);

    // Emit join
    socket.emit("join-matching-room", { matchId });
    socket.emit("join-user-match-room", { matchId });

    const onRoundStarted = (payload: any) => {
      console.log("[ARENA] Socket: round-started");
      handleRoundStartedData(payload);
    };

    const onQuestionAnswered = (payload: any) => {
      console.log("[ARENA] Socket: question-answered", payload);
      if (payload?.answerResult?.isCorrect) setPlayerScore((prev) => prev + 1);

      const nextQ =
        payload?.nextQuestion?.nextQuestion ||
        payload?.nextQuestion ||
        payload?.question;
      if (nextQ) {
        const qBank = nextQ.questionBank || nextQ;
        const ans = qBank.answers || nextQ.answers || [];

        const parseAnswerText = (a: any) =>
          a.answerJp
            ? a.answerJp
              .split("+")
              .find((p: string) => p.startsWith("vi:"))
              ?.replace("vi:", "") || a.answerJp
            : a.answer || a.text || a;
        const opts = ans.map(parseAnswerText);

        const nextRoundQuestionId = nextQ.roundQuestionId || nextQ.id;
        setCurrentQuestion({
          id: qBank.id,
          question: qBank.questionJp || nextQ.question,
          options: opts,
          answers: ans,
          correctAnswer: ans.findIndex((a: any) => a.isCorrect),
          endTimeQuestion: nextQ.endTimeQuestion,
          roundQuestionId: nextRoundQuestionId,
          debuff: nextQ.debuff,
        });

        if (nextQ.debuff) {
          setUpcomingDebuff({
            debuff: nextQ.debuff,
            roundQuestionId: nextRoundQuestionId,
          });
        } else {
          setUpcomingDebuff(null);
        }

        if (nextQ.endTimeQuestion && nextQ.timeLimitMs) {
          const end = new Date(nextQ.endTimeQuestion).getTime();
          const theoreticalStart = end - nextQ.timeLimitMs;
          const newOffset = theoreticalStart - Date.now();
          setServerTimeOffset(newOffset);
          const now = Date.now() + newOffset;
          const rem = Math.max(0, Math.floor((end - now) / 1000));
          const max = Math.floor(nextQ.timeLimitMs / 1000);
          setQuestionTimeRemaining(Math.min(rem, max));
        } else if (nextQ.endTimeQuestion) {
          const end = new Date(nextQ.endTimeQuestion).getTime();
          const now = Date.now() + useMatchingStore.getState().serverTimeOffset;
          setQuestionTimeRemaining(Math.max(0, Math.floor((end - now) / 1000)));
        }

        setQuestionStartTime(Date.now());
        setCurrentQuestionIndex((p) => p + 1);
        setIsWaitingForOpponent(false);
        setIsAnswerSubmitted(false);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setIsWaitingForOpponent(false);
      }
    };

    const onQuestionCompleted = (payload: any) => {
      setShowResult(true);
      if (payload?.playerCorrect) setPlayerScore((prev) => prev + 1);
      if (payload?.opponentCorrect) setOpponentScore((prev) => prev + 1);
      setIsWaitingForOpponent(true);
    };

    const onRoundCompleted = () => {
      setRoundStarted(false);
      setCurrentQuestion(null);
      setIsWaitingForOpponent(false);
    };

    const onMatchCompleted = (payload: any) => {
      setBattleComplete(true);
      setLastMatchResult(payload);
      if (payload?.matchId)
        router.replace({
          pathname: "/(app)/(battle)/result",
          params: { matchId: payload.matchId },
        });
    };

    socket.on("round-started", onRoundStarted);
    socket.on("question-answered", onQuestionAnswered);
    socket.on("next-question", onQuestionAnswered);
    socket.on("question-completed", onQuestionCompleted);
    socket.on("round-completed", onRoundCompleted);
    socket.on("match-completed", onMatchCompleted);
    socket.on("MATCH_COMPLETED", onMatchCompleted);
    socket.on("waiting-for-opponent", () => setIsWaitingForOpponent(true));

    return () => {
      socket.off("round-started", onRoundStarted);
      socket.off("question-answered", onQuestionAnswered);
      socket.off("next-question", onQuestionAnswered);
      socket.off("question-completed", onQuestionCompleted);
      socket.off("round-completed", onRoundCompleted);
      socket.off("match-completed", onMatchCompleted);
      socket.off("MATCH_COMPLETED", onMatchCompleted);
      socket.off("waiting-for-opponent");
    };
  }, [accessToken, matchId]);

  useEffect(() => {
    if (
      !upcomingDebuff?.roundQuestionId ||
      !currentQuestion?.roundQuestionId
    ) {
      return;
    }

    if (upcomingDebuff.roundQuestionId === currentQuestion.roundQuestionId) {
      if (upcomingDebuffTimeoutRef.current) {
        clearTimeout(upcomingDebuffTimeoutRef.current);
      }
      upcomingDebuffTimeoutRef.current = setTimeout(() => {
        setUpcomingDebuff(null);
        upcomingDebuffTimeoutRef.current = null;
      }, 2000);
    }

    return () => {
      if (upcomingDebuffTimeoutRef.current) {
        clearTimeout(upcomingDebuffTimeoutRef.current);
        upcomingDebuffTimeoutRef.current = null;
      }
    };
  }, [currentQuestion?.roundQuestionId, upcomingDebuff]);

  // Timer
  useEffect(() => {
    if (
      !currentQuestion?.endTimeQuestion ||
      questionTimeRemaining === null ||
      questionTimeRemaining <= 0
    ) {
      if (
        questionTimeRemaining === 0 &&
        currentQuestion &&
        !isAnswerSubmitted &&
        selectedAnswer !== null
      ) {
        handleSubmitAnswer();
      }
      return;
    }
    const timer = setTimeout(() => {
      const end = new Date(currentQuestion.endTimeQuestion).getTime();
      const now = Date.now() + serverTimeOffset;
      setQuestionTimeRemaining(Math.max(0, Math.floor((end - now) / 1000)));
    }, 1000);
    return () => clearTimeout(timer);
  }, [
    questionTimeRemaining,
    currentQuestion,
    isAnswerSubmitted,
    selectedAnswer,
    serverTimeOffset,
  ]);

  // Helpers: Pokemon Image Logic
  const playerPokemon = useMemo(() => {
    if (roundData?.participant?.selectedUserPokemon?.pokemon) {
      return {
        pokemon: roundData.participant.selectedUserPokemon.pokemon,
      } as any;
    }
    if (!matchRound) return null;
    const player = matchRound.match.participants.find((p) =>
      currentUserId !== undefined
        ? p.user.id === currentUserId
        : p.user.name === "Bạn"
    );
    const round = matchRound.rounds.find(
      (r) =>
        r.roundNumber === roundNumber ||
        matchRound.rounds.indexOf(r) ===
        (roundNumber === "ONE" ? 0 : roundNumber === "TWO" ? 1 : 2)
    );
    if (!round) return null;
    const participant = round.participants.find(
      (rp) => rp.matchParticipantId === player?.id
    );
    // Fallback direct object or find in owned
    if (participant?.selectedUserPokemon?.pokemon)
      return { pokemon: participant.selectedUserPokemon.pokemon } as any;
    const pId =
      participant?.selectedUserPokemon?.pokemon?.id ||
      participant?.selectedUserPokemonId;
    return ownedPokemons?.find((p) => p?.pokemon?.id === pId) || null;
  }, [roundData, matchRound, currentUserId, roundNumber, ownedPokemons]);

  const opponentPokemon = useMemo(() => {
    if (roundData?.opponent?.selectedUserPokemon?.pokemon) {
      return { pokemon: roundData.opponent.selectedUserPokemon.pokemon } as any;
    }
    if (!matchRound) return null;
    const opponent = matchRound.match.participants.find((p) =>
      currentUserId !== undefined
        ? p.user.id !== currentUserId
        : p.user.name !== "Bạn"
    );
    const round = matchRound.rounds.find(
      (r) =>
        r.roundNumber === roundNumber ||
        matchRound.rounds.indexOf(r) ===
        (roundNumber === "ONE" ? 0 : roundNumber === "TWO" ? 1 : 2)
    );
    if (!round) return null;
    const participant = round.participants.find(
      (rp) => rp.matchParticipantId === opponent?.id
    );
    if (participant?.selectedUserPokemon?.pokemon)
      return { pokemon: participant.selectedUserPokemon.pokemon } as any;
    return null;
  }, [roundData, matchRound, currentUserId, roundNumber]);

  // ... (Giữ nguyên các hàm helper tính điểm, animation, handleSelectAnswer, handleSubmitAnswer) ...
  const calculatePointsFromMs = (elapsedMs: number) => {
    const elapsedSeconds = Math.max(0, elapsedMs / 1000);
    const raw = BASE_POINT_PER_QUESTION * (1 - elapsedSeconds / 60);
    return Math.max(MIN_POINT_PER_QUESTION, Math.round(raw));
  };

  useEffect(() => {
    if (
      !questionStartTime ||
      !currentQuestion ||
      isAnswerSubmitted ||
      isWaitingForOpponent
    )
      return;
    let rafId: number;
    let lastUpdate = 0;
    const tick = (t: number) => {
      if (
        !questionStartTime ||
        !currentQuestion ||
        isAnswerSubmitted ||
        isWaitingForOpponent
      )
        return;
      if (!lastUpdate || t - lastUpdate >= 100) {
        lastUpdate = t;
        const elapsed = Date.now() - questionStartTime;
        const pts = calculatePointsFromMs(elapsed);
        setCurrentQuestionPoints(pts);
        const ratio =
          (pts - MIN_POINT_PER_QUESTION) /
          (BASE_POINT_PER_QUESTION - MIN_POINT_PER_QUESTION);
        pointProgress.setValue(Math.max(0, Math.min(1, ratio)));
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    questionStartTime,
    currentQuestion,
    isAnswerSubmitted,
    isWaitingForOpponent,
    pointProgress,
  ]);

  useEffect(() => {
    if (
      !playerPokemon ||
      !opponentPokemon ||
      !playerPokemon.pokemon ||
      !opponentPokemon.pokemon
    )
      return;
    const playerType = playerPokemon.pokemon.types?.[0]?.type_name;
    const opponentType = opponentPokemon.pokemon.types?.[0]?.type_name;
    if (!playerType || !opponentType) return;
    const playerStrong =
      TYPE_MATCHUPS[playerType as keyof typeof TYPE_MATCHUPS]?.strongAgainst ||
      [];
    const opponentStrong =
      TYPE_MATCHUPS[opponentType as keyof typeof TYPE_MATCHUPS]
        ?.strongAgainst || [];
    if (playerStrong.includes(opponentType as never)) {
      setTypeAdvantage("player");
      setShowFog(true);
      setTimeout(() => setShowFog(false), 2000);
    } else if (opponentStrong.includes(playerType as never)) {
      setTypeAdvantage("opponent");
      setShowConfusion(true);
      setTimeout(() => setShowConfusion(false), 2000);
      if (!isAnswerSubmitted && roundStarted && !isWaitingForOpponent) {
        const shakeLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(shakeAnimation, {
              toValue: 10,
              duration: 50,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
              toValue: -10,
              duration: 50,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
              toValue: 10,
              duration: 50,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
              toValue: 0,
              duration: 50,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          { iterations: 20 }
        );
        shakeLoop.start();
        setTimeout(() => shakeLoop.stop(), 2000);
      }
    } else {
      setTypeAdvantage(null);
    }
  }, [
    playerPokemon,
    opponentPokemon,
    shakeAnimation,
    isAnswerSubmitted,
    roundStarted,
    isWaitingForOpponent,
  ]);

  const handleSelectAnswer = (idx: number) => {
    if (isAnswerSubmitted || !currentQuestion || isWaitingForOpponent) return;
    let finalAnswer = idx;
    if (typeAdvantage === "opponent" && Math.random() < 0.3) {
      const options = currentQuestion.options || [];
      const wrong = options
        .map((_: any, i: number) => i)
        .filter(
          (i: number) => i !== currentQuestion.correctAnswer && i !== idx
        );
      if (wrong.length > 0)
        finalAnswer = wrong[Math.floor(Math.random() * wrong.length)];
    }
    setSelectedAnswer(finalAnswer);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !currentQuestion) return;
    setIsAnswerSubmitted(true);
    try {
      await battleService.submitAnswer(currentQuestion.roundQuestionId, {
        answerId: currentQuestion.answers[selectedAnswer].id,
        timeAnswerMs: Date.now() - (questionStartTime || 0),
      });
      if (isLastQuestion) {
        setIsWaitingForOpponent(true);
        setCurrentQuestion(null);
      }
    } catch (e) {
      setIsAnswerSubmitted(false);
    }
  };

  if (isLoadingMatchRound || !matchId) {
    return (
      <ThemedView style={styles.container}>
        <ImageBackground
          source={require("../../../../assets/images/list_pokemon_bg.png")}
          style={styles.bg}
          imageStyle={styles.bgImage}
        >
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#22d3ee" />
            <Text className="text-white text-center text-lg font-bold">
              {t("battle.arena.loading_match_info")}
            </Text>
          </View>
        </ImageBackground>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ImageBackground
        source={require("../../../../assets/images/list_pokemon_bg.png")}
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <TWLinearGradient
          colors={[
            "rgba(17,24,39,0.85)",
            "rgba(17,24,39,0.6)",
            "rgba(17,24,39,0.85)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overlay}
        />

        <View className="px-5 pt-16 pb-6 flex-1">
          {/* Header */}
          <View className="flex-row justify-between mb-4">
            <View className="flex-row gap-3 items-center">
              <Text className="text-yellow-400 font-bold text-xl">
                {t("battle.arena.title")}
              </Text>
              <View className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full">
                <Text className="text-white font-bold text-xs">
                  {t("battle.arena.round", { round: currentRound })}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2 items-center">
              {isWaitingForOpponent && (
                <ActivityIndicator size="small" color="gray" />
              )}
              <Clock
                size={16}
                color={
                  isWaitingForOpponent
                    ? "#fbbf24"
                    : questionTimeRemaining !== null &&
                      questionTimeRemaining < 10
                      ? "#ef4444"
                      : "#64748b"
                }
              />
              <Text
                style={{
                  color: isWaitingForOpponent
                    ? "#fbbf24"
                    : questionTimeRemaining !== null &&
                      questionTimeRemaining < 10
                      ? "#ef4444"
                      : "#94a3b8",
                }}
              >
                {isWaitingForOpponent
                  ? t("battle.arena.waiting_opponent")
                  : questionTimeRemaining !== null
                    ? `${Math.floor(questionTimeRemaining / 60)}:${String(questionTimeRemaining % 60).padStart(2, "0")}`
                    : t("battle.arena.turn", { turn: currentTurn })}
              </Text>
            </View>
          </View>

          {/* Players */}
          <View className="flex-row justify-between items-center mb-6">
            <View className="items-center flex-1">
              {opponentPokemon?.pokemon?.imageUrl && (
                <Image
                  source={{ uri: opponentPokemon.pokemon.imageUrl }}
                  style={{ width: 80, height: 80 }}
                  resizeMode="contain"
                />
              )}
              <Text className="text-gray-200 font-bold mt-2">
                {t("battle.arena.opponent_label")}
              </Text>
            </View>
            <View className="px-4 py-2 bg-black/70 rounded-full mx-4">
              <Text className="text-white font-bold">
                {t("battle.arena.vs")}
              </Text>
            </View>
            <View className="items-center flex-1">
              {playerPokemon?.pokemon?.imageUrl && (
                <Image
                  source={{ uri: playerPokemon.pokemon.imageUrl }}
                  style={{ width: 80, height: 80 }}
                  resizeMode="contain"
                />
              )}
              <Text className="text-gray-200 font-bold mt-2">
                {t("battle.arena.you_label")}
              </Text>
            </View>
          </View>

          {/* Type Advantage UI */}
          {typeAdvantage && (
            <View className="px-5 mb-4">
              <View
                className={`flex-row items-center justify-center gap-2 py-2 px-4 rounded-full ${typeAdvantage === "player" ? "bg-green-500/20" : "bg-red-500/20"}`}
              >
                {typeAdvantage === "player" ? (
                  <>
                    <Zap size={16} color="#86efac" />
                    <Text className="text-green-300 font-bold text-xs">
                      {t("battle.arena.type_advantage_player")}
                    </Text>
                  </>
                ) : (
                  <>
                    <Shield size={16} color="#fca5a5" />
                    <Text className="text-red-300 font-bold text-xs">
                      {t("battle.arena.type_advantage_opponent")}
                    </Text>
                  </>
                )}
              </View>
            </View>
          )}

          {upcomingDebuff?.debuff && (
            <View className="px-5 mb-3">
              <View className="flex-row items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3">
                <AlertTriangle size={20} color="#fbbf24" />
                <View className="flex-1">
                  <Text className="text-amber-200 font-bold text-xs tracking-wide uppercase">
                    {t("battle.arena.debuff.next_turn_warning_label")}
                  </Text>
                  <Text className="text-amber-50 text-sm font-semibold">
                    {t("battle.arena.debuff.next_turn_warning_generic")}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {currentDebuffDisplay && (
            <View className="px-5 mb-3">
              <View className="flex-row items-center gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3">
                <ShieldAlert size={20} color="#f87171" />
                <View className="flex-1">
                  <Text className="text-red-200 font-bold text-xs tracking-wide uppercase">
                    {t("battle.arena.debuff.affected_by")}
                  </Text>
                  <Text className="text-white font-semibold">
                    {currentDebuffDisplay.title}
                  </Text>
                  {currentDebuffDisplay.description ? (
                    <Text className="text-red-100 text-xs mt-1">
                      {currentDebuffDisplay.description}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          )}

          {/* Content */}
          {(!roundStarted && !currentQuestion) ||
            (roundStarted && !currentQuestion && !isWaitingForOpponent) ? (
            <View className="flex-1 justify-center items-center bg-black/40 rounded-2xl p-6">
              <ActivityIndicator size="large" color="#22d3ee" />
              <Text className="text-gray-400 mt-4 font-bold">
                {t("battle.arena.waiting_round_start")}
              </Text>
            </View>
          ) : isWaitingForOpponent ? (
            <View className="flex-1 justify-center items-center bg-black/40 rounded-2xl p-6">
              <ActivityIndicator size="large" color="#fbbf24" />
              <Text className="text-yellow-400 mt-4 font-bold">
                {t("battle.arena.waiting_opponent_complete")}
              </Text>
            </View>
          ) : (
            <DiscomfortVision
              debuff={currentQuestion?.debuff}
              style={{ borderRadius: 24, overflow: "hidden" }}
            >
              <TWLinearGradient
                colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
                style={{ borderRadius: 24, padding: 2 }}
              >
                <View className="bg-black/40 rounded-2xl p-6">
                  <Text className="text-yellow-400 font-bold text-sm mb-2">
                    {t("battle.arena.question_label")}
                  </Text>
                  <Text className="text-white text-lg font-bold mb-4 leading-7">
                    {currentQuestion?.question}
                  </Text>

                  <View className="mb-6">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400 font-bold">
                        {t("battle.arena.points_this_turn")}
                      </Text>
                      <Text className="text-yellow-400 font-bold">
                        {currentQuestionPoints}
                      </Text>
                    </View>
                    <View className="h-2.5 bg-gray-700/50 rounded-full overflow-hidden">
                      <Animated.View
                        style={{
                          height: "100%",
                          width: pointProgressWidth,
                          backgroundColor: "#38bdf8",
                        }}
                      />
                    </View>
                  </View>

                  <View className="gap-3">
                    {currentQuestion?.options?.map((opt: any, idx: number) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect =
                        showResult && idx === currentQuestion.correctAnswer;
                      const isWrong =
                        showResult &&
                        isSelected &&
                        idx !== currentQuestion.correctAnswer;
                      const showFeedback = showResult && (isCorrect || isWrong);
                      return (
                        <Animated.View
                          key={idx}
                          style={
                            typeAdvantage === "opponent" &&
                              !isAnswerSubmitted &&
                              roundStarted
                              ? { transform: [{ translateX: shakeAnimation }] }
                              : {}
                          }
                        >
                          <HapticPressable
                            onPress={() => handleSelectAnswer(idx)}
                            disabled={isAnswerSubmitted}
                            className={`p-4 rounded-2xl border-2 flex-row justify-between items-center ${showFeedback ? (isCorrect ? "border-green-500 bg-green-500/20" : "border-red-500 bg-red-500/20") : isSelected ? "border-cyan-400 bg-cyan-500/20" : "border-white/20 bg-white/5"}`}
                          >
                            <Text
                              className={`font-bold flex-1 ${showFeedback ? (isCorrect ? "text-green-300" : isWrong ? "text-red-300" : "text-gray-200") : "text-gray-200"}`}
                            >
                              {opt}
                            </Text>
                            {showFeedback &&
                              (isCorrect ? (
                                <CheckCircle size={24} color="#22c55e" />
                              ) : (
                                <XCircle size={24} color="#ef4444" />
                              ))}
                          </HapticPressable>
                        </Animated.View>
                      );
                    })}
                  </View>

                  {!isAnswerSubmitted && selectedAnswer !== null && (
                    <HapticPressable
                      onPress={handleSubmitAnswer}
                      className="mt-6 rounded-2xl overflow-hidden"
                    >
                      <TWLinearGradient
                        colors={["#22c55e", "#16a34a"]}
                        style={{ paddingVertical: 16 }}
                      >
                        <Text className="text-white font-bold text-center text-base">
                          {t("battle.arena.confirm_button")}
                        </Text>
                      </TWLinearGradient>
                    </HapticPressable>
                  )}
                </View>
              </TWLinearGradient>
            </DiscomfortVision>
          )}
        </View>
      </ImageBackground>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1 },
  bgImage: { resizeMode: "cover" },
  overlay: { ...StyleSheet.absoluteFillObject },
});
