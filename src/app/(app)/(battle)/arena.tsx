import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { HapticPressable } from "@components/HapticPressable";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { getSocket } from "@configs/socket";
import useAuth from "@hooks/useAuth";
import { useListMatchRound } from "@hooks/useBattle";
import useOwnedPokemons from "@hooks/useOwnedPokemons";
import { IBattleMatchRound, ISubmitAnswer } from "@models/battle/battle.response";
import battleService from "@services/battle";
import { useAuthStore } from "@stores/auth/auth.config";
import { useMatchingStore } from "@stores/matching/matching.config";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Award, CheckCircle, Clock, Shield, XCircle, Zap } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    Image,
    ImageBackground,
    StyleSheet,
    View
} from "react-native";
import { TYPE_MATCHUPS } from "../../../../mock-data/type-matchups";

const BASE_POINT_PER_QUESTION = 100;
const MIN_POINT_PER_QUESTION = 50;

interface BattleArenaScreenProps { }

export default function BattleArenaScreen({ }: BattleArenaScreenProps) {
    const router = useRouter();
    const params = useLocalSearchParams();
    const matchId = params.matchId as string;
    const roundNumber = params.roundNumber as string;
    const { ownedPokemons } = useOwnedPokemons();
    const { user } = useAuth();
    const currentUserId = user?.data?.id as number | undefined;
    const accessToken = useAuthStore((s) => s.accessToken);
    const setCurrentMatchId = useMatchingStore((s) => s.setCurrentMatchId);
    const setLastMatchResult = useMatchingStore((s) => s.setLastMatchResult);

    // Get match round data
    const { data: matchRound, isLoading: isLoadingMatchRound } = useListMatchRound() as {
        data: IBattleMatchRound;
        isLoading: boolean;
    };

    // Battle state
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [battleComplete, setBattleComplete] = useState(false);
    const [matchSummary, setMatchSummary] = useState<{
        winnerId: number | null;
        winnerName: string;
        eloGained: number;
        eloLost: number;
    } | null>(null);
    const [currentRound, setCurrentRound] = useState(() => {
        const initialRound = params.roundNumber as string;
        if (initialRound === "ONE") return 1;
        if (initialRound === "TWO") return 2;
        if (initialRound === "THREE") return 3;
        return 1;
    });
    const [playerScore, setPlayerScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [currentTurn, setCurrentTurn] = useState(1);
    const [playerPokemonIndex, setPlayerPokemonIndex] = useState(0);
    const [opponentPokemonIndex, setOpponentPokemonIndex] = useState(0);
    const [typeAdvantage, setTypeAdvantage] = useState<"player" | "opponent" | null>(null);
    const [showFog, setShowFog] = useState(false);
    const [showConfusion, setShowConfusion] = useState(false);
    const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [roundStarted, setRoundStarted] = useState(false);
    const [roundData, setRoundData] = useState<{
        participant?: any;
        opponent?: any;
    } | null>(null);
    const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number | null>(null);
    const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
    const [isLastQuestion, setIsLastQuestion] = useState(false);
    const shakeAnimation = useRef(new Animated.Value(0)).current;
    const [currentQuestionPoints, setCurrentQuestionPoints] = useState(BASE_POINT_PER_QUESTION);
    const pointProgress = useRef(new Animated.Value(1)).current;
    const pointProgressWidth = pointProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    // Set matchId in store for layout
    useEffect(() => {
        if (matchId) {
            setCurrentMatchId(matchId);
        }
        return () => {
            setCurrentMatchId(null);
        };
    }, [matchId, setCurrentMatchId]);

    // Get player and opponent Pokemon from round-started event or matchRound
    const playerPokemon = useMemo(() => {
        // Priority: roundData from socket > matchRound
        if (roundData?.participant?.selectedUserPokemon?.pokemon) {
            const pokemonData = roundData.participant.selectedUserPokemon.pokemon;
            if (!pokemonData) return null;
            // Find in ownedPokemons or create from data
            const found = ownedPokemons?.find(p => p?.pokemon?.id === pokemonData.id);
            if (found) return found;
            // Create wrapper object if not found in ownedPokemons
            return {
                pokemon: pokemonData,
            } as any;
        }

        if (!matchRound) return null;
        const player = matchRound.match.participants.find((p) => {
            if (currentUserId !== undefined) return p.user.id === currentUserId;
            return p.user.name === "Bạn";
        });
        const round = matchRound.rounds.find((r) => {
            const roundNum = roundNumber === "ONE" ? 0 : roundNumber === "TWO" ? 1 : 2;
            return r.roundNumber === roundNumber || matchRound.rounds.indexOf(r) === roundNum;
        });
        if (!round) return null;
        const participant = round.participants.find((rp) => rp.matchParticipantId === player?.id);
        const pokemonId = participant?.selectedUserPokemon?.pokemon?.id || participant?.selectedUserPokemonId;
        return ownedPokemons?.find(p => p?.pokemon?.id === pokemonId) || null;
    }, [roundData, matchRound, currentUserId, roundNumber, ownedPokemons]);

    const opponentPokemon = useMemo(() => {
        // Priority: roundData from socket > matchRound
        if (roundData?.opponent?.selectedUserPokemon?.pokemon) {
            const pokemonData = roundData.opponent.selectedUserPokemon.pokemon;
            if (!pokemonData) return null;
            // Find in ownedPokemons or create from data
            const found = ownedPokemons?.find(p => p?.pokemon?.id === pokemonData.id);
            if (found) return found;
            // Create wrapper object if not found in ownedPokemons
            return {
                pokemon: pokemonData,
            } as any;
        }

        if (!matchRound) return null;
        const opponent = matchRound.match.participants.find((p) => {
            if (currentUserId !== undefined) return p.user.id !== currentUserId;
            return p.user.name !== "Bạn";
        });
        const round = matchRound.rounds.find((r) => {
            const roundNum = roundNumber === "ONE" ? 0 : roundNumber === "TWO" ? 1 : 2;
            return r.roundNumber === roundNumber || matchRound.rounds.indexOf(r) === roundNum;
        });
        if (!round) return null;
        const participant = round.participants.find((rp) => rp.matchParticipantId === opponent?.id);
        const pokemonId = participant?.selectedUserPokemon?.pokemon?.id || participant?.selectedUserPokemonId;
        return ownedPokemons?.find(p => p?.pokemon?.id === pokemonId) || null;
    }, [roundData, matchRound, currentUserId, roundNumber, ownedPokemons]);

    // Question countdown timer
    useEffect(() => {
        if (!currentQuestion?.endTimeQuestion || questionTimeRemaining === null || questionTimeRemaining <= 0) {
            if (questionTimeRemaining === 0 && currentQuestion) {
                // Time's up - auto submit if not already submitted
                if (!isAnswerSubmitted && selectedAnswer !== null) {
                    handleSubmitAnswer();
                }
            }
            return;
        }

        const timer = setTimeout(() => {
            const endTime = new Date(currentQuestion.endTimeQuestion).getTime();
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            setQuestionTimeRemaining(remaining);
        }, 1000);

        return () => clearTimeout(timer);
    }, [questionTimeRemaining, currentQuestion, isAnswerSubmitted, selectedAnswer]);

    // Compute points from elapsed time
    const calculatePointsFromMs = (elapsedMs: number) => {
        const elapsedSeconds = Math.max(0, elapsedMs / 1000);
        const raw = BASE_POINT_PER_QUESTION * (1 - elapsedSeconds / 60);
        return Math.max(MIN_POINT_PER_QUESTION, Math.round(raw));
    };

    // Live points bar update (smooth) while answering
    useEffect(() => {
        if (!questionStartTime || !currentQuestion || isAnswerSubmitted || isWaitingForOpponent) return;
        let rafId: number;
        let lastUpdate = 0;

        const tick = (t: number) => {
            if (!questionStartTime || !currentQuestion || isAnswerSubmitted || isWaitingForOpponent) return;
            // throttle ~60fps but compute only every ~100ms for stability
            if (!lastUpdate || t - lastUpdate >= 100) {
                lastUpdate = t;
                const elapsed = Date.now() - questionStartTime;
                const pts = calculatePointsFromMs(elapsed);
                setCurrentQuestionPoints(pts);
                const ratio = (pts - MIN_POINT_PER_QUESTION) / (BASE_POINT_PER_QUESTION - MIN_POINT_PER_QUESTION);
                pointProgress.setValue(Math.max(0, Math.min(1, ratio)));
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [questionStartTime, currentQuestion, isAnswerSubmitted, isWaitingForOpponent, pointProgress]);

    // Check type advantage
    useEffect(() => {
        if (!playerPokemon || !opponentPokemon || !playerPokemon.pokemon || !opponentPokemon.pokemon) return;

        const playerType = playerPokemon.pokemon.types?.[0]?.type_name;
        const opponentType = opponentPokemon.pokemon.types?.[0]?.type_name;

        if (!playerType || !opponentType) return;

        const playerStrongAgainst = TYPE_MATCHUPS[playerType as keyof typeof TYPE_MATCHUPS]?.strongAgainst as string[] || [];
        const opponentStrongAgainst = TYPE_MATCHUPS[opponentType as keyof typeof TYPE_MATCHUPS]?.strongAgainst as string[] || [];

        if (playerStrongAgainst.includes(opponentType)) {
            setTypeAdvantage("player");
            setShowFog(true);
            setTimeout(() => setShowFog(false), 2000);
        } else if (opponentStrongAgainst.includes(playerType)) {
            setTypeAdvantage("opponent");
            setShowConfusion(true);
            setTimeout(() => setShowConfusion(false), 2000);

            // Start shake animation
            if (!isAnswerSubmitted && roundStarted && !isWaitingForOpponent) {
                const shakeLoop = Animated.loop(
                    Animated.sequence([
                        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                        Animated.timing(shakeAnimation, { toValue: -10, duration: 50, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                        Animated.timing(shakeAnimation, { toValue: 0, duration: 50, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    ]),
                    { iterations: 20 }
                );
                shakeLoop.start();
                setTimeout(() => shakeLoop.stop(), 2000);
            }
        } else {
            setTypeAdvantage(null);
        }
    }, [playerPokemon, opponentPokemon, shakeAnimation, isAnswerSubmitted, roundStarted, isWaitingForOpponent]);

    // Handle answer selection
    const handleSelectAnswer = (answerIndex: number) => {
        if (isAnswerSubmitted || !currentQuestion || isWaitingForOpponent) return;

        // If confused, randomly select a different answer sometimes
        let finalAnswer = answerIndex;
        if (typeAdvantage === "opponent" && Math.random() < 0.3) {
            // 30% chance to select wrong answer due to confusion
            const options = currentQuestion.options || currentQuestion.answers || [];
            const wrongAnswers = options
                .map((_: any, idx: number) => idx)
                .filter((idx: number) => {
                    const correctAnswer = currentQuestion.correctAnswer;
                    return correctAnswer !== undefined && idx !== correctAnswer && idx !== answerIndex;
                });
            if (wrongAnswers.length > 0) {
                finalAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
            }
        }

        setSelectedAnswer(finalAnswer);
    };

    // Socket events handler
    useEffect(() => {
        if (!accessToken || !matchId) return;

        const socket = getSocket("matching", accessToken);

        // Round started
        socket.on("round-started", (payload: any) => {
            console.log("Round started:", payload);
            setRoundStarted(true);

            // --- THÊM ĐOẠN NÀY ---
            if (payload?.round?.roundNumber) {
                const roundNumStr = payload.round.roundNumber; // "ONE", "TWO", etc.
                if (roundNumStr === "ONE") setCurrentRound(1);
                else if (roundNumStr === "TWO") setCurrentRound(2);
                else if (roundNumStr === "THREE") setCurrentRound(3);
            }

            // Store round data (participant and opponent Pokemon)
            if (payload?.round) {
                setRoundData({
                    participant: payload.round.participant,
                    opponent: payload.round.opponent,
                });
            }

            // Set question from firstQuestion
            if (payload?.firstQuestion) {
                const questionData = payload.firstQuestion;

                // In socket events (round-started), firstQuestion has this structure:
                // - questionData.id = questionBankId (e.g., 146) - NOT roundQuestionId
                // - questionData.roundQuestionId = roundQuestionId (e.g., 2215) - THE CORRECT ONE
                // - questionData.question = question text
                // - questionData.answers = array of answers

                // Handle both formats: direct answers or questionBank structure
                const questionBank = questionData.questionBank;
                const questionText = questionBank?.questionJp || questionData.question;
                const answers = questionBank?.answers || questionData.answers || [];

                // Parse answers - check if answerJp format or direct answer format
                const parseAnswerText = (answer: any) => {
                    if (answer.answerJp) {
                        // Parse format: "jp:ともだち+vi:Bạn bè+en:Friend"
                        const parts = answer.answerJp.split('+');
                        const viPart = parts.find((p: string) => p.startsWith('vi:'));
                        const enPart = parts.find((p: string) => p.startsWith('en:'));
                        const jpPart = parts.find((p: string) => p.startsWith('jp:'));
                        // Prefer Vietnamese, fallback to English, then Japanese
                        if (viPart) return viPart.replace('vi:', '');
                        if (enPart) return enPart.replace('en:', '');
                        if (jpPart) return jpPart.replace('jp:', '');
                        return answer.answerJp;
                    }
                    return answer.answer || answer.text || answer;
                };

                const options = answers.map(parseAnswerText);

                // Find correct answer index
                const correctAnswerIndex = answers.findIndex((ans: any) => ans.isCorrect === true);

                // CRITICAL: In socket events, roundQuestionId is in questionData.roundQuestionId field
                // NOT in questionData.id (which is questionBankId)
                const roundQuestionId = questionData.roundQuestionId || questionData.id;

                console.log("Final roundQuestionId to use:", roundQuestionId);

                if (!roundQuestionId) {
                    console.error("ERROR: roundQuestionId not found in questionData:", questionData);
                }

                // Reset points bar instantly for new question
                pointProgress.stopAnimation && pointProgress.stopAnimation();
                pointProgress.setValue(1);
                setCurrentQuestionPoints(BASE_POINT_PER_QUESTION);

                setCurrentQuestion({
                    id: questionData.id || questionBank?.id, // questionBankId for reference
                    question: questionText,
                    options: options,
                    answers: answers, // Keep original format for submission
                    correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : undefined,
                    endTimeQuestion: questionData.endTimeQuestion,
                    timeLimitMs: questionData.timeLimitMs,
                    questionType: questionBank?.questionType || questionData.questionType,
                    debuff: questionData.debuff,
                    roundQuestionId: roundQuestionId, // Use questionData.roundQuestionId (socket events)
                    orderNumber: questionData.orderNumber,
                });

                // Set countdown for question if endTimeQuestion exists
                if (questionData.endTimeQuestion) {
                    const endTime = new Date(questionData.endTimeQuestion).getTime();
                    const now = Date.now();
                    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
                    setQuestionTimeRemaining(remaining);
                }

                // Track question start time for timeAnswerMs calculation
                setQuestionStartTime(Date.now());

                // Reset question index and check if last question
                // Note: Server should provide totalQuestions or isLastQuestion in payload
                setCurrentQuestionIndex(prev => prev + 1);
                if (payload?.isLastQuestion !== undefined) {
                    setIsLastQuestion(payload.isLastQuestion);
                }
                if (payload?.totalQuestions) {
                    setTotalQuestions(payload.totalQuestions);
                }
            }

            setIsWaitingForOpponent(false);
            setSelectedAnswer(null);
            setIsAnswerSubmitted(false);
            setShowResult(false);
        });

        // Question answered - received after submitting answer (may contain next question or status update)
        socket.on("question-answered", (payload: any) => {
            console.log("Question answered event:", payload);

            // Handle answer result if present
            if (payload?.answerResult) {
                const result = payload.answerResult;

                // Update score if correct
                if (result.isCorrect) {
                    setPlayerScore(prev => prev + 1);
                }

                // Show result briefly (optional - can remove if not needed)
                // setShowResult(true);
            }

            // Handle next question - check nested structure first (nextQuestion.nextQuestion)
            const nextQuestionData = payload?.nextQuestion?.nextQuestion || payload?.nextQuestion || payload?.question || payload?.data?.questionBank || payload?.data;

            if (nextQuestionData) {
                const questionData = nextQuestionData;

                // Handle new format: questionBank structure
                const questionBank = questionData.questionBank || questionData;
                const questionText = questionBank.questionJp || questionBank.question || questionData.question;

                // Parse answers - new format has answerJp with "jp:xxx+vi:xxx+en:xxx" or direct answer
                const parseAnswerText = (answer: any) => {
                    if (answer.answerJp) {
                        // Parse format: "jp:ともだち+vi:Bạn bè+en:Friend"
                        const parts = answer.answerJp.split('+');
                        const viPart = parts.find((p: string) => p.startsWith('vi:'));
                        const enPart = parts.find((p: string) => p.startsWith('en:'));
                        const jpPart = parts.find((p: string) => p.startsWith('jp:'));
                        // Prefer Vietnamese, fallback to English, then Japanese
                        if (viPart) return viPart.replace('vi:', '');
                        if (enPart) return enPart.replace('en:', '');
                        if (jpPart) return jpPart.replace('jp:', '');
                        return answer.answerJp;
                    }
                    return answer.answer || answer.text || answer;
                };

                const answers = questionBank.answers || questionData.answers || [];
                const options = answers.map(parseAnswerText);

                // Find correct answer index
                const correctAnswerIndex = answers.findIndex((ans: any) => ans.isCorrect === true);

                const roundQuestionId = questionData.roundQuestionId || questionData.id;

                // Reset points bar instantly for next question
                pointProgress.stopAnimation && pointProgress.stopAnimation();
                pointProgress.setValue(1);
                setCurrentQuestionPoints(BASE_POINT_PER_QUESTION);

                setCurrentQuestion({
                    id: questionBank.id || questionData.id,
                    question: questionText,
                    options: options,
                    answers: answers,
                    correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : undefined,
                    endTimeQuestion: questionData.endTimeQuestion,
                    timeLimitMs: questionData.timeLimitMs,
                    questionType: questionBank.questionType || questionData.questionType,
                    debuff: questionData.debuff,
                    roundQuestionId: roundQuestionId,
                    orderNumber: questionData.orderNumber,
                });

                if (questionData.endTimeQuestion) {
                    const endTime = new Date(questionData.endTimeQuestion).getTime();
                    const now = Date.now();
                    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
                    setQuestionTimeRemaining(remaining);
                }

                setQuestionStartTime(Date.now());
                setCurrentQuestionIndex(prev => prev + 1);

                setIsWaitingForOpponent(false);
                setSelectedAnswer(null);
                setIsAnswerSubmitted(false);
                setShowResult(false);

                if (payload?.isLastQuestion !== undefined) {
                    setIsLastQuestion(payload.isLastQuestion);
                }
                if (payload?.totalQuestions) {
                    setTotalQuestions(payload.totalQuestions);
                }
            } else {
                setIsWaitingForOpponent(false);
                setSelectedAnswer(null);
                setIsAnswerSubmitted(false);
            }

            // Handle status updates (e.g., opponent has answered)
            if (payload?.status) {
                console.log("Question answered status:", payload.status);
                // Could update UI based on status
            }
        });

        // Next question received (after submitting answer) - alternative event name
        socket.on("next-question", (payload: any) => {
            console.log("Next question received:", payload);
            // Server sends next question after player answers (if not last question)
            if (payload?.question || payload?.data?.questionBank) {
                const questionData = payload?.question || payload?.data;

                // Handle new format: questionBank structure
                const questionBank = questionData.questionBank || questionData;
                const questionText = questionBank.questionJp || questionBank.question || questionData.question;

                // Parse answers
                const parseAnswerText = (answer: any) => {
                    if (answer.answerJp) {
                        const parts = answer.answerJp.split('+');
                        const viPart = parts.find((p: string) => p.startsWith('vi:'));
                        const enPart = parts.find((p: string) => p.startsWith('en:'));
                        const jpPart = parts.find((p: string) => p.startsWith('jp:'));
                        if (viPart) return viPart.replace('vi:', '');
                        if (enPart) return enPart.replace('en:', '');
                        if (jpPart) return jpPart.replace('jp:', '');
                        return answer.answerJp;
                    }
                    return answer.answer || answer.text || answer;
                };

                const answers = questionBank.answers || questionData.answers || [];
                const options = answers.map(parseAnswerText);
                const correctAnswerIndex = answers.findIndex((ans: any) => ans.isCorrect === true);

                // IMPORTANT: Prioritize roundQuestionId field (socket events) over id field
                const roundQuestionId = questionData.roundQuestionId || questionData.id;

                setCurrentQuestion({
                    id: questionBank.id || questionData.id, // Use questionBank.id for question ID
                    question: questionText,
                    options: options,
                    answers: answers,
                    correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : undefined,
                    endTimeQuestion: questionData.endTimeQuestion,
                    timeLimitMs: questionData.timeLimitMs,
                    questionType: questionBank.questionType || questionData.questionType,
                    debuff: questionData.debuff,
                    roundQuestionId: roundQuestionId, // Prioritize roundQuestionId field (socket events)
                    orderNumber: questionData.orderNumber,
                });

                if (questionData.endTimeQuestion) {
                    const endTime = new Date(questionData.endTimeQuestion).getTime();
                    const now = Date.now();
                    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
                    setQuestionTimeRemaining(remaining);
                }

                setQuestionStartTime(Date.now());
                setCurrentQuestionIndex(prev => prev + 1);
                setIsWaitingForOpponent(false);
                setSelectedAnswer(null);
                setIsAnswerSubmitted(false);
                setShowResult(false);

                if (payload?.isLastQuestion !== undefined) {
                    setIsLastQuestion(payload.isLastQuestion);
                }
                if (payload?.totalQuestions) {
                    setTotalQuestions(payload.totalQuestions);
                }
            }
        });

        // Question completed (last question - both players answered, waiting for summary)
        socket.on("question-completed", (payload: any) => {
            console.log("Question completed (last question):", payload);
            setShowResult(true);
            if (payload?.playerCorrect !== undefined) {
                if (payload.playerCorrect) {
                    setPlayerScore(prev => prev + 1);
                }
            }
            if (payload?.opponentCorrect !== undefined) {
                if (payload.opponentCorrect) {
                    setOpponentScore(prev => prev + 1);
                }
            }
            // Keep waiting for opponent on last question until round completes
            setIsWaitingForOpponent(true);
        });

        // Opponent completed
        socket.on("opponent-completed", (payload: any) => {
            console.log("Opponent completed:", payload);
            // setIsWaitingForOpponent(true);
        });

        // Waiting for opponent
        socket.on("waiting-for-opponent", (payload: any) => {
            console.log("Waiting for opponent:", payload);
            setIsWaitingForOpponent(true);

            if (currentQuestion) {
                setCurrentQuestion(null);
            }
        });

        // Round completed
        socket.on("round-completed", (payload: any) => {
            console.log("Round completed:", payload);
            setRoundStarted(false);
            setCurrentQuestion(null);
            setSelectedAnswer(null);
            setIsAnswerSubmitted(false);
            setShowResult(false);
            setIsWaitingForOpponent(false);
            setQuestionTimeRemaining(null);
            setQuestionStartTime(null);
            setRoundData(null);
            setCurrentQuestionIndex(0);
            setIsLastQuestion(false);
            setTotalQuestions(null);
            // Handle round completion logic - could navigate to next round or back to pick-pokemon
        });

        // Match completed
        socket.on("match-completed", (payload: any) => {
            console.log("Match completed:", payload);
            const winnerId = payload?.match?.winnerId ?? null;
            const winnerName =
                payload?.match?.winner?.name ||
                payload?.match?.winner?.email ||
                payload?.match?.winner?.nameJp ||
                "Người chiến thắng";
            const eloGained = payload?.match?.eloGained ?? 0;
            const eloLost = payload?.match?.eloLost ?? 0;
            setMatchSummary({
                winnerId,
                winnerName,
                eloGained,
                eloLost,
            });
            // Save result payload to store and navigate to result screen
            try {
                setLastMatchResult(payload);
            } catch (e) {
                console.warn("Failed to set last match result", e);
            }
            setBattleComplete(true);
            if (payload?.playerScore !== undefined) {
                setPlayerScore(payload.playerScore);
            }
            if (payload?.opponentScore !== undefined) {
                setOpponentScore(payload.opponentScore);
            }
            // Navigate to result route
            try {
                router.replace({
                    pathname: "/(app)/(battle)/result",
                    params: { matchId: String(payload?.matchId || payload?.match?.id || matchId) },
                } as any);
            } catch (e) {
                console.warn("Navigation to result screen failed", e);
            }
        });

        return () => {
            socket.off("round-started");
            socket.off("question-answered");
            socket.off("next-question");
            socket.off("question-completed");
            socket.off("opponent-completed");
            socket.off("waiting-for-opponent");
            socket.off("round-completed");
            socket.off("match-completed");
        };
    }, [accessToken, matchId]);

    // Handle answer submission
    const handleSubmitAnswer = async () => {
        if (selectedAnswer === null || !currentQuestion || !accessToken || !matchId || !questionStartTime) return;

        setIsAnswerSubmitted(true); // <-- (1) Khóa UI

        // Get answer ID from answers array
        const answerId = currentQuestion.answers?.[selectedAnswer]?.id;
        const roundQuestionId = currentQuestion.roundQuestionId;

        if (!answerId || !roundQuestionId) {
            console.error("Answer ID or roundQuestionId not found", {
                answerId,
                roundQuestionId,
                selectedAnswer,
                answers: currentQuestion.answers
            });
            setIsAnswerSubmitted(false); // Mở khóa nếu có lỗi
            return;
        }

        // Calculate timeAnswerMs (time spent in milliseconds)
        const timeAnswerMs = Date.now() - questionStartTime;

        try {
            // Submit answer using API
            const submitData: ISubmitAnswer = {
                answerId: answerId,
                timeAnswerMs: timeAnswerMs,
            };

            const response = await battleService.submitAnswer(roundQuestionId, submitData);

            // Check if response contains next question or indicates last question
            const responseData = response.data?.data || response.data;

            // (2) Hiển thị kết quả (đúng/sai) cho câu vừa trả lời
            if (responseData?.isCorrect !== undefined) {
                if (responseData.isCorrect) {
                    setPlayerScore(prev => prev + 1);
                }
                setShowResult(true);
            }

            // (3) KIỂM TRA QUAN TRỌNG: API có báo đây là câu cuối không?
            const isLast = isLastQuestion || // (Kiểm tra state từ round-started)
                (totalQuestions && currentQuestionIndex >= totalQuestions) || // (Kiểm tra state)
                responseData?.isLastQuestion === true; // (Kiểm tra phản hồi API)

            if (isLast) {
                // (4a) ĐÂY LÀ CÂU CUỐI: Ẩn câu hỏi và vào trạng thái chờ
                setIsWaitingForOpponent(true);
                setCurrentQuestion(null);
            } else {
                // (4b) ĐÂY KHÔNG PHẢI CÂU CUỐI:
                // Không làm gì cả.
                // UI vẫn bị khóa (isAnswerSubmitted = true).
                // Chúng ta chờ server đẩy câu hỏi mới qua socket 'next-question'.
                // Sự kiện socket (dòng 424) sẽ tự động mở khóa UI.
            }

        } catch (error: any) {
            console.error("Error submitting answer:", error.response?.data?.message || error.message);
            // Nếu API lỗi, cho phép người dùng thử lại
            setIsAnswerSubmitted(false);
        }
    };

    // Loading state
    if (isLoadingMatchRound || !matchId) {
        return (
            <ThemedView style={styles.container}>
                <ImageBackground
                    source={require("../../../../assets/images/list_pokemon_bg.png")}
                    style={styles.bg}
                    imageStyle={styles.bgImage}
                >
                    <TWLinearGradient
                        colors={["rgba(17,24,39,0.85)", "rgba(17,24,39,0.6)", "rgba(17,24,39,0.85)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.overlay}
                    />
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#22d3ee" />
                        <ThemedText style={{ color: "#93c5fd", marginTop: 16, fontSize: 16 }}>
                            Đang tải thông tin trận đấu...
                        </ThemedText>
                    </View>
                </ImageBackground>
            </ThemedView>
        );
    }

    // Victory/Loss screen
    if (battleComplete) {
        const playerWon = matchSummary && currentUserId !== undefined && matchSummary.winnerId !== null
            ? matchSummary.winnerId === currentUserId
            : playerScore > opponentScore;
        const winnerName = matchSummary?.winnerName || (playerWon ? "Bạn" : "Đối thủ");
        const eloChange = matchSummary
            ? playerWon
                ? matchSummary.eloGained
                : -matchSummary.eloLost
            : 0;
        const eloChangeText = `${eloChange >= 0 ? "+" : ""}${eloChange} ELO`;

        return (
            <ThemedView style={styles.container}>
                <ImageBackground
                    source={require("../../../../assets/images/list_pokemon_bg.png")}
                    style={styles.bg}
                    imageStyle={styles.bgImage}
                >
                    <TWLinearGradient
                        colors={["rgba(17,24,39,0.85)", "rgba(17,24,39,0.6)", "rgba(17,24,39,0.85)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.overlay}
                    />
                    <View className="flex-1 items-center justify-center px-5">
                        <Animated.View className="items-center">
                            <TWLinearGradient
                                colors={playerWon ? ["#22c55e", "#16a34a"] : ["#ef4444", "#dc2626"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ padding: 4, borderRadius: 999, marginBottom: 24 }}
                            >
                                <View className="w-32 h-32 rounded-full bg-black/70 items-center justify-center">
                                    {playerWon ? (
                                        <Award size={64} color="#ffffff" />
                                    ) : (
                                        <XCircle size={64} color="#ffffff" />
                                    )}
                                </View>
                            </TWLinearGradient>
                            <ThemedText style={{ color: playerWon ? "#22c55e" : "#ef4444", fontSize: 32, fontWeight: "900", marginBottom: 8 }}>
                                {playerWon ? "THẮNG" : "THUA"}
                            </ThemedText>
                            <ThemedText style={{ color: "#fbbf24", fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 12 }}>
                                Chúc mừng {winnerName}!
                            </ThemedText>
                            <ThemedText style={{ color: "#cbd5e1", fontSize: 18, textAlign: "center", marginBottom: 24 }}>
                                {playerScore} - {opponentScore}
                            </ThemedText>
                            <View className="px-6 py-3 rounded-2xl border border-white/20 bg-white/10">
                                <ThemedText style={{ color: "#93c5fd", fontSize: 16 }}>
                                    {eloChangeText}
                                </ThemedText>
                            </View>
                        </Animated.View>
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
                    colors={["rgba(17,24,39,0.85)", "rgba(17,24,39,0.6)", "rgba(17,24,39,0.85)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.overlay}
                />

                {/* Header */}
                <View className="px-5 pt-16 pb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-3">
                            <ThemedText style={{ color: "#fbbf24", fontSize: 20, fontWeight: "800" }}>
                                BATTLE ARENA
                            </ThemedText>
                            <View className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40">
                                <ThemedText style={{ color: "#22d3ee", fontSize: 12, fontWeight: "700" }}>
                                    ROUND {currentRound}/3
                                </ThemedText>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-2">
                            {isWaitingForOpponent && (
                                <ActivityIndicator size="small" color="#64748b" />
                            )}
                            <Clock size={16} color={isWaitingForOpponent ? "#fbbf24" : questionTimeRemaining !== null && questionTimeRemaining < 10 ? "#ef4444" : "#64748b"} />
                            <ThemedText style={{
                                color: isWaitingForOpponent
                                    ? "#fbbf24"
                                    : questionTimeRemaining !== null && questionTimeRemaining < 10
                                        ? "#ef4444"
                                        : "#94a3b8",
                                fontSize: 14
                            }}>
                                {isWaitingForOpponent
                                    ? "Đợi đối thủ..."
                                    : questionTimeRemaining !== null
                                        ? `${Math.floor(questionTimeRemaining / 60)}:${String(questionTimeRemaining % 60).padStart(2, "0")}`
                                        : `Turn ${currentTurn}`}
                            </ThemedText>
                        </View>
                    </View>

                    {/* Score Display */}
                    <View className="flex-row items-center justify-between">
                        {/* Opponent */}
                        <View className="items-center flex-1">
                            {opponentPokemon?.pokemon?.imageUrl && (
                                <Image
                                    source={{ uri: opponentPokemon.pokemon.imageUrl }}
                                    style={{ width: 80, height: 80 }}
                                    resizeMode="contain"
                                />
                            )}
                            <ThemedText style={{ color: "#e5e7eb", fontSize: 14, fontWeight: "600", marginTop: 8 }}>
                                Đối thủ
                            </ThemedText>
                            <ThemedText style={{ color: "#ef4444", fontSize: 24, fontWeight: "900", marginTop: 4 }}>
                                {opponentScore}
                            </ThemedText>
                        </View>

                        {/* VS */}
                        <TWLinearGradient
                            colors={["#ec4899", "#8b5cf6"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ padding: 2, borderRadius: 999, marginHorizontal: 20 }}
                        >
                            <View className="px-4 py-2 rounded-full bg-black/70">
                                <ThemedText style={{ color: "#ffffff", fontWeight: "700", fontSize: 16 }}>VS</ThemedText>
                            </View>
                        </TWLinearGradient>

                        {/* Player */}
                        <View className="items-center flex-1">
                            {playerPokemon?.pokemon?.imageUrl && (
                                <Image
                                    source={{ uri: playerPokemon.pokemon.imageUrl }}
                                    style={{ width: 80, height: 80 }}
                                    resizeMode="contain"
                                />
                            )}
                            <ThemedText style={{ color: "#e5e7eb", fontSize: 14, fontWeight: "600", marginTop: 8 }}>
                                Bạn
                            </ThemedText>
                            <ThemedText style={{ color: "#22c55e", fontSize: 24, fontWeight: "900", marginTop: 4 }}>
                                {playerScore}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Type Advantage Indicators */}
                {typeAdvantage && (
                    <View className="px-5 mb-4">
                        <View className={`flex-row items-center justify-center gap-2 py-2 px-4 rounded-full ${typeAdvantage === "player" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                            {typeAdvantage === "player" ? (
                                <>
                                    <Zap size={16} color="#86efac" />
                                    <ThemedText style={{ color: "#86efac", fontSize: 12, fontWeight: "700" }}>
                                        Bạn có lợi thế hệ (Fog: Đối thủ nhìn mờ!)
                                    </ThemedText>
                                </>
                            ) : (
                                <>
                                    <Shield size={16} color="#fca5a5" />
                                    <ThemedText style={{ color: "#fca5a5", fontSize: 12, fontWeight: "700" }}>
                                        Đối thủ có lợi thế (Confusion: Bạn bị nhiễu loạn!)
                                    </ThemedText>
                                </>
                            )}
                        </View>
                    </View>
                )}

                {/* Visual Effects */}
                {showFog && (
                    <View className="absolute inset-0 pointer-events-none items-center justify-center">
                        <Animated.View style={{ opacity: 0.7 }}>
                            <ThemedText style={{ fontSize: 80 }}>🌫️</ThemedText>
                        </Animated.View>
                    </View>
                )}
                {showConfusion && (
                    <View className="absolute inset-0 pointer-events-none items-center justify-center">
                        <Animated.View style={{ opacity: 0.7 }}>
                            <ThemedText style={{ fontSize: 80 }}>🌀</ThemedText>
                        </Animated.View>
                    </View>
                )}

                {/* Waiting for round to start */}
                {!roundStarted && !currentQuestion && (
                    <View className="px-5 mb-6">
                        <View className="bg-black/40 rounded-2xl p-6 items-center justify-center">
                            <ActivityIndicator size="large" color="#22d3ee" />
                            <ThemedText style={{ color: "#cbd5e1", fontSize: 16, fontWeight: "600", marginTop: 16, textAlign: "center" }}>
                                Đang chờ round bắt đầu...
                            </ThemedText>
                        </View>
                    </View>
                )}

                {/* Question Card */}
                {!isWaitingForOpponent && currentQuestion && roundStarted && (
                    <View className="px-5 mb-6">
                        <TWLinearGradient
                            colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ borderRadius: 24, padding: 2 }}
                        >
                            <View className="bg-black/40 rounded-2xl p-6">
                                <ThemedText style={{ color: "#fbbf24", fontSize: 14, fontWeight: "700", marginBottom: 8 }}>
                                    Câu hỏi
                                </ThemedText>
                                <ThemedText style={{ color: "#e5e7eb", fontSize: 18, fontWeight: "600", marginBottom: 16, lineHeight: 28 }}>
                                    {currentQuestion.question || currentQuestion.content || "Câu hỏi đang được tải..."}
                                </ThemedText>

                                {/* Points progress bar (Kahoot-style) */}
                                <View className="mb-6">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <ThemedText style={{ color: "#cbd5e1", fontSize: 14, fontWeight: "600" }}>
                                            Điểm lượt này
                                        </ThemedText>
                                        <ThemedText style={{ color: "#fbbf24", fontSize: 16, fontWeight: "700" }}>
                                            {currentQuestionPoints}
                                        </ThemedText>
                                    </View>
                                    <View style={{ height: 10, borderRadius: 999, backgroundColor: "rgba(148, 163, 184, 0.2)", overflow: "hidden" }}>
                                        <Animated.View
                                            style={{
                                                height: "100%",
                                                width: pointProgressWidth,
                                                backgroundColor: "#38bdf8",
                                            }}
                                        />
                                    </View>
                                    <ThemedText style={{ color: "#64748b", fontSize: 10, marginTop: 4 }}>
                                        Bắt đầu 100 điểm, tối thiểu 50 điểm theo thời gian trả lời.
                                    </ThemedText>
                                </View>

                                {/* Answer Options */}
                                <View className="gap-3">
                                    {(currentQuestion.options || currentQuestion.answers || []).map((option: any, idx: number) => {
                                        const isSelected = selectedAnswer === idx;
                                        const isCorrect = showResult && currentQuestion.correctAnswer !== undefined
                                            ? idx === currentQuestion.correctAnswer
                                            : false;
                                        const isWrong = isSelected && showResult && !isCorrect;
                                        const showFeedback = showResult && (isCorrect || isWrong);
                                        const optionText = typeof option === 'string' ? option : option.text || option.content || option;

                                        return (
                                            <Animated.View
                                                key={idx}
                                                style={typeAdvantage === "opponent" && !isAnswerSubmitted && roundStarted ? {
                                                    transform: [{ translateX: shakeAnimation }]
                                                } : {}}
                                            >
                                                <HapticPressable
                                                    onPress={() => handleSelectAnswer(idx)}
                                                    disabled={isAnswerSubmitted || isWaitingForOpponent}
                                                    className={`rounded-2xl border-2 overflow-hidden ${showFeedback
                                                        ? isCorrect
                                                            ? "border-green-500 bg-green-500/20"
                                                            : "border-red-500 bg-red-500/20"
                                                        : isSelected
                                                            ? "border-cyan-400 bg-cyan-500/20"
                                                            : "border-white/20 bg-white/5"
                                                        }`}
                                                >
                                                    <View className="p-4 flex-row items-center justify-between">
                                                        <ThemedText
                                                            style={{
                                                                color: showFeedback ? (isCorrect ? "#86efac" : "#fca5a5") : "#e5e7eb",
                                                                fontSize: 16,
                                                                fontWeight: "600",
                                                                flex: 1,
                                                            }}
                                                        >
                                                            {optionText}
                                                        </ThemedText>
                                                        {showFeedback && (
                                                            <View>
                                                                {isCorrect ? (
                                                                    <CheckCircle size={24} color="#22c55e" />
                                                                ) : (
                                                                    <XCircle size={24} color="#ef4444" />
                                                                )}
                                                            </View>
                                                        )}
                                                    </View>
                                                </HapticPressable>
                                            </Animated.View>
                                        );
                                    })}
                                </View>

                                {/* Submit Button */}
                                {!isAnswerSubmitted && selectedAnswer !== null && !isWaitingForOpponent && (
                                    <HapticPressable onPress={handleSubmitAnswer} className="mt-6 rounded-2xl overflow-hidden">
                                        <TWLinearGradient
                                            colors={["#22c55e", "#16a34a"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={{ paddingVertical: 16 }}
                                        >
                                            <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "700", textAlign: "center" }}>
                                                XÁC NHẬN
                                            </ThemedText>
                                        </TWLinearGradient>
                                    </HapticPressable>
                                )}
                            </View>
                        </TWLinearGradient>
                    </View>
                )}

                {isWaitingForOpponent && (
                    <View className="px-5 mb-6">
                        <View className="bg-black/40 rounded-2xl p-6 items-center justify-center">
                            <ActivityIndicator size="large" color="#fbbf24" />
                            <ThemedText style={{ color: "#fbbf24", fontSize: 16, fontWeight: "600", marginTop: 16, textAlign: "center" }}>
                                Đang chờ đối thủ hoàn thành...
                            </ThemedText>
                        </View>
                    </View>
                )}
            </ImageBackground>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bg: {
        flex: 1,
    },
    bgImage: {
        resizeMode: "cover",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
});

