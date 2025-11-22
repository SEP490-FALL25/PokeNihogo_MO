import { ThemedText } from "@components/ThemedText";
import { useLesson } from "@hooks/useLessons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Check, ChevronLeft, RotateCcw, Trophy, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Animated,
    Easing,
    Modal,
    PanResponder,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FillBlankQuestion {
  id: string;
  sentence: string;
  blankIndex: number;
  correctAnswer: string;
  meaning: string;
  options: string[];
  userAnswer: string;
}

const FillBlankGameScreen = () => {
  const { t } = useTranslation();
  const { id, contentType } = useLocalSearchParams<{
    id?: string;
    contentType?: string;
  }>();

  const { data: lessonData, isLoading } = useLesson(id || "");
  const lesson: any = lessonData?.data || {};

  const [questions, setQuestions] = useState<FillBlankQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [answerState, setAnswerState] = useState<"none" | "correct" | "wrong">("none");
  const [userInput, setUserInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [draggingOption, setDraggingOption] = useState<string | null>(null);
  const [isOverDropZone, setIsOverDropZone] = useState(false);

  // Refs for drop zone
  const dropZoneRef = useRef<View>(null);
  const dropZoneLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Animation refs
  const cardAnim = useRef(new Animated.Value(1)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const inputShakeAnim = useRef(new Animated.Value(0)).current;
  const successPulseAnim = useRef(new Animated.Value(1)).current;
  const dragAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Get content data
  const contentData = useMemo(() => {
    switch (contentType) {
      case "kanji":
        return lesson.kanji || [];
      default:
        return lesson.voca || lesson.vocabulary || [];
    }
  }, [contentType, lesson.kanji, lesson.voca, lesson.vocabulary]);

  // Create simple sentences with blanks
  const createQuestions = useCallback(() => {
    if (contentData.length === 0) return [];

    const newQuestions: FillBlankQuestion[] = [];

    contentData.slice(0, Math.min(10, contentData.length)).forEach((item: any, index: number) => {
      let word = "";
      let meaning = "";

      if (contentType === "kanji") {
        word = item.character || "";
        meaning = item.meaning?.split("##")[0] || item.meaning || t("lessons.no_meaning");
      } else {
        word = item.wordJp || "";
        const meanings = (item.meanings || [])
          .map((m: any) => (typeof m === "string" ? m : m.meaning || m.text || ""))
          .filter(Boolean);
        meaning = meanings.length > 0 ? meanings[0] : t("lessons.no_meaning");
      }

      if (!word) return;

      // Create a simple sentence pattern
      const sentencePatterns = [
        `これは___です。`,
        `___は何ですか？`,
        `私は___が好きです。`,
        `___を見てください。`,
        `___を食べます。`,
      ];

      const pattern = sentencePatterns[index % sentencePatterns.length];
      const blankIndex = pattern.indexOf("___");
      const sentence = pattern.replace("___", "______");

      // Generate wrong options from other words
      const wrongOptions: string[] = [];
      const otherItems = contentData.filter((i: any, idx: number) => idx !== index);
      for (let i = 0; i < 3 && i < otherItems.length; i++) {
        const otherItem = otherItems[i];
        if (contentType === "kanji") {
          wrongOptions.push(otherItem.character || "");
        } else {
          wrongOptions.push(otherItem.wordJp || "");
        }
      }

      // Shuffle options
      const allOptions = [word, ...wrongOptions].sort(() => Math.random() - 0.5);

      newQuestions.push({
        id: `question-${index}`,
        sentence,
        blankIndex,
        correctAnswer: word,
        meaning,
        options: allOptions,
        userAnswer: "",
      });
    });

    return newQuestions;
  }, [contentData, contentType, t]);

  // Initialize questions
  useEffect(() => {
    if (contentData.length > 0 && questions.length === 0) {
      const newQuestions = createQuestions();
      setQuestions(newQuestions);
    }
  }, [contentData.length, createQuestions, questions.length]);

  // Animate progress
  useEffect(() => {
    if (questions.length > 0) {
      const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [currentQuestionIndex, questions.length, progressAnim]);

  // Measure drop zone layout
  const measureDropZone = useCallback(() => {
    if (dropZoneRef.current) {
      dropZoneRef.current.measure((x, y, width, height, pageX, pageY) => {
        dropZoneLayout.current = { x: pageX, y: pageY, width, height };
      });
    }
  }, []);

  // Animate score
  useEffect(() => {
    Animated.spring(scoreAnim, {
      toValue: score,
      friction: 4,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [score, scoreAnim]);

  // Animate card when question changes
  useEffect(() => {
    setAnswerState("none");
    setUserInput("");
    setShowHint(false);
    setDraggingOption(null);
    setIsOverDropZone(false);
    cardAnim.setValue(0);
    Animated.spring(cardAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    // Measure drop zone after animation
    setTimeout(() => {
      measureDropZone();
    }, 100);
  }, [currentQuestionIndex, cardAnim, measureDropZone]);

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

  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex] || null,
    [questions, currentQuestionIndex]
  );

  // Check answer
  const checkAnswer = useCallback(
    (answer: string) => {
      if (!currentQuestion) return;

      const isCorrect = answer.trim() === currentQuestion.correctAnswer.trim();

      if (isCorrect) {
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

        setScore((prev) => prev + 1);

        // Move to next question
        setTimeout(() => {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
          } else {
            setIsGameComplete(true);
          }
        }, 1500);
      } else {
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
            toValue: 10,
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
      }
    },
    [currentQuestion, currentQuestionIndex, questions.length, lives, inputShakeAnim, successPulseAnim]
  );

  // Handle option select (tap)
  const handleOptionSelect = useCallback(
    (option: string) => {
      if (answerState !== "none") return;
      setUserInput(option);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [answerState]
  );

  // Start drag on long press
  const handleLongPress = useCallback(
    (option: string) => {
      if (answerState !== "none") return;
      setDraggingOption(option);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      dragAnim.setOffset({ x: 0, y: 0 });
      dragAnim.setValue({ x: 0, y: 0 });
    },
    [answerState, dragAnim]
  );

  // Track if over drop zone using ref to avoid dependency issues
  const isOverDropZoneRef = useRef(false);

  // PanResponder for drag and drop
  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => draggingOption !== null,
      onMoveShouldSetPanResponder: () => draggingOption !== null,
      onPanResponderGrant: () => {
        if (draggingOption) {
          dragAnim.setOffset({ x: 0, y: 0 });
          dragAnim.setValue({ x: 0, y: 0 });
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!draggingOption || answerState !== "none") return;
        
        dragAnim.setValue({ x: gestureState.dx, y: gestureState.dy });
        
        // Check if over drop zone
        const { pageX, pageY } = evt.nativeEvent;
        const dropZone = dropZoneLayout.current;
        
        if (dropZone.width > 0 && dropZone.height > 0) {
          const isOver =
            pageX >= dropZone.x &&
            pageX <= dropZone.x + dropZone.width &&
            pageY >= dropZone.y &&
            pageY <= dropZone.y + dropZone.height;
          
          isOverDropZoneRef.current = isOver;
          setIsOverDropZone(isOver);
        }
      },
      onPanResponderRelease: (evt) => {
        if (!draggingOption || answerState !== "none") {
          dragAnim.flattenOffset();
          setDraggingOption(null);
          setIsOverDropZone(false);
          isOverDropZoneRef.current = false;
          return;
        }

        const optionToFill = draggingOption;
        const wasOverDropZone = isOverDropZoneRef.current;

        // Reset animation first
        Animated.spring(dragAnim, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start(() => {
          dragAnim.setOffset({ x: 0, y: 0 });
          dragAnim.setValue({ x: 0, y: 0 });
        });
        
        setDraggingOption(null);
        setIsOverDropZone(false);
        isOverDropZoneRef.current = false;

        // Check if was over drop zone (use ref or measure again)
        if (wasOverDropZone) {
          // Drop successful - just fill the value, don't auto submit
          setUserInput(optionToFill);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          // Double check with measure as fallback
          if (dropZoneRef.current) {
            dropZoneRef.current.measure((x, y, width, height, pageX, pageY) => {
              const { pageX: releaseX, pageY: releaseY } = evt.nativeEvent;
              
              const isOver =
                width > 0 &&
                height > 0 &&
                releaseX >= pageX &&
                releaseX <= pageX + width &&
                releaseY >= pageY &&
                releaseY <= pageY + height;

              if (isOver) {
                // Drop successful - just fill the value, don't auto submit
                setUserInput(optionToFill);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } else {
                // Drop failed
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            });
          } else {
            // Drop failed
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      },
    });
  }, [draggingOption, answerState, dragAnim]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!userInput.trim()) return;
    checkAnswer(userInput);
  }, [userInput, checkAnswer]);

  // Reset game
  const resetGame = useCallback(() => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setLives(3);
    setIsGameComplete(false);
    setIsGameOver(false);
    setAnswerState("none");
    setUserInput("");
    setShowHint(false);
    progressAnim.setValue(0);
    scoreAnim.setValue(0);
    cardAnim.setValue(1);

    const newQuestions = createQuestions();
    setQuestions(newQuestions);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [createQuestions, progressAnim, scoreAnim, cardAnim]);

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
                {t(
                  "content_list.fill_blank.title",
                  contentType === "kanji"
                    ? "Fill in the Blank - Kanji"
                    : "Fill in the Blank - Vocabulary"
                )}
              </ThemedText>
            </View>
            <View style={{ width: 24 }} />
          </View>
          <View className="flex-1 items-center justify-center p-6">
            <ThemedText
              style={{ fontSize: 18, color: "#6b7280", textAlign: "center" }}
            >
              {t("content_list.fill_blank.no_content", "No content available")}
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
              {t(
                "content_list.fill_blank.title",
                contentType === "kanji"
                  ? "Fill in the Blank - Kanji"
                  : "Fill in the Blank - Vocabulary"
              )}
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
                  {t("content_list.fill_blank.score", "Score")}
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
                  {t("content_list.fill_blank.lives", "Lives")}
                </ThemedText>
                <View className="flex-row items-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <View
                      key={i}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: i < lives ? "#ef4444" : "#d1d5db",
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowHint(!showHint)}
              className="bg-purple-500 rounded-2xl px-4 py-2"
              activeOpacity={0.8}
            >
              <ThemedText
                style={{
                  fontSize: 14,
                  color: "#ffffff",
                  fontWeight: "600",
                }}
              >
                💡 {t("content_list.fill_blank.hint", "Hint")}
              </ThemedText>
            </TouchableOpacity>
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
            {currentQuestionIndex + 1} / {questions.length}
          </ThemedText>
        </View>

        {/* Game Area */}
        {currentQuestion && (
          <View className="flex-1 px-6 py-4">
            <Animated.View
              style={{
                transform: [{ scale: cardAnim }],
                opacity: cardAnim,
              }}
            >
              {/* Meaning Card */}
              <View className="bg-white/90 rounded-3xl p-6 mb-6">
                <ThemedText
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#6b7280",
                    marginBottom: 8,
                  }}
                >
                  {t("content_list.fill_blank.meaning", "Meaning")}
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#1f2937",
                  }}
                >
                  {currentQuestion.meaning}
                </ThemedText>
                {showHint && (
                  <View className="mt-4 bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200">
                    <ThemedText
                      style={{
                        fontSize: 16,
                        color: "#92400e",
                        fontWeight: "600",
                      }}
                    >
                      {t("content_list.fill_blank.hint_text", "Hint")}:{" "}
                      {currentQuestion.correctAnswer}
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Sentence with Blank */}
              <View className="bg-white/90 rounded-3xl p-6 mb-6">
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#6b7280",
                    marginBottom: 12,
                  }}
                >
                  {t("content_list.fill_blank.complete_sentence", "Complete the sentence")}
                </ThemedText>
                <View className="flex-row flex-wrap items-center justify-center">
                  {currentQuestion.sentence.split("______").map((part, index) => (
                    <React.Fragment key={index}>
                      <ThemedText
                        style={{
                          fontSize: 28,
                          color: "#1f2937",
                          fontWeight: "500",
                        }}
                      >
                        {part}
                      </ThemedText>
                      {index < currentQuestion.sentence.split("______").length - 1 && (
                        <View
                          ref={dropZoneRef}
                          onLayout={measureDropZone}
                          collapsable={false}
                        >
                          <Animated.View
                            style={{
                              transform: [{ translateX: inputShakeAnim }],
                            }}
                          >
                            <View
                              style={{
                                minWidth: 120,
                                height: 50,
                                borderRadius: 12,
                                borderWidth: 3,
                                borderColor:
                                  isOverDropZone
                                    ? "#10b981"
                                    : answerState === "correct"
                                      ? "#10b981"
                                      : answerState === "wrong"
                                        ? "#ef4444"
                                        : "#3b82f6",
                                borderStyle: userInput ? "solid" : "dashed",
                                backgroundColor:
                                  isOverDropZone
                                    ? "#d1fae5"
                                    : answerState === "correct"
                                      ? "#d1fae5"
                                      : answerState === "wrong"
                                        ? "#fee2e2"
                                        : "#f3f4f6",
                                justifyContent: "center",
                                alignItems: "center",
                                paddingHorizontal: 12,
                              }}
                            >
                              {userInput ? (
                                <ThemedText
                                  style={{
                                    fontSize: 24,
                                    fontWeight: "bold",
                                    color:
                                      answerState === "correct"
                                        ? "#059669"
                                        : answerState === "wrong"
                                          ? "#dc2626"
                                          : "#1e40af",
                                  }}
                                >
                                  {userInput}
                                </ThemedText>
                              ) : (
                                <View
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: "#9ca3af",
                                  }}
                                />
                              )}
                            </View>
                          </Animated.View>
                        </View>
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>

              {/* Options */}
              <View className="mb-6">
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#1f2937",
                    marginBottom: 12,
                  }}
                >
                  {t("content_list.fill_blank.select_answer", "Select your answer")}
                </ThemedText>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 12,
                    justifyContent: "center",
                  }}
                >
                  {currentQuestion.options.map((option, index) => {
                    const isDragging = draggingOption === option;
                    
                    return (
                      <Animated.View
                        key={index}
                        style={{
                          transform: isDragging
                            ? [
                                {
                                  translateX: dragAnim.x,
                                },
                                {
                                  translateY: dragAnim.y,
                                },
                                {
                                  scale: isDragging ? 1.1 : 1,
                                },
                              ]
                            : [],
                          zIndex: isDragging ? 1000 : 1,
                          opacity: isDragging ? 0.8 : answerState !== "none" && userInput !== option ? 0.5 : 1,
                        }}
                        {...(isDragging ? panResponder.panHandlers : {})}
                      >
                        <TouchableOpacity
                          onPress={() => handleOptionSelect(option)}
                          onLongPress={() => handleLongPress(option)}
                          disabled={answerState !== "none" || isDragging}
                          delayLongPress={300}
                          style={{
                            backgroundColor:
                              userInput === option
                                ? answerState === "correct"
                                  ? "#d1fae5"
                                  : answerState === "wrong"
                                    ? "#fee2e2"
                                    : "#e0f2fe"
                                : isDragging
                                  ? "#fef3c7"
                                  : "#ffffff",
                            borderRadius: 12,
                            borderWidth: 3,
                            borderColor:
                              userInput === option
                                ? answerState === "correct"
                                  ? "#10b981"
                                  : answerState === "wrong"
                                    ? "#ef4444"
                                    : "#3b82f6"
                                : isDragging
                                  ? "#f59e0b"
                                  : "#d1d5db",
                            paddingVertical: 16,
                            paddingHorizontal: 24,
                            minWidth: 100,
                            alignItems: "center",
                            shadowColor: isDragging ? "#000" : "transparent",
                            shadowOffset: { width: 0, height: isDragging ? 4 : 0 },
                            shadowOpacity: isDragging ? 0.3 : 0,
                            shadowRadius: isDragging ? 8 : 0,
                            elevation: isDragging ? 8 : 0,
                          }}
                          activeOpacity={0.7}
                        >
                          <ThemedText
                            style={{
                              fontSize: 20,
                              fontWeight: "bold",
                              color:
                                userInput === option
                                  ? answerState === "correct"
                                    ? "#059669"
                                    : answerState === "wrong"
                                      ? "#dc2626"
                                      : "#1e40af"
                                  : isDragging
                                    ? "#92400e"
                                    : "#1f2937",
                            }}
                          >
                            {option}
                          </ThemedText>
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })}
                </View>
              </View>

              {/* Submit Button */}
              {userInput && answerState === "none" && (
                <TouchableOpacity
                  onPress={handleSubmit}
                  className="bg-indigo-500 rounded-2xl py-4 px-6"
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center justify-center gap-2">
                    <Check size={20} color="#ffffff" />
                    <ThemedText
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#ffffff",
                      }}
                    >
                      {t("content_list.fill_blank.submit", "Submit")}
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
                  isGameOver
                    ? ["#ef4444", "#dc2626"]
                    : ["#fbbf24", "#f59e0b"]
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
                  ? t("content_list.fill_blank.game_over", "Game Over!")
                  : t("content_list.fill_blank.complete", "Congratulations!")}
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
                  ? t("content_list.fill_blank.game_over_message", {
                      score,
                      defaultValue: `You scored ${score} points!`,
                    })
                  : t("content_list.fill_blank.complete_message", {
                      score,
                      defaultValue: `You completed all questions with ${score} points!`,
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
                {t("content_list.fill_blank.final_score", {
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
                    {t("content_list.fill_blank.play_again", "Play Again")}
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

export default FillBlankGameScreen;

