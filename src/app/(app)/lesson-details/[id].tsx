import HomeLayout from "@components/layouts/HomeLayout";
import { ThemedText } from "@components/ThemedText";
import { IconSymbol } from "@components/ui/IconSymbol";
import { Skeleton } from "@components/ui/Skeleton";
import { useLesson } from "@hooks/useLessons"; // Assuming this hook fetches real data
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

// --- Mock Data (Keep for fallback/example) ---
const mockLessonContent = {
  // ... (keep your existing mock data)
  vocabulary: {
    title: "Từ vựng cơ bản",
    words: [
      {
        japanese: "こんにちは",
        romaji: "konnichiwa",
        vietnamese: "Xin chào",
        example: "こんにちは、田中さん",
      },
      {
        japanese: "ありがとう",
        romaji: "arigatou",
        vietnamese: "Cảm ơn",
        example: "ありがとうございます",
      },
      {
        japanese: "すみません",
        romaji: "sumimasen",
        vietnamese: "Xin lỗi",
        example: "すみません、遅れました",
      },
      {
        japanese: "はい",
        romaji: "hai",
        vietnamese: "Vâng/Có",
        example: "はい、そうです",
      },
      {
        japanese: "いいえ",
        romaji: "iie",
        vietnamese: "Không",
        example: "いいえ、違います",
      },
    ],
  },
  grammar: {
    title: "Ngữ pháp cơ bản",
    points: [
      {
        title: "Câu khẳng định với です",
        explanation: "です được dùng để tạo câu khẳng định lịch sự",
        example: "私は学生です (Tôi là học sinh)",
        pattern: "Danh từ + です",
      },
      {
        title: "Câu phủ định với ではありません",
        explanation: "ではありません là dạng phủ định của です",
        example: "私は先生ではありません (Tôi không phải là giáo viên)",
        pattern: "Danh từ + ではありません",
      },
      {
        title: "Câu hỏi với か",
        explanation: "か được thêm vào cuối câu để tạo câu hỏi",
        example: "あなたは学生ですか？ (Bạn có phải là học sinh không?)",
        pattern: "Câu + か",
      },
    ],
  },
  kanji: {
    title: "Kanji cơ bản",
    characters: [
      {
        kanji: "人",
        meaning: "Người",
        reading: "ひと",
        examples: ["日本人 (người Nhật)", "大人 (người lớn)"],
      },
      {
        kanji: "大",
        meaning: "Lớn",
        reading: "おお",
        examples: ["大きい (to lớn)", "大学 (đại học)"],
      },
      {
        kanji: "小",
        meaning: "Nhỏ",
        reading: "ちい",
        examples: ["小さい (nhỏ)", "小学生 (học sinh tiểu học)"],
      },
      {
        kanji: "学",
        meaning: "Học",
        reading: "がく",
        examples: ["学生 (học sinh)", "学校 (trường học)"],
      },
    ],
  },
};

const LessonDetailScreen = () => {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: lessonData, isLoading } = useLesson(id || ""); // Use your actual hook

  // Use real data if available, otherwise fallback to mock data
  const lesson = lessonData?.data; // Modify this based on your actual data structure
  const lessonContent = mockLessonContent; // Use mock data for now

  // --- Alert Handling ---
  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message, [
      {
        text: "Hủy",
        style: "cancel"
      },
      {
        text: "Bắt đầu",
        onPress: () => {
          // Add navigation logic here if needed
          console.log("User confirmed:", title);
        }
      }
    ]);
  };

  const handleTestVocabulary = () => {
    showAlert("Kiểm tra Từ vựng", "Bạn có muốn bắt đầu bài kiểm tra từ vựng?");
  };

  const handleTestGrammar = () => {
    showAlert("Kiểm tra Ngữ pháp", "Bạn có muốn bắt đầu bài kiểm tra ngữ pháp?");
  };

  const handleTestKanji = () => {
    showAlert("Kiểm tra Kanji", "Bạn có muốn bắt đầu bài kiểm tra Kanji?");
  };

  const handleFinalTest = () => {
    showAlert("Kiểm tra Tổng hợp", "Bạn có muốn bắt đầu bài kiểm tra tổng hợp cho bài học này?");
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <HomeLayout>
        <View className="p-4">
          <ThemedText type="title" className="mb-6 text-center text-gray-800">
            📚 {t("lessons.title")}
          </ThemedText>
          <Skeleton className="h-8 w-3/4 mb-4 rounded" />
          <Skeleton className="h-4 w-full mb-2 rounded" />
          <Skeleton className="h-4 w-2/3 mb-6 rounded" />
          <Skeleton className="h-40 w-full mb-6 rounded-lg" />
          <Skeleton className="h-32 w-full mb-6 rounded-lg" />
        </View>
      </HomeLayout>
    );
  }

  // --- Error State ---
  // if (error || !lesson) { // Check for lesson data presence
  //   return (
  //     <HomeLayout>
  //       <View className="p-4">
  //         <ThemedText type="title" className="mb-6 text-center text-gray-800">
  //           📚 {t("lessons.title")}
  //         </ThemedText>
  //         <ErrorState
  //           title="Không thể tải bài học"
  //           description="Đã xảy ra lỗi khi tải nội dung bài học. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau."
  //           error={error?.message || "Không tìm thấy bài học"}
  //           onRetry={() => router.back()} // Consider a refresh function if applicable
  //           retryText="Quay lại"
  //         />
  //       </View>
  //     </HomeLayout>
  //   );
  // }

  // --- Render Content Sections ---
  const renderVocabularyContent = () => (
    <View className="mb-4">
      {/* <ThemedText className="text-lg font-semibold text-gray-700 mb-3">
        📚 {lessonContent.vocabulary.title}
      </ThemedText> */}
      {lessonContent.vocabulary.words.map((word: any, index: number) => (
        <View
          key={index}
          className="bg-blue-50 p-4 rounded-lg mb-3 border-l-4 border-blue-400 shadow-sm"
        >
          <View className="flex-row items-center mb-1">
            <ThemedText className="text-xl font-bold text-blue-800 mr-2">
              {word.japanese}
            </ThemedText>
            <ThemedText className="text-sm text-blue-600 italic">
              ({word.romaji})
            </ThemedText>
          </View>
          <ThemedText className="text-base text-gray-700 mb-1">
            {word.vietnamese}
          </ThemedText>
          <ThemedText className="text-sm text-gray-500 italic">
            Ví dụ: {word.example}
          </ThemedText>
        </View>
      ))}
    </View>
  );

  const renderGrammarContent = () => (
    <View className="mb-4">
      {/* <ThemedText className="text-lg font-semibold text-gray-700 mb-3">
        📝 {lessonContent.grammar.title}
      </ThemedText> */}
      {lessonContent.grammar.points.map((point: any, index: number) => (
        <View
          key={index}
          className="bg-sky-50 p-4 rounded-lg mb-3 border-l-4 border-sky-400 shadow-sm"
        >
          <ThemedText className="text-lg font-semibold text-sky-800 mb-2">
            {point.title}
          </ThemedText>
          <ThemedText className="text-base text-gray-700 mb-2 leading-relaxed">
            {point.explanation}
          </ThemedText>
          <View className="bg-sky-100 p-3 rounded-md mt-1">
            <ThemedText className="text-sm text-sky-700 font-medium mb-1">
              Cấu trúc: {point.pattern}
            </ThemedText>
            <ThemedText className="text-sm text-sky-800 italic">
              Ví dụ: {point.example}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );

  const renderKanjiContent = () => (
    <View className="mb-4">
      {/* <ThemedText className="text-lg font-semibold text-gray-700 mb-3">
        🈯 {lessonContent.kanji.title}
      </ThemedText> */}
      {lessonContent.kanji.characters.map((char: any, index: number) => (
        <View
          key={index}
          className="bg-amber-50 p-4 rounded-lg mb-3 border-l-4 border-amber-400 shadow-sm"
        >
          <View className="flex-row items-center mb-2">
            <ThemedText className="text-4xl font-bold text-amber-800 mr-4">
              {char.kanji}
            </ThemedText>
            <View className="flex-1">
              <ThemedText className="text-lg font-semibold text-amber-800">
                {char.meaning}
              </ThemedText>
              <ThemedText className="text-sm text-amber-600 italic">
                ({char.reading})
              </ThemedText>
            </View>
          </View>
          <View className="mt-1 space-y-1">
            {char.examples.map((example: any, idx: number) => (
              <ThemedText key={idx} className="text-sm text-amber-700">
                ・ {example}
              </ThemedText>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  // --- Main Component Return ---
  return (
    <HomeLayout>
      <ScrollView
        className="flex-1 px-4 pt-4" // Add padding
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} // Ensure space for final button
      >
        {/* Header */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-4 active:opacity-70"
          >
            <IconSymbol name="chevron.left" size={22} color="#3b82f6" />
            <ThemedText className="text-base text-blue-500 ml-1 font-medium">
              Quay lại
            </ThemedText>
          </TouchableOpacity>

          <ThemedText type="title" className="text-3xl text-center text-gray-800 font-bold mb-1">
            {lesson?.title || "Bài học"}
          </ThemedText>
          {/* Optional: Add lesson description or level */}
          {/* <ThemedText className="text-center text-gray-500 mb-4">
            {lesson?.description || "Nội dung chi tiết bài học"}
          </ThemedText> */}
        </View>

        {/* --- Lesson Sections --- */}
        {/* Part 1: Vocabulary */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <ThemedText type="subtitle" className="text-xl font-semibold text-gray-700">
              <IconSymbol name="book.closed" size={20} color="#3b82f6" style={{ marginRight: 6 }}/>
              Từ vựng
            </ThemedText>
            <TouchableOpacity
              className="bg-blue-500 py-2 px-4 rounded-full flex-row items-center active:bg-blue-600"
              onPress={handleTestVocabulary}
            >
               <IconSymbol name="pencil.and.scribble" size={14} color="#ffffff" style={{ marginRight: 4 }}/>
              <ThemedText className="text-white text-sm font-medium">
                Kiểm tra
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-xl p-4 shadow-md">
            {renderVocabularyContent()}
          </View>
        </View>

        {/* Part 2: Grammar */}
        <View className="mb-6">
           <View className="flex-row justify-between items-center mb-4">
            <ThemedText type="subtitle" className="text-xl font-semibold text-gray-700">
              <IconSymbol name="pencil.line" size={20} color="#0ea5e9" style={{ marginRight: 6 }}/>
              Ngữ pháp
            </ThemedText>
            <TouchableOpacity
              className="bg-sky-500 py-2 px-4 rounded-full flex-row items-center active:bg-sky-600"
              onPress={handleTestGrammar}
            >
               <IconSymbol name="pencil.and.scribble" size={14} color="#ffffff" style={{ marginRight: 4 }}/>
              <ThemedText className="text-white text-sm font-medium">
                 Kiểm tra
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-xl p-4 shadow-md">
            {renderGrammarContent()}
          </View>
        </View>

        {/* Part 3: Kanji */}
        <View className="mb-8">
           <View className="flex-row justify-between items-center mb-4">
            <ThemedText type="subtitle" className="text-xl font-semibold text-gray-700">
             <IconSymbol name="character.book.closed.fill" size={20} color="#f59e0b" style={{ marginRight: 6 }}/>
              Kanji
            </ThemedText>
            <TouchableOpacity
              className="bg-amber-500 py-2 px-4 rounded-full flex-row items-center active:bg-amber-600"
              onPress={handleTestKanji}
            >
               <IconSymbol name="pencil.and.scribble" size={14} color="#ffffff" style={{ marginRight: 4 }}/>
              <ThemedText className="text-white text-sm font-medium">
                 Kiểm tra
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-xl p-4 shadow-md">
            {renderKanjiContent()}
          </View>
        </View>

        {/* Final Test Button */}
        <View className="items-center mb-6">
          <TouchableOpacity
            className="bg-green-500 py-4 px-8 rounded-xl flex-row items-center shadow-lg active:bg-green-600"
            onPress={handleFinalTest}
          >
            <IconSymbol name="checkmark.seal.fill" size={20} color="#ffffff" style={{ marginRight: 8 }}/>
            <ThemedText className="text-white text-lg font-bold">
              Bài kiểm tra Tổng hợp
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

    </HomeLayout>
  );
};

export default LessonDetailScreen;
