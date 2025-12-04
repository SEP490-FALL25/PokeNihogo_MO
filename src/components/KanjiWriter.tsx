import { HanziWriter, useHanziWriter } from "@jamsch/react-native-hanzi-writer";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemedText } from "./ThemedText";

interface KanjiWriterProps {
  character: string;
  mode?: 'practice' | 'quiz' | 'review'; // practice: ôn tập, quiz: kiểm tra, review: xem lại
  onComplete?: (totalMistakes: number) => void;
  onCorrectStroke?: () => void;
  onMistake?: (strokeData: any) => void;
}

const KanjiWriter: React.FC<KanjiWriterProps> = ({
  character,
  mode = 'practice', // Default to practice mode
  onComplete,
  onCorrectStroke,
  onMistake,
}) => {
  const { t } = useTranslation();
  const writer = useHanziWriter({
    character,
    loader: (char) => {
      return fetch(
        `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`
      ).then((res) => res.json());
    },
  });

  const quizActive = writer.quiz.useStore((s) => s.active);
  const animatorState = writer.animator.useStore((s) => s.state);

  // Toggle states for display options
  const [showGridlines, setShowGridlines] = useState(true);
  const [showCharacter, setShowCharacter] = useState(true);
  const [showOutline, setShowOutline] = useState(true);

  // Mode-based configurations
  const isQuizMode = mode === 'quiz';
  const isReviewMode = mode === 'review';

  // Quiz mode: hide all options, only show quiz
  // Practice mode: show all options
  // Review mode: show all options but emphasize animation

  const startQuiz = () => {
    writer.quiz.start({
      leniency: 1,
      quizStartStrokeNum: 0,
      showHintAfterMisses: 2,
      onComplete: ({ totalMistakes }) => {
        onComplete?.(totalMistakes);
      },
      onCorrectStroke: () => {
        onCorrectStroke?.();
      },
      onMistake: (strokeData) => {
        onMistake?.(strokeData);
      },
    });
  };

  const animateStrokes = () => {
    writer.animator.animateCharacter({
      delayBetweenStrokes: 800,
      strokeDuration: 800,
      onComplete: () => {
        console.log("Animation complete!");
      },
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="bg-white rounded-xl p-6 shadow-md">
        <ThemedText className="text-lg font-semibold text-gray-700 mb-4 text-center">
          {isQuizMode
            ? t("kanji_writer.title.quiz", { character })
            : isReviewMode
            ? t("kanji_writer.title.review", { character })
            : t("kanji_writer.title.practice", { character })}
        </ThemedText>

        {/* Toggle Controls - Only show in practice and review mode */}
        {!isQuizMode && (
          <View className="flex-row gap-2 mb-4 justify-center">
            <TouchableOpacity
              className={`px-3 py-2 rounded-lg flex-row items-center ${
                showGridlines ? "bg-blue-500" : "bg-gray-300"
              }`}
              onPress={() => setShowGridlines(!showGridlines)}
            >
              <Text className="text-white text-xs font-medium">
                {t("kanji_writer.controls.gridlines")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-3 py-2 rounded-lg flex-row items-center ${
                showCharacter ? "bg-blue-500" : "bg-gray-300"
              }`}
              onPress={() => setShowCharacter(!showCharacter)}
            >
              <Text className="text-white text-xs font-medium">
                {t("kanji_writer.controls.character")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-3 py-2 rounded-lg flex-row items-center ${
                showOutline ? "bg-blue-500" : "bg-gray-300"
              }`}
              onPress={() => setShowOutline(!showOutline)}
            >
              <Text className="text-white text-xs font-medium">
                {t("kanji_writer.controls.outline")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View
          className="items-center justify-center mb-4"
          style={{ height: 320 }}
        >
          <HanziWriter
            writer={writer}
            loading={
              <Text>{t("common.loading", { defaultValue: "Loading..." })}</Text>
            }
            error={
              <View className="items-center">
                <Text>{t("kanji_writer.load_error")}</Text>
                <TouchableOpacity onPress={writer.refetch} className="mt-2">
                  <Text className="text-blue-500">{t("common.retry")}</Text>
                </TouchableOpacity>
              </View>
            }
            style={{
              alignSelf: "center",
              width: 280,
              height: 280,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {!isQuizMode && showGridlines && <HanziWriter.GridLines color="#ddd" />}
            <HanziWriter.Svg>
              {!isQuizMode && showOutline && <HanziWriter.Outline color="#ccc" />}
              {!isQuizMode && showCharacter && (
                <HanziWriter.Character color="#555" radicalColor="green" />
              )}
              <HanziWriter.QuizStrokes />
              <HanziWriter.QuizMistakeHighlighter
                color="#539bf5"
                strokeDuration={400}
              />
            </HanziWriter.Svg>
          </HanziWriter>
        </View>

        {/* Controls based on mode */}
        <View className="flex-row gap-6 justify-center mt-4">
          {isQuizMode ? (
            /* Quiz Mode: Only Start Quiz button */
            <View className="items-center">
              <TouchableOpacity
                className={`px-6 py-3 rounded-lg ${
                  quizActive ? "bg-red-500" : "bg-green-500"
                }`}
                onPress={quizActive ? writer.quiz.stop : startQuiz}
              >
                <ThemedText className="text-white text-sm font-medium">
                  {quizActive
                    ? t("kanji_writer.buttons.stop_quiz")
                    : t("kanji_writer.buttons.start_quiz")}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            /* Practice/Review Mode: Both Quiz and Animate */
            <>
              {/* QUIZ Section */}
              <View className="items-center">
                <ThemedText className="text-sm font-semibold text-gray-600 mb-2">
                  {t("kanji_writer.sections.quiz")}
                </ThemedText>
                <TouchableOpacity
                  className={`px-4 py-2 rounded-lg ${
                    quizActive ? "bg-red-500" : "bg-gray-500"
                  }`}
                  onPress={quizActive ? writer.quiz.stop : startQuiz}
                >
                  <ThemedText className="text-white text-xs font-medium">
                    {quizActive
                      ? t("kanji_writer.buttons.stop_quiz")
                      : t("kanji_writer.buttons.start_quiz")}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* ANIMATE Section */}
              <View className="items-center">
                <ThemedText className="text-sm font-semibold text-gray-600 mb-2">
                  {isReviewMode
                    ? t("kanji_writer.sections.review")
                    : t("kanji_writer.sections.animate")}
                </ThemedText>
                <TouchableOpacity
                  className={`px-4 py-2 rounded-lg ${
                    animatorState === "playing" ? "bg-red-500" : "bg-blue-500"
                  }`}
                  onPress={
                    animatorState === "playing"
                      ? writer.animator.cancelAnimation
                      : animateStrokes
                  }
                >
                  <ThemedText className="text-white text-xs font-medium">
                    {animatorState === "playing"
                      ? t("kanji_writer.buttons.stop_animation")
                      : isReviewMode
                      ? t("kanji_writer.buttons.view_strokes")
                      : t("kanji_writer.buttons.animate_strokes")}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

export default KanjiWriter;
