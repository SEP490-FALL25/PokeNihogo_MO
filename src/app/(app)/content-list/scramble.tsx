import { ThemedText } from "@components/ThemedText";
import { useLesson } from "@hooks/useLessons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, RotateCcw, Trophy, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Animated,
    Easing,
    Modal,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScrambleWord {
  id: string;
  original: string;
  scrambled: string;
  meaning: string;
  selectedLetters: string[];
  remainingLetters: string[];
}

// Component hiển thị một chữ cái có thể chọn - Optimized với React.memo
const LetterTile = React.memo(({
  letter,
  index,
  onPress,
  isSelected,
  disabled,
  scaleAnim,
  opacityAnim,
}: {
  letter: string;
  index: number;
  onPress: () => void;
  isSelected: boolean;
  disabled: boolean;
  scaleAnim: Animated.Value;
  opacityAnim: Animated.Value;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!disabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [disabled, pulseAnim]);

  const combinedScale = Animated.multiply(scaleAnim, pulseAnim);

  return (
    <Animated.View
      style={{
        transform: [{ scale: combinedScale }],
        opacity: opacityAnim,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        style={{
          backgroundColor: isSelected ? "#fef3c7" : "#ffffff",
          borderRadius: 12,
          borderWidth: 3,
          borderColor: isSelected ? "#f59e0b" : "#d1d5db",
          width: 56,
          height: 56,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <ThemedText
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: isSelected ? "#92400e" : "#1f2937",
          }}
        >
          {letter}
        </ThemedText>
      </TouchableOpacity>
    </Animated.View>
  );
});

LetterTile.displayName = "LetterTile";

// Component hiển thị chữ cái đã chọn - Optimized với React.memo
const SelectedLetterSlot = React.memo(({
  letter,
  index,
  onPress,
  scaleAnim,
  isCorrect,
  isWrong,
}: {
  letter: string | null;
  index: number;
  onPress: () => void;
  scaleAnim: Animated.Value;
  isCorrect?: boolean;
  isWrong?: boolean;
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isWrong) {
      // Shake animation khi sai
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isWrong, shakeAnim]);

  useEffect(() => {
    if (isCorrect) {
      // Success animation khi đúng
      Animated.sequence([
        Animated.spring(successAnim, {
          toValue: 1.2,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(successAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isCorrect, successAnim]);

  const combinedScale = Animated.multiply(scaleAnim, successAnim);
  const translateX = shakeAnim;

  return (
    <Animated.View
      style={{
        transform: [
          { scale: combinedScale },
          { translateX },
        ],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          backgroundColor: letter
            ? isCorrect
              ? "#d1fae5"
              : isWrong
                ? "#fee2e2"
                : "#e0f2fe"
            : "#f3f4f6",
          borderRadius: 12,
          borderWidth: 3,
          borderColor: letter
            ? isCorrect
              ? "#10b981"
              : isWrong
                ? "#ef4444"
                : "#3b82f6"
            : "#d1d5db",
          borderStyle: letter ? "solid" : "dashed",
          width: 56,
          height: 56,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {letter ? (
          <ThemedText
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: isCorrect
                ? "#059669"
                : isWrong
                  ? "#dc2626"
                  : "#1e40af",
            }}
          >
            {letter}
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
      </TouchableOpacity>
    </Animated.View>
  );
});

SelectedLetterSlot.displayName = "SelectedLetterSlot";

const ScrambleGameScreen = () => {
  const { t } = useTranslation();
  const { id, contentType } = useLocalSearchParams<{
    id?: string;
    contentType?: string;
  }>();

  const { data: lessonData, isLoading } = useLesson(id || "");
  const lesson: any = lessonData?.data || {};

  const [words, setWords] = useState<ScrambleWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [answerState, setAnswerState] = useState<"none" | "correct" | "wrong">("none");
  const [displayScore, setDisplayScore] = useState(0);

  // Animation refs
  const letterScaleRefs = useRef<{ [key: string]: Animated.Value }>({});
  const letterOpacityRefs = useRef<{ [key: string]: Animated.Value }>({});
  const slotScaleRefs = useRef<{ [key: string]: Animated.Value }>({});
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const hintPulseAnim = useRef(new Animated.Value(1)).current;
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const meaningCardAnim = useRef(new Animated.Value(1)).current;

  // Hàm xáo trộn chữ cái - Optimized
  const scrambleWord = useCallback((word: string): string => {
    if (word.length <= 1) return word;

    const allSame = word.split("").every((char) => char === word[0]);
    if (allSame) return word;

    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const letters = word.split("");
      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }
      const scrambled = letters.join("");

      if (scrambled !== word) {
        return scrambled;
      }

      attempts++;
    }

    return word;
  }, []);

  // Lấy dữ liệu nội dung - Memoized
  const contentData = useMemo(() => {
    switch (contentType) {
      case "kanji":
        return lesson.kanji || [];
      default:
        return lesson.voca || lesson.vocabulary || [];
    }
  }, [contentType, lesson.kanji, lesson.voca, lesson.vocabulary]);

  // Khởi tạo danh sách từ - Optimized
  const initializeWords = useCallback(() => {
    if (contentData.length === 0) return [];

    const scrambleWords: ScrambleWord[] = contentData
      .map((item: any, index: number) => {
        let originalWord = "";
        let meaning = "";

        if (contentType === "kanji") {
          originalWord = item.character || "";
          meaning =
            item.meaning?.split("##")[0] ||
            item.meaning ||
            t("lessons.no_meaning");
        } else {
          originalWord = item.wordJp || "";
          const meanings = (item.meanings || [])
            .map((m: any) =>
              typeof m === "string" ? m : m.meaning || m.text || ""
            )
            .filter(Boolean);
          meaning =
            meanings.length > 0 ? meanings[0] : t("lessons.no_meaning");
        }

        if (!originalWord) return null;

        const scrambled = scrambleWord(originalWord);
        const remainingLetters = scrambled.split("");

        return {
          id: `word-${index}`,
          original: originalWord,
          scrambled,
          meaning,
          selectedLetters: [],
          remainingLetters,
        };
      })
      .filter(Boolean) as ScrambleWord[];

    return scrambleWords;
  }, [contentData, contentType, t, scrambleWord]);

  // Khởi tạo animation refs cho từ hiện tại
  useEffect(() => {
    if (words.length > 0 && currentWordIndex < words.length) {
      const currentWord = words[currentWordIndex];
      const allLetters = [
        ...currentWord.selectedLetters,
        ...currentWord.remainingLetters,
      ];

      allLetters.forEach((letter, idx) => {
        const key = `${currentWordIndex}-${idx}-${letter}`;
        if (!letterScaleRefs.current[key]) {
          letterScaleRefs.current[key] = new Animated.Value(1);
          letterOpacityRefs.current[key] = new Animated.Value(1);
        }
      });

      currentWord.original.split("").forEach((_, idx) => {
        const key = `slot-${currentWordIndex}-${idx}`;
        if (!slotScaleRefs.current[key]) {
          slotScaleRefs.current[key] = new Animated.Value(1);
        }
      });
    }
  }, [words, currentWordIndex]);

  // Khởi tạo game
  useEffect(() => {
    if (contentData.length > 0 && words.length === 0) {
      const initializedWords = initializeWords();
      setWords(initializedWords);
    }
  }, [contentData.length, initializeWords, words.length]);

  // Animation progress bar
  useEffect(() => {
    if (words.length > 0) {
      const progress = ((currentWordIndex + 1) / words.length) * 100;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [currentWordIndex, words.length, progressAnim]);

  // Animation score
  useEffect(() => {
    Animated.spring(scoreAnim, {
      toValue: score,
      friction: 4,
      tension: 40,
      useNativeDriver: false,
    }).start();
    
    // Update display score
    const listener = scoreAnim.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });
    
    return () => {
      scoreAnim.removeListener(listener);
    };
  }, [score, scoreAnim]);

  const currentWord = useMemo(
    () => words[currentWordIndex] || null,
    [words, currentWordIndex]
  );

  // Animation hint button pulse
  useEffect(() => {
    if (!showHint && currentWord) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(hintPulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(hintPulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      hintPulseAnim.setValue(1);
    }
  }, [showHint, currentWord, hintPulseAnim]);

  // Animation modal
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

  // Animation khi chuyển từ
  useEffect(() => {
    setAnswerState("none");
    meaningCardAnim.setValue(0);
    Animated.spring(meaningCardAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [currentWordIndex, meaningCardAnim]);

  // Reset từ hiện tại
  const resetCurrentWord = useCallback(() => {
    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    const scrambled = scrambleWord(currentWord.original);
    const updatedWords = [...words];
    updatedWords[currentWordIndex] = {
      ...currentWord,
      selectedLetters: [],
      remainingLetters: scrambled.split(""),
    };

    setWords(updatedWords);
    setShowHint(false);
    setAnswerState("none");
  }, [words, currentWordIndex, scrambleWord]);

  // Kiểm tra đáp án với animation
  const checkAnswer = useCallback((answer: string) => {
    const currentWord = words[currentWordIndex];
    const isCorrect = answer === currentWord.original;

    if (isCorrect) {
      setAnswerState("correct");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Success animation cho tất cả slots
      currentWord.original.split("").forEach((_, idx) => {
        const slotKey = `slot-${currentWordIndex}-${idx}`;
        const slotScale = slotScaleRefs.current[slotKey];
        if (slotScale) {
          Animated.sequence([
            Animated.spring(slotScale, {
              toValue: 1.05,
              friction: 4,
              tension: 50,
              useNativeDriver: true,
            }),
            Animated.spring(slotScale, {
              toValue: 1,
              friction: 4,
              tension: 50,
              useNativeDriver: true,
            }),
          ]).start();
        }
      });

      setScore((prev) => prev + 1);
      setShowHint(false);

      // Chuyển sang từ tiếp theo
      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex((prev) => prev + 1);
        } else {
          setIsGameComplete(true);
        }
      }, 1200);
    } else {
      setAnswerState("wrong");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Shake animation cho tất cả slots
      currentWord.original.split("").forEach((_, idx) => {
        const slotKey = `slot-${currentWordIndex}-${idx}`;
        const slotScale = slotScaleRefs.current[slotKey];
        if (slotScale) {
          Animated.sequence([
            Animated.timing(slotScale, {
              toValue: 1.1,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(slotScale, {
              toValue: 0.9,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(slotScale, {
              toValue: 1.1,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(slotScale, {
              toValue: 1,
              duration: 50,
              useNativeDriver: true,
            }),
          ]).start();
        }
      });

      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setTimeout(() => {
          setIsGameOver(true);
        }, 1000);
      } else {
        setTimeout(() => {
          resetCurrentWord();
        }, 1000);
      }
    }
  }, [words, currentWordIndex, lives, resetCurrentWord]);

  // Xử lý chọn chữ cái với animation
  const handleLetterSelect = useCallback((letterIndex: number) => {
    const currentWord = words[currentWordIndex];
    if (!currentWord || currentWord.remainingLetters.length === 0) return;

    const letter = currentWord.remainingLetters[letterIndex];
    const key = `${currentWordIndex}-${letterIndex}-${letter}`;
    const scaleAnim = letterScaleRefs.current[key];
    const opacityAnim = letterOpacityRefs.current[key];

    // Animation khi chọn
    if (scaleAnim && opacityAnim) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.8,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }

    const newSelected = [...currentWord.selectedLetters, letter];
    const newRemaining = currentWord.remainingLetters.filter(
      (_, i) => i !== letterIndex
    );

    const updatedWords = [...words];
    updatedWords[currentWordIndex] = {
      ...currentWord,
      selectedLetters: newSelected,
      remainingLetters: newRemaining,
    };

    setWords(updatedWords);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animation slot khi điền chữ
    const slotKey = `slot-${currentWordIndex}-${newSelected.length - 1}`;
    const slotScale = slotScaleRefs.current[slotKey];
    if (slotScale) {
      Animated.sequence([
        Animated.spring(slotScale, {
          toValue: 1.1,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.spring(slotScale, {
          toValue: 1,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Kiểm tra nếu đã điền đủ chữ
    if (newSelected.length === currentWord.original.length) {
      checkAnswer(newSelected.join(""));
    }
  }, [words, currentWordIndex, checkAnswer]);

  // Xử lý bỏ chọn chữ cái từ slot với animation
  const handleSlotDeselect = useCallback((slotIndex: number) => {
    const currentWord = words[currentWordIndex];
    if (!currentWord || slotIndex >= currentWord.selectedLetters.length) return;

    const letter = currentWord.selectedLetters[slotIndex];
    const newSelected = currentWord.selectedLetters.filter(
      (_, i) => i !== slotIndex
    );
    const newRemaining = [...currentWord.remainingLetters, letter];

    const updatedWords = [...words];
    updatedWords[currentWordIndex] = {
      ...currentWord,
      selectedLetters: newSelected,
      remainingLetters: newRemaining,
    };

    setWords(updatedWords);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animation khi bỏ chọn
    const slotKey = `slot-${currentWordIndex}-${slotIndex}`;
    const slotScale = slotScaleRefs.current[slotKey];
    if (slotScale) {
      Animated.spring(slotScale, {
        toValue: 0.8,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(slotScale, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [words, currentWordIndex]);

  // Sử dụng gợi ý
  const useHint = useCallback(() => {
    const currentWord = words[currentWordIndex];
    if (!currentWord || showHint) return;

    setShowHint(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [words, currentWordIndex, showHint]);

  // Reset game
  const resetGame = useCallback(() => {
    setCurrentWordIndex(0);
    setScore(0);
    setLives(3);
    setIsGameComplete(false);
    setIsGameOver(false);
    setShowHint(false);
    setAnswerState("none");
    letterScaleRefs.current = {};
    letterOpacityRefs.current = {};
    slotScaleRefs.current = {};
    progressAnim.setValue(0);
    scoreAnim.setValue(0);

    const initializedWords = initializeWords();
    setWords(initializedWords);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [initializeWords, progressAnim, scoreAnim]);

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
                  contentType === "kanji"
                    ? "content_list.activity.scramble.kanji"
                    : "content_list.activity.scramble.vocabulary",
                  contentType === "kanji"
                    ? "Scramble kanji"
                    : "Scramble vocabulary"
                )}
              </ThemedText>
            </View>
            <View style={{ width: 24 }} />
          </View>
          <View className="flex-1 items-center justify-center p-6">
            <ThemedText
              style={{ fontSize: 18, color: "#6b7280", textAlign: "center" }}
            >
              {t("content_list.scramble.no_content", "No content available")}
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
                contentType === "kanji"
                  ? "content_list.activity.scramble.kanji"
                  : "content_list.activity.scramble.vocabulary",
                contentType === "kanji"
                  ? "Scramble kanji"
                  : "Scramble vocabulary"
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
                  {t("content_list.scramble.score", "Score")}
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#10b981",
                  }}
                >
                  {displayScore}
                </ThemedText>
              </View>
              <View className="flex flex-row items-center gap-2 bg-white/80 rounded-2xl px-4 py-2">
                <ThemedText style={{ fontSize: 14, color: "#6b7280" }}>
                  {t("content_list.scramble.lives", "Lives")}
                </ThemedText>
                <View className="flex-row items-center gap-1 mt-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <View
                      key={i}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: i < lives ? "#ef4444" : "#d1d5db",
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>
            <Animated.View
              style={{
                transform: [{ scale: hintPulseAnim }],
              }}
            >
              <TouchableOpacity
                onPress={useHint}
                disabled={showHint || !currentWord}
                className="bg-purple-500 rounded-2xl px-4 py-2"
                style={{ opacity: showHint || !currentWord ? 0.5 : 1 }}
              >
                <ThemedText
                  style={{
                    fontSize: 14,
                    color: "#ffffff",
                    fontWeight: "600",
                  }}
                >
                  💡 {t("content_list.scramble.hint", "Hint")}
                </ThemedText>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Progress Bar - Animated */}
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
            {currentWordIndex + 1} / {words.length}
          </ThemedText>
        </View>

        {/* Game Area */}
        {currentWord && (
          <View className="flex-1 px-6 py-4">
            <Animated.View
              style={{
                transform: [{ scale: meaningCardAnim }],
                opacity: meaningCardAnim,
              }}
            >
              <View className="bg-white/90 rounded-3xl p-6 mb-6">
                <ThemedText
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#1f2937",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  {t("content_list.scramble.meaning", "Meaning")}
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 20,
                    color: "#4b5563",
                    textAlign: "center",
                  }}
                >
                  {currentWord.meaning}
                </ThemedText>
                {showHint && (
                  <Animated.View
                    style={{
                      opacity: meaningCardAnim,
                      transform: [{ scale: meaningCardAnim }],
                    }}
                    className="mt-4 bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200"
                  >
                    <ThemedText
                      style={{
                        fontSize: 18,
                        color: "#92400e",
                        textAlign: "center",
                        fontWeight: "600",
                      }}
                    >
                      {t("content_list.scramble.hint_text", "Hint")}:{" "}
                      {currentWord.original}
                    </ThemedText>
                  </Animated.View>
                )}
              </View>
            </Animated.View>

            {/* Selected Letters Slots */}
            <View className="mb-6">
              <ThemedText
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                {t("content_list.scramble.your_answer", "Your answer")}
              </ThemedText>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                {currentWord.original.split("").map((_, index) => {
                  const key = `slot-${currentWordIndex}-${index}`;
                  const scaleAnim =
                    slotScaleRefs.current[key] || new Animated.Value(1);
                  if (!slotScaleRefs.current[key]) {
                    slotScaleRefs.current[key] = scaleAnim;
                  }

                  return (
                    <SelectedLetterSlot
                      key={index}
                      letter={currentWord.selectedLetters[index] || null}
                      index={index}
                      onPress={() => handleSlotDeselect(index)}
                      scaleAnim={scaleAnim}
                      isCorrect={
                        answerState === "correct" &&
                        currentWord.selectedLetters[index] !== undefined
                      }
                      isWrong={
                        answerState === "wrong" &&
                        currentWord.selectedLetters[index] !== undefined
                      }
                    />
                  );
                })}
              </View>
            </View>

            {/* Remaining Letters */}
            <View className="flex-1">
              <ThemedText
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                {t("content_list.scramble.select_letters", "Select letters")}
              </ThemedText>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                {currentWord.remainingLetters.map((letter, index) => {
                  const key = `${currentWordIndex}-${index}-${letter}`;
                  const scaleAnim =
                    letterScaleRefs.current[key] || new Animated.Value(1);
                  const opacityAnim =
                    letterOpacityRefs.current[key] || new Animated.Value(1);
                  if (!letterScaleRefs.current[key]) {
                    letterScaleRefs.current[key] = scaleAnim;
                    letterOpacityRefs.current[key] = opacityAnim;
                  }

                  return (
                    <LetterTile
                      key={`${index}-${letter}`}
                      letter={letter}
                      index={index}
                      onPress={() => handleLetterSelect(index)}
                      isSelected={false}
                      disabled={false}
                      scaleAnim={scaleAnim}
                      opacityAnim={opacityAnim}
                    />
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Completion Modal - Animated */}
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
                  padding: 20,
                }}
              >
                {isGameOver
                  ? t("content_list.scramble.game_over", "Game Over!")
                  : t("content_list.scramble.complete", "Congratulations!")}
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
                  ? t("content_list.scramble.game_over_message", {
                      score,
                      defaultValue: `You scored ${score} points!`,
                    })
                  : t("content_list.scramble.complete_message", {
                      score,
                      defaultValue: `You completed all words with ${score} points!`,
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
                {t("content_list.scramble.final_score", {
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
                    {t("content_list.scramble.play_again", "Play Again")}
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

export default ScrambleGameScreen;
