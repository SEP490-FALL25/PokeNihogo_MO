import { ThemedText } from "@components/ThemedText";
import { useLesson } from "@hooks/useLessons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Heart,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
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
  Modal,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface WordChainWord {
  id: string;
  word: string;
  meaning: string;
  lastChar: string; // Last character (hiragana/katakana)
}

const WordChainGameScreen = () => {
  const { t } = useTranslation();
  const { id, contentType } = useLocalSearchParams<{
    id?: string;
    contentType?: string;
  }>();

  const { data: lessonData, isLoading } = useLesson(id || "");
  const lesson: any = lessonData?.data || {};

  const [words, setWords] = useState<WordChainWord[]>([]);
  const [chain, setChain] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<WordChainWord | null>(null);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [answerState, setAnswerState] = useState<"none" | "correct" | "wrong">(
    "none"
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(30);

  // Animation refs
  const cardAnim = useRef(new Animated.Value(1)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const inputShakeAnim = useRef(new Animated.Value(0)).current;
  const successPulseAnim = useRef(new Animated.Value(1)).current;
  const chainAnim = useRef(new Animated.Value(0)).current;

  // Get content data
  const contentData = useMemo(() => {
    switch (contentType) {
      case "kanji":
        return lesson.kanji || [];
      default:
        return lesson.voca || lesson.vocabulary || [];
    }
  }, [contentType, lesson.kanji, lesson.voca, lesson.vocabulary]);

  // Helper: Get last character (hiragana/katakana) of a word
  const getLastChar = useCallback((word: string): string => {
    if (!word) return "";
    // Get last character
    const lastChar = word[word.length - 1];
    return lastChar;
  }, []);

  // Initialize words
  const initializeWords = useCallback(() => {
    if (contentData.length === 0) return [];

    const wordList: WordChainWord[] = contentData
      .map((item: any, index: number) => {
        let word = "";
        let meaning = "";

        if (contentType === "kanji") {
          word = item.character || "";
          meaning =
            item.meaning?.split("##")[0] ||
            item.meaning ||
            t("lessons.no_meaning");
        } else {
          word = item.wordJp || "";
          const meanings = (item.meanings || [])
            .map((m: any) =>
              typeof m === "string" ? m : m.meaning || m.text || ""
            )
            .filter(Boolean);
          meaning = meanings.length > 0 ? meanings[0] : t("lessons.no_meaning");
        }

        if (!word) return null;

        return {
          id: `word-${index}`,
          word,
          meaning,
          lastChar: getLastChar(word),
        };
      })
      .filter(Boolean) as WordChainWord[];

    return wordList;
  }, [contentData, contentType, t, getLastChar]);

  // Initialize game
  useEffect(() => {
    if (contentData.length > 0 && words.length === 0) {
      const wordList = initializeWords();
      setWords(wordList);
      // Start with a random word
      if (wordList.length > 0) {
        const randomWord =
          wordList[Math.floor(Math.random() * wordList.length)];
        setCurrentWord(randomWord);
        setChain([randomWord.word]);
      }
    }
  }, [contentData.length, initializeWords, words.length]);

  // Timer countdown
  useEffect(() => {
    if (isGameComplete || isGameOver || !currentWord) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameComplete, isGameOver, currentWord]);

  // Animate progress
  useEffect(() => {
    if (words.length > 0) {
      const progress = (chain.length / Math.min(20, words.length)) * 100;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [chain.length, words.length, progressAnim]);

  // Animate score
  useEffect(() => {
    Animated.spring(scoreAnim, {
      toValue: score,
      friction: 4,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [score, scoreAnim]);

  // Animate chain
  useEffect(() => {
    chainAnim.setValue(0);
    Animated.spring(chainAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [chain.length, chainAnim]);

  // Animate modal
  useEffect(() => {
    if (isGameComplete || isGameOver) {
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      modalScaleAnim.setValue(0);
    }
  }, [isGameComplete, isGameOver, modalScaleAnim]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    const newLives = lives - 1;
    setLives(newLives);

    if (newLives <= 0) {
      setIsGameOver(true);
    } else {
      setAnswerState("wrong");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => {
        setAnswerState("none");
        setUserInput("");
        setTimeRemaining(30);
      }, 1000);
    }
  }, [lives]);

  // Check if word starts with the required character
  const checkWordChain = useCallback(
    (inputWord: string): boolean => {
      if (!currentWord || !inputWord) return false;

      const requiredChar = currentWord.lastChar;
      const inputFirstChar = inputWord[0];

      return inputFirstChar === requiredChar;
    },
    [currentWord]
  );

  // Check if word is in the word list
  const isWordInList = useCallback(
    (inputWord: string): boolean => {
      return words.some((w) => w.word === inputWord);
    },
    [words]
  );

  // Check if word was already used
  const isWordUsed = useCallback(
    (inputWord: string): boolean => {
      return chain.includes(inputWord);
    },
    [chain]
  );

  // Submit answer
  const handleSubmit = useCallback(() => {
    if (!userInput.trim() || !currentWord) return;

    const trimmedInput = userInput.trim();

    // Check if word is in list
    if (!isWordInList(trimmedInput)) {
      setAnswerState("wrong");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Shake animation
      Animated.sequence([
        Animated.timing(inputShakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(inputShakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(inputShakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();

      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setTimeout(() => {
          setIsGameOver(true);
        }, 1000);
      } else {
        setTimeout(() => {
          setAnswerState("none");
          setUserInput("");
        }, 1000);
      }
      return;
    }

    // Check if word was already used
    if (isWordUsed(trimmedInput)) {
      setAnswerState("wrong");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      Animated.sequence([
        Animated.timing(inputShakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(inputShakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(inputShakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();

      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setTimeout(() => {
          setIsGameOver(true);
        }, 1000);
      } else {
        setTimeout(() => {
          setAnswerState("none");
          setUserInput("");
        }, 1000);
      }
      return;
    }

    // Check word chain rule
    if (!checkWordChain(trimmedInput)) {
      setAnswerState("wrong");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      Animated.sequence([
        Animated.timing(inputShakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(inputShakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(inputShakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();

      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setTimeout(() => {
          setIsGameOver(true);
        }, 1000);
      } else {
        setTimeout(() => {
          setAnswerState("none");
          setUserInput("");
        }, 1000);
      }
      return;
    }

    // Correct answer!
    setAnswerState("correct");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Success animation
    Animated.sequence([
      Animated.spring(successPulseAnim, {
        toValue: 1.2,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(successPulseAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Find the word object
    const foundWord = words.find((w) => w.word === trimmedInput);
    if (foundWord) {
      setCurrentWord(foundWord);
      setChain((prev) => [...prev, trimmedInput]);
      setScore((prev) => prev + 1);
      setTimeRemaining(30);
    }

    setTimeout(() => {
      setAnswerState("none");
      setUserInput("");
    }, 1000);
  }, [
    userInput,
    currentWord,
    isWordInList,
    isWordUsed,
    checkWordChain,
    lives,
    words,
    inputShakeAnim,
    successPulseAnim,
  ]);

  // Reset game
  const resetGame = useCallback(() => {
    setChain([]);
    setCurrentWord(null);
    setUserInput("");
    setScore(0);
    setLives(3);
    setIsGameComplete(false);
    setIsGameOver(false);
    setAnswerState("none");
    setTimeRemaining(30);
    progressAnim.setValue(0);
    scoreAnim.setValue(0);
    cardAnim.setValue(1);

    const wordList = initializeWords();
    setWords(wordList);
    if (wordList.length > 0) {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      setCurrentWord(randomWord);
      setChain([randomWord.word]);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [initializeWords, progressAnim, scoreAnim, cardAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </SafeAreaView>
    );
  }

  if (contentData.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LinearGradient
          colors={["#79B4C4", "#85C3C3", "#9BC7B9"]}
          style={{ flex: 1 }}
        >
          <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row rounded-b-3xl items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color="#6b7280" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: "center" }}>
              <ThemedText
                style={{ fontSize: 20, fontWeight: "bold", color: "#1f2937" }}
              >
                {t("content_list.word_chain.title", "Word Chain (Shiritori)")}
              </ThemedText>
            </View>
            <View style={{ width: 24 }} />
          </View>
          <View className="flex-1 items-center justify-center p-6">
            <ThemedText
              style={{ fontSize: 18, color: "#6b7280", textAlign: "center" }}
            >
              {t("content_list.word_chain.no_content", "No content available")}
            </ThemedText>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <LinearGradient
        colors={["#79B4C4", "#85C3C3", "#9BC7B9"]}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row rounded-b-3xl items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#6b7280" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <ThemedText
              style={{ fontSize: 20, fontWeight: "bold", color: "#1f2937" }}
            >
              {t("content_list.word_chain.title", "Word Chain (Shiritori)")}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={resetGame} activeOpacity={0.7}>
            <RotateCcw size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Stats Bar */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-4">
              <View className="flex flex-row items-center gap-2 bg-white/80 rounded-2xl px-4 py-2">
                <ThemedText style={{ fontSize: 14, color: "#6b7280" }}>
                  {t("content_list.word_chain.score", "Score")}
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#10b981",
                  }}
                >
                  {score}
                </ThemedText>
              </View>
              <View className="flex flex-row items-center gap-2 bg-white/80 rounded-2xl px-4 py-2">
                <ThemedText style={{ fontSize: 14, color: "#6b7280" }}>
                  {t("content_list.word_chain.lives", "Lives")}
                </ThemedText>
                <View className="flex-row items-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart
                      key={i}
                      size={18}
                      color={i < lives ? "#ef4444" : "#d1d5db"}
                      fill={i < lives ? "#ef4444" : "transparent"}
                    />
                  ))}
                </View>
              </View>
              <View className="flex flex-row items-center gap-2 bg-white/80 rounded-2xl px-4 py-2">
                <ThemedText style={{ fontSize: 14, color: "#6b7280" }}>
                  {t("content_list.word_chain.time", "Time")}
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: timeRemaining <= 10 ? "#ef4444" : "#1f2937",
                  }}
                >
                  {timeRemaining}s
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="w-full h-2 rounded-full bg-white/50 overflow-hidden">
            <Animated.View
              style={{
                width: progressWidth,
                height: "100%",
                backgroundColor: "#0ea5e9",
                borderRadius: 999,
              }}
            />
          </View>
          <ThemedText
            style={{
              fontSize: 12,
              color: "#6b7280",
              textAlign: "center",
              marginTop: 4,
            }}
          >
            {t("content_list.word_chain.chain_length", {
              length: chain.length,
              defaultValue: `Chain: ${chain.length} words`,
            })}
          </ThemedText>
        </View>

        {/* Game Area */}
        {currentWord && (
          <View className="flex-1 px-6 py-4">
            <Animated.View
              style={{
                transform: [{ scale: cardAnim }],
                opacity: cardAnim,
              }}
            >
              {/* Current Word Card */}
              <View className="bg-white/90 rounded-3xl p-6 mb-6">
                <ThemedText
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#6b7280",
                    marginBottom: 8,
                  }}
                >
                  {t("content_list.word_chain.current_word", "Current Word")}
                </ThemedText>
                <Animated.View
                  style={{
                    transform: [{ scale: successPulseAnim }],
                  }}
                >
                  <ThemedText
                    style={{
                      fontSize: 36,
                      fontWeight: "bold",
                      color: "#1f2937",
                      marginBottom: 8,
                      paddingTop: 24,
                    }}
                  >
                    {currentWord.word}
                  </ThemedText>
                </Animated.View>
                <ThemedText
                  style={{
                    fontSize: 18,
                    color: "#6b7280",
                    marginBottom: 12,
                  }}
                >
                  {currentWord.meaning}
                </ThemedText>
                <View className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-200">
                  <ThemedText
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#4f46e5",
                    }}
                  >
                    {t(
                      "content_list.word_chain.next_starts_with",
                      "Next word must start with"
                    )}
                    :{" "}
                    <ThemedText
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "#6366f1",
                      }}
                    >
                      {currentWord.lastChar}
                    </ThemedText>
                  </ThemedText>
                </View>
              </View>

              {/* Word Chain Display */}
              {chain.length > 1 && (
                <View className="bg-white/90 rounded-3xl p-4 mb-6">
                  <ThemedText
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#6b7280",
                      marginBottom: 8,
                    }}
                  >
                    {t("content_list.word_chain.chain", "Word Chain")}
                  </ThemedText>
                  <Animated.View
                    style={{
                      opacity: chainAnim,
                      transform: [{ scale: chainAnim }],
                    }}
                  >
                    <View className="flex-row flex-wrap gap-2">
                      {chain.map((word, index) => (
                        <View
                          key={index}
                          className="bg-indigo-100 rounded-xl px-3 py-2"
                        >
                          <ThemedText
                            style={{
                              fontSize: 16,
                              fontWeight: "600",
                              color: "#4f46e5",
                            }}
                          >
                            {word}
                            {index < chain.length - 1 && (
                              <ThemedText style={{ color: "#818cf8" }}>
                                {" "}
                                →{" "}
                              </ThemedText>
                            )}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  </Animated.View>
                </View>
              )}

              {/* Input */}
              <View className="mb-6">
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#1f2937",
                    marginBottom: 12,
                  }}
                >
                  {t(
                    "content_list.word_chain.enter_word",
                    "Enter a word starting with"
                  )}{" "}
                  <ThemedText
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#6366f1",
                    }}
                  >
                    {currentWord.lastChar}
                  </ThemedText>
                </ThemedText>
                <Animated.View
                  style={{
                    transform: [{ translateX: inputShakeAnim }],
                  }}
                >
                  <TextInput
                    value={userInput}
                    onChangeText={setUserInput}
                    placeholder={t(
                      "content_list.word_chain.input_placeholder",
                      "Type a word..."
                    )}
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: 12,
                      borderWidth: 3,
                      borderColor:
                        answerState === "correct"
                          ? "#10b981"
                          : answerState === "wrong"
                            ? "#ef4444"
                            : "#3b82f6",
                      padding: 16,
                      fontSize: 20,
                      fontWeight: "600",
                      color: "#1f2937",
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleSubmit}
                  />
                </Animated.View>
              </View>

              {/* Submit Button */}
              {userInput && answerState === "none" && (
                <TouchableOpacity
                  onPress={handleSubmit}
                  className="bg-indigo-500 rounded-2xl py-4 px-6"
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center justify-center gap-2">
                    <Sparkles size={20} color="#ffffff" />
                    <ThemedText
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#ffffff",
                      }}
                    >
                      {t("content_list.word_chain.submit", "Submit")}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>
        )}

        {/* Completion Modal */}
        <Modal
          visible={isGameComplete || isGameOver}
          animationType="fade"
          transparent={true}
          onRequestClose={() => {
            setIsGameComplete(false);
            setIsGameOver(false);
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
              padding: 24,
            }}
          >
            <Animated.View
              style={{
                transform: [{ scale: modalScaleAnim }],
                backgroundColor: "#ffffff",
                borderRadius: 24,
                padding: 32,
                alignItems: "center",
                width: "100%",
                maxWidth: 400,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 10,
              }}
            >
              <LinearGradient
                colors={
                  isGameOver ? ["#ef4444", "#dc2626"] : ["#fbbf24", "#f59e0b"]
                }
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                {isGameOver ? (
                  <X size={40} color="#ffffff" />
                ) : (
                  <Trophy size={40} color="#ffffff" />
                )}
              </LinearGradient>

              <ThemedText
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: "#1f2937",
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                {isGameOver
                  ? t("content_list.word_chain.game_over", "Game Over!")
                  : t("content_list.word_chain.complete", "Congratulations!")}
              </ThemedText>

              <ThemedText
                style={{
                  fontSize: 16,
                  color: "#6b7280",
                  marginBottom: 24,
                  textAlign: "center",
                }}
              >
                {isGameOver
                  ? t("content_list.word_chain.game_over_message", {
                      score,
                      chainLength: chain.length,
                      defaultValue: `You scored ${score} points with a chain of ${chain.length} words!`,
                    })
                  : t("content_list.word_chain.complete_message", {
                      score,
                      chainLength: chain.length,
                      defaultValue: `You created a chain of ${chain.length} words with ${score} points!`,
                    })}
              </ThemedText>

              <ThemedText
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#4f46e5",
                  marginBottom: 32,
                }}
              >
                {t("content_list.word_chain.final_score", {
                  defaultValue: `Final Score: ${score}`,
                  score,
                })}
              </ThemedText>

              <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                <TouchableOpacity
                  onPress={() => {
                    setIsGameComplete(false);
                    setIsGameOver(false);
                    resetGame();
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: "#4f46e5",
                    borderRadius: 12,
                    padding: 16,
                    alignItems: "center",
                  }}
                  activeOpacity={0.8}
                >
                  <ThemedText
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#ffffff",
                    }}
                  >
                    {t("content_list.word_chain.play_again", "Play Again")}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setIsGameComplete(false);
                    setIsGameOver(false);
                    router.back();
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: "#e5e7eb",
                    borderRadius: 12,
                    padding: 16,
                    alignItems: "center",
                  }}
                  activeOpacity={0.8}
                >
                  <ThemedText
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#374151",
                    }}
                  >
                    {t("common.close", "Close")}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default WordChainGameScreen;
