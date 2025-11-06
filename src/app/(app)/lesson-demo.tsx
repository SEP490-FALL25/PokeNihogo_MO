import LessonMap from "@components/lesson/LessonMap";
import { LessonProgress } from "@models/lesson/lesson.common";
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// MẢNG CHỨA CÁC URL ẢNH LINH VẬT CỦA BẠN (Dùng ảnh Duo làm ví dụ)
const DUO_IMAGE_LIST = [
  "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2016_8_16_636069648836257156_thuat-ngu-trong-pokemon-go-cover.jpg",
  "https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/147C0/production/_132740938_indeximage.jpg",
];

// Mock data để demo (có thể thay thế bằng dữ liệu thực từ API)
const generateMockLessons = (count: number): LessonProgress[] => {
  const now = new Date().toISOString();
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    userId: 1,
    lessonId: i + 1,
    status:
      i === 0
        ? "IN_PROGRESS"
        : i < 3
          ? "COMPLETED"
          : i === 3
            ? "IN_PROGRESS"
            : "NOT_STARTED",
    progressPercentage: i === 0 ? 70 : i < 3 ? 100 : i === 3 ? 30 : 0,
    completedAt: i < 3 ? now : null,
    lastAccessedAt: now,
    createdAt: now,
    updatedAt: now,
    lesson: {
      id: i + 1,
      titleJp: `レッスン ${i + 1}`,
      levelJlpt: 5,
      isPublished: true,
    },
  }));
};

export default function LessonMapScreen() {
  // Mock lessons data - trong thực tế, bạn sẽ lấy từ hook hoặc props
  const mockLessons = useMemo(() => generateMockLessons(20), []);

  const handleLessonPress = (lesson: LessonProgress) => {
    console.log("Lesson pressed:", lesson.lessonId);
    // Navigate to lesson detail
    // router.push({
    //   pathname: ROUTES.LESSON.DETAIL,
    //   params: { id: lesson.lessonId.toString() },
    // });
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <LessonMap
        lessons={mockLessons}
        duoImages={DUO_IMAGE_LIST}
        onLessonPress={handleLessonPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
});
