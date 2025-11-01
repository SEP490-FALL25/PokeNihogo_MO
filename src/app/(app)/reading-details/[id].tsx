import { ThemedText } from "@/components/ThemedText";
import { getPassageById } from "../../../../mock-data/reading-data";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, BookOpen, Eye, EyeOff } from "lucide-react-native";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function ReadingDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const passage = getPassageById(id || "");
  const [showTranslation, setShowTranslation] = useState(false);

  if (!passage) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <View className="flex-1 items-center justify-center p-6">
          <ThemedText className="text-xl text-gray-600 text-center">
            Không tìm thấy bài đọc
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 px-6 py-3 bg-blue-500 rounded-full"
          >
            <ThemedText className="text-white font-semibold">
              Quay lại
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "N5":
        return "#10b981"; // green-500
      case "N4":
        return "#3b82f6"; // blue-500
      case "N3":
        return "#eab308"; // yellow-500
      case "N2":
        return "#f97316"; // orange-500
      case "N1":
        return "#ef4444"; // red-500
      default:
        return "#6b7280"; // gray-500
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#79B4C4", "#85C3C3", "#9BC7B9"]}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row items-center justify-between rounded-b-3xl">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#6b7280" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <ThemedText className="text-xl font-bold text-gray-800">
              Chi tiết bài đọc
            </ThemedText>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6 pb-32">
            {/* Title Section */}
            <View style={styles.titleSection}>
              <View style={styles.titleHeader}>
                <View
                  style={[
                    styles.levelBadge,
                    { backgroundColor: getLevelColor(passage.level) },
                  ]}
                >
                  <ThemedText style={styles.levelText}>
                    {passage.level}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  onPress={() => setShowTranslation(!showTranslation)}
                  style={styles.translationToggle}
                >
                  {showTranslation ? (
                    <EyeOff size={18} color="#4f46e5" />
                  ) : (
                    <Eye size={18} color="#4f46e5" />
                  )}
                  <ThemedText style={styles.toggleText}>
                    {showTranslation ? "Ẩn bản dịch" : "Hiện bản dịch"}
                  </ThemedText>
                </TouchableOpacity>
              </View>
              <ThemedText style={styles.title}>{passage.title}</ThemedText>
              <ThemedText style={styles.description}>
                {passage.description}
              </ThemedText>
            </View>

            {/* Reading Content */}
            <View style={styles.contentCard}>
              <View style={styles.contentHeader}>
                <BookOpen size={24} color="#4f46e5" />
                <ThemedText style={styles.contentTitle}>
                  Nội dung bài đọc
                </ThemedText>
              </View>

              <View style={styles.contentList}>
                {passage.content.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.contentItem,
                      index === passage.content.length - 1 &&
                        styles.lastContentItem,
                    ]}
                  >
                    {/* Japanese Text */}
                    <View style={styles.japaneseContainer}>
                      <ThemedText style={styles.japaneseText}>
                        {item.japanese}
                      </ThemedText>
                      {item.furigana && item.furigana !== item.japanese && (
                        <ThemedText style={styles.furiganaText}>
                          {item.furigana}
                        </ThemedText>
                      )}
                    </View>

                    {/* Vietnamese Translation */}
                    {showTranslation && (
                      <View style={styles.translationContainer}>
                        <ThemedText style={styles.translationText}>
                          {item.vietnamese}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Reading Tips */}
            <View style={styles.tipsCard}>
              <ThemedText style={styles.tipsTitle}>💡 Mẹo đọc hiểu</ThemedText>
              <ThemedText style={styles.tipsText}>
                • Đọc kỹ từng câu và cố gắng hiểu nghĩa trước khi xem bản dịch
                {"\n"}• Chú ý đến các từ vựng và ngữ pháp đã học{"\n"}• Luyện
                đọc lại nhiều lần để ghi nhớ từ vựng và cách diễn đạt
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleSection: {
    marginBottom: 24,
  },
  titleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  translationToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleText: {
    color: "#4f46e5",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  description: {
    color: "#4b5563",
    fontSize: 16,
  },
  contentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4f46e5",
    marginLeft: 8,
  },
  contentList: {
    // gap handled by marginBottom in contentItem
  },
  contentItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 24,
    marginBottom: 24,
  },
  lastContentItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },
  japaneseContainer: {
    marginBottom: 12,
  },
  japaneseText: {
    fontSize: 22,
    fontWeight: "500",
    color: "#1f2937",
    lineHeight: 32,
  },
  furiganaText: {
    fontSize: 18,
    color: "#6b7280",
    marginTop: 8,
    lineHeight: 28,
  },
  translationContainer: {
    backgroundColor: "#eef2ff",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  translationText: {
    fontSize: 16,
    color: "#1e1b4b",
    lineHeight: 24,
  },
  tipsCard: {
    backgroundColor: "#fffbeb",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 8,
  },
  tipsText: {
    color: "#b45309",
    fontSize: 14,
    lineHeight: 24,
  },
});
