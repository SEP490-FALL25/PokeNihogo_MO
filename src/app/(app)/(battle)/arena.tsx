import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { HapticPressable } from "@components/HapticPressable";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import useOwnedPokemons from "@hooks/useOwnedPokemons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Award, CheckCircle, Clock, Shield, XCircle, Zap } from "lucide-react-native";
import React from "react";
import {
    Animated,
    Easing,
    Image,
    ImageBackground,
    StyleSheet,
    View,
} from "react-native";
import { TYPE_MATCHUPS } from "../../../../mock-data/type-matchups";

interface BattleArenaScreenProps { }

// Mock quiz questions
const mockQuestions = [
    {
        id: 1,
        question: "What is the correct Japanese translation for 'cat'?",
        options: ["ねこ", "いぬ", "とり", "うま"],
        correctAnswer: 0,
    },
    {
        id: 2,
        question: "What is the correct Japanese translation for 'hello'?",
        options: ["さようなら", "こんにちは", "ありがとう", "すみません"],
        correctAnswer: 1,
    },
    {
        id: 3,
        question: "What is the correct Japanese translation for 'thank you'?",
        options: ["すみません", "ありがとう", "どういたしまして", "いらっしゃいませ"],
        correctAnswer: 1,
    },
    {
        id: 4,
        question: "What is the correct Japanese translation for 'water'?",
        options: ["火", "水", "空気", "土"],
        correctAnswer: 1,
    },
    {
        id: 5,
        question: "What is the correct Japanese translation for 'fire'?",
        options: ["水", "火", "土", "風"],
        correctAnswer: 1,
    },
];

export default function BattleArenaScreen({ }: BattleArenaScreenProps) {
    const router = useRouter();
    const params = useLocalSearchParams();
    const matchId = params.matchId as string;
    const { ownedPokemons } = useOwnedPokemons();

    const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null);
    const [isAnswerSubmitted, setIsAnswerSubmitted] = React.useState(false);
    const [showResult, setShowResult] = React.useState(false);
    const [battleComplete, setBattleComplete] = React.useState(false);
    const [currentRound, setCurrentRound] = React.useState(1);
    const [playerScore, setPlayerScore] = React.useState(0);
    const [opponentScore, setOpponentScore] = React.useState(0);
    const [currentTurn, setCurrentTurn] = React.useState(1);
    const [playerPokemonIndex, setPlayerPokemonIndex] = React.useState(0);
    const [opponentPokemonIndex, setOpponentPokemonIndex] = React.useState(0);
    const [typeAdvantage, setTypeAdvantage] = React.useState<"player" | "opponent" | null>(null);
    const [showFog, setShowFog] = React.useState(false);
    const [showConfusion, setShowConfusion] = React.useState(false);
    const shakeAnimation = React.useRef(new Animated.Value(0)).current;

    // Get current question (mock)
    const currentQuestion = mockQuestions[currentRound - 1];

    // Get player and opponent Pokemon IDs from draft
    const playerPokemonIds = [1, 4, 7]; // Mock data - would come from battleService
    const opponentPokemonIds = [7, 1, 4]; // Mock data - would come from battleService

    const playerPokemon = ownedPokemons?.find(p => p.pokemon.id === playerPokemonIds[playerPokemonIndex]);
    const opponentPokemon = ownedPokemons?.find(p => p.pokemon.id === opponentPokemonIds[opponentPokemonIndex]);

    // Check type advantage
    React.useEffect(() => {
        if (!playerPokemon || !opponentPokemon) return;

        const playerType = playerPokemon.pokemon.types[0]?.type_name;
        const opponentType = opponentPokemon.pokemon.types[0]?.type_name;

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
        } else {
            setTypeAdvantage(null);
        }
    }, [playerPokemon, opponentPokemon, shakeAnimation]);

    // Handle answer selection
    const handleSelectAnswer = (answerIndex: number) => {
        if (isAnswerSubmitted || !currentQuestion) return;

        // If confused, randomly select a different answer sometimes
        let finalAnswer = answerIndex;
        if (typeAdvantage === "opponent" && Math.random() < 0.3) {
            // 30% chance to select wrong answer due to confusion
            const wrongAnswers = currentQuestion.options
                .map((_, idx) => idx)
                .filter(idx => idx !== currentQuestion.correctAnswer && idx !== answerIndex);
            if (wrongAnswers.length > 0) {
                finalAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
            }
        }

        setSelectedAnswer(finalAnswer);
    };

    // Handle answer submission
    const handleSubmitAnswer = async () => {
        if (selectedAnswer === null || !currentQuestion) return;

        setIsAnswerSubmitted(true);
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
        setShowResult(true);

        // Simulate opponent answer after 2 seconds
        setTimeout(() => {
            const opponentCorrect = Math.random() > 0.5;
            setShowResult(false);

            // Update scores
            if (isCorrect) {
                setPlayerScore(prev => prev + 1);
            }
            if (opponentCorrect) {
                setOpponentScore(prev => prev + 1);
            }

            // Check if turn is complete
            if (currentTurn >= 10) {
                // Move to next round or complete battle
                if (currentRound >= 3) {
                    setBattleComplete(true);
                    setTimeout(() => {
                        router.replace("/(app)/(tabs)/battle");
                    }, 3000);
                } else {
                    setCurrentRound(prev => prev + 1);
                    setCurrentTurn(1);
                    setPlayerPokemonIndex(prev => (prev + 1) % 3);
                    setOpponentPokemonIndex(prev => (prev + 1) % 3);
                }
            } else {
                setCurrentTurn(prev => prev + 1);
            }

            // Reset for next turn
            setTimeout(() => {
                setSelectedAnswer(null);
                setIsAnswerSubmitted(false);
            }, 1000);
        }, 3000);
    };

    // Victory/Loss screen
    if (battleComplete) {
        const playerWon = playerScore > opponentScore;

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
                            <ThemedText style={{ color: "#cbd5e1", fontSize: 18, textAlign: "center", marginBottom: 24 }}>
                                {playerScore} - {opponentScore}
                            </ThemedText>
                            <View className="px-6 py-3 rounded-2xl border border-white/20 bg-white/10">
                                <ThemedText style={{ color: "#93c5fd", fontSize: 16 }}>
                                    {playerWon ? "+25 MMR" : "-18 MMR"}
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
                            <Clock size={16} color="#64748b" />
                            <ThemedText style={{ color: "#94a3b8", fontSize: 14 }}>
                                Turn {currentTurn}/10
                            </ThemedText>
                        </View>
                    </View>

                    {/* Score Display */}
                    <View className="flex-row items-center justify-between">
                        {/* Opponent */}
                        <View className="items-center flex-1">
                            {opponentPokemon && (
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
                            {playerPokemon && (
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

                {/* Question Card */}
                {currentQuestion && (
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
                                    {currentQuestion.question}
                                </ThemedText>

                                {/* Answer Options */}
                                <View className="gap-3">
                                    {currentQuestion.options.map((option, idx) => {
                                        const isSelected = selectedAnswer === idx;
                                        const isCorrect = idx === currentQuestion.correctAnswer;
                                        const isWrong = isSelected && !isCorrect;
                                        const showFeedback = isAnswerSubmitted && (isCorrect || isWrong);

                                        return (
                                            <Animated.View
                                                key={idx}
                                                style={typeAdvantage === "opponent" && !isAnswerSubmitted ? {
                                                    transform: [{ translateX: shakeAnimation }]
                                                } : {}}
                                            >
                                                <HapticPressable
                                                    onPress={() => handleSelectAnswer(idx)}
                                                    disabled={isAnswerSubmitted || selectedAnswer !== null}
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
                                                            {option}
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
                                {!isAnswerSubmitted && selectedAnswer !== null && (
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

