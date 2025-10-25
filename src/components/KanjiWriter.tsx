import { HanziWriter, useHanziWriter } from "@jamsch/react-native-hanzi-writer";
import React, { useState } from "react";
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
          {isQuizMode ? `Kiểm tra Kanji: ${character}` : 
           isReviewMode ? `Ôn tập Kanji: ${character}` : 
           `Viết Kanji: ${character}`}
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
              <Text className="text-white text-xs font-medium">Gridlines</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-3 py-2 rounded-lg flex-row items-center ${
                showCharacter ? "bg-blue-500" : "bg-gray-300"
              }`}
              onPress={() => setShowCharacter(!showCharacter)}
            >
              <Text className="text-white text-xs font-medium">Character</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-3 py-2 rounded-lg flex-row items-center ${
                showOutline ? "bg-blue-500" : "bg-gray-300"
              }`}
              onPress={() => setShowOutline(!showOutline)}
            >
              <Text className="text-white text-xs font-medium">Outline</Text>
            </TouchableOpacity>
          </View>
        )}

        <View
          className="items-center justify-center mb-4"
          style={{ height: 320 }}
        >
          <HanziWriter
            writer={writer}
            loading={<Text>Đang tải...</Text>}
            error={
              <View className="items-center">
                <Text>Lỗi tải ký tự</Text>
                <TouchableOpacity onPress={writer.refetch} className="mt-2">
                  <Text className="text-blue-500">Thử lại</Text>
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
                  {quizActive ? "Dừng kiểm tra" : "Bắt đầu kiểm tra"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            /* Practice/Review Mode: Both Quiz and Animate */
            <>
              {/* QUIZ Section */}
              <View className="items-center">
                <ThemedText className="text-sm font-semibold text-gray-600 mb-2">QUIZ</ThemedText>
                <TouchableOpacity
                  className={`px-4 py-2 rounded-lg ${
                    quizActive ? "bg-red-500" : "bg-gray-500"
                  }`}
                  onPress={quizActive ? writer.quiz.stop : startQuiz}
                >
                  <ThemedText className="text-white text-xs font-medium">
                    {quizActive ? "Stop Quiz" : "Start Quiz"}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* ANIMATE Section */}
              <View className="items-center">
                <ThemedText className="text-sm font-semibold text-gray-600 mb-2">
                  {isReviewMode ? "REVIEW" : "ANIMATE"}
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
                      ? "Stop Animation"
                      : isReviewMode ? "Xem cách viết" : "Animate Strokes"}
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
