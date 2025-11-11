import { ThemedText } from "@components/ThemedText";
import BounceButton from "@components/ui/BounceButton";
import { useLesson } from "@hooks/useLessons";
import { ROUTES } from "@routes/routes";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Modern Dashboard Card Component ---
interface DashboardCardProps {
  title: string;
  subtitle: string;
  count: number;
  emoji: string;
  bgColor: string;
  accentColor: string;
  darkColor: string;
  items: any[];
  onPress: () => void;
}

const DashboardCard = ({
  title,
  subtitle,
  count,
  emoji,
  bgColor,
  accentColor,
  darkColor,
  items,
  onPress,
}: DashboardCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={{
        backgroundColor: "white",
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: accentColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 2,
        borderColor: bgColor,
      }}
    >
      {/* Header with Stats */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        {/* Emoji Circle */}
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: bgColor,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <ThemedText style={{ fontSize: 28 }}>{emoji}</ThemedText>
        </View>

        {/* Title and Subtitle */}
        <View style={{ flex: 1 }}>
          <ThemedText
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: darkColor,
              marginBottom: 4,
            }}
          >
            {title}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 12,
              color: accentColor,
              fontWeight: "600",
            }}
          >
            {subtitle}
          </ThemedText>
        </View>

        {/* Count Badge */}
        <View
          style={{
            backgroundColor: bgColor,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
          }}
        >
          <ThemedText
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: darkColor,
            }}
          >
            {count}
          </ThemedText>
        </View>
      </View>

      {/* Preview Grid */}
      <View
        style={{
          backgroundColor: bgColor,
          borderRadius: 16,
          padding: 16,
          minHeight: 80,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {items.slice(0, 6).map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "white",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: accentColor + "40",
              }}
            >
              <ThemedText
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: darkColor,
                }}
              >
                {item.wordJp || item.title || item.character || "..."}
              </ThemedText>
            </View>
          ))}
          {items.length > 6 && (
            <View
              style={{
                backgroundColor: accentColor,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 12,
                justifyContent: "center",
              }}
            >
              <ThemedText
                style={{
                  fontSize: 13,
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                +{items.length - 6}
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Action Button */}
      <View
        style={{
          marginTop: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: accentColor,
          paddingVertical: 12,
          borderRadius: 14,
        }}
      >
        <ThemedText
          style={{
            fontSize: 15,
            fontWeight: "bold",
            color: "white",
            marginRight: 6,
          }}
        >
          Bắt đầu học
        </ThemedText>
        <ChevronRight size={18} color="white" strokeWidth={3} />
      </View>
    </TouchableOpacity>
  );
};

// --- Main Screen ---
const LessonDetailScreen = () => {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: lessonData, isLoading } = useLesson(id || "");
  const lesson: any = lessonData?.data || {};

  // Try multiple property names in case of mock/real difference, fallback to []
  const voca: any[] = lesson.voca || lesson.vocabulary || [];
  const grammar: any[] = lesson.grama || lesson.grammar || [];
  const kanji: any[] = lesson.kanji || [];
  const testId = lesson.testId;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-6">
          <View className="h-8 bg-gray-200 rounded-3xl mb-6 w-3/4" />
          <View className="h-32 bg-gray-100 rounded-3xl mb-4" />
          <View className="h-32 bg-gray-100 rounded-3xl mb-4" />
          <View className="h-32 bg-gray-100 rounded-3xl" />
        </View>
      </SafeAreaView>
    );
  }

  // Navigate to content list
  const navigateToContent = (contentType: "vocabulary" | "grammar" | "kanji") => {
    Haptics.selectionAsync();
    router.push({
      pathname: ROUTES.LESSON.CONTENT_LIST,
      params: {
        id,
        contentType,
        activityType: "learn",
      },
    });
  };

  // Navigate to test
  const handleStartTest = () => {
    if (!testId) {
      console.warn("No testId available for this lesson");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: ROUTES.TEST.TEST,
      params: {
        testId,
        testType: "LESSON_TEST",
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={["#79B4C4", "#85C3C3", "#9BC7B9"]}
        style={{ flex: 1 }}
      >
        {/* Sticky Header */}
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#f3f4f6",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: "center" }}>
              <ThemedText
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                {lesson.name || `${t("lessons.title")} ${id}`}
              </ThemedText>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        >
          {/* Lesson Description */}
          {lesson.description && (
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: 20,
                padding: 20,
                marginBottom: 24,
                borderLeftWidth: 4,
                borderLeftColor: "#3b82f6",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <BookOpen size={20} color="#3b82f6" />
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#1f2937",
                    marginLeft: 8,
                  }}
                >
                  Về bài học này
                </ThemedText>
              </View>
              <ThemedText
                style={{
                  fontSize: 15,
                  color: "#4b5563",
                  lineHeight: 24,
                }}
              >
                {lesson.description}
              </ThemedText>
            </View>
          )}

          {/* Stats Overview */}
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 20,
              padding: 20,
              marginBottom: 24,
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <ThemedText
                style={{
                  fontSize: 26,
                  fontWeight: "bold",
                  color: "#6366f1",
                }}
              >
                {voca.length + grammar.length + kanji.length}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: "600",
                  marginTop: 4,
                }}
              >
                Tổng nội dung
              </ThemedText>
            </View>
            <View
              style={{
                width: 1,
                backgroundColor: "#e5e7eb",
              }}
            />
            <View style={{ alignItems: "center" }}>
              <ThemedText
                style={{
                  fontSize: 26,
                  fontWeight: "bold",
                  color: "#10b981",
                }}
              >
                3
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: "600",
                  marginTop: 4,
                }}
              >
                Phần học
              </ThemedText>
            </View>
          </View>

          {/* Section Title */}
          <View style={{ marginBottom: 20 }}>
            <ThemedText
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#1f2937",
              }}
            >
              Danh sách nội dung
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 13,
                color: "#6b7280",
                marginTop: 4,
              }}
            >
              Chọn phần muốn học
            </ThemedText>
          </View>

          {/* Vocabulary Section */}
          {voca.length > 0 && (
            <DashboardCard
              title="Từ vựng"
              subtitle="Học từ mới tiếng Nhật"
              count={voca.length}
              emoji="📚"
              bgColor="#EEF2FF"
              accentColor="#6366f1"
              darkColor="#312e81"
              items={voca}
              onPress={() => navigateToContent("vocabulary")}
            />
          )}

          {/* Grammar Section */}
          {grammar.length > 0 && (
            <DashboardCard
              title="Ngữ pháp"
              subtitle="Cấu trúc câu và mẫu câu"
              count={grammar.length}
              emoji="✏️"
              bgColor="#ECFEFF"
              accentColor="#06b6d4"
              darkColor="#164e63"
              items={grammar}
              onPress={() => navigateToContent("grammar")}
            />
          )}

          {/* Kanji Section */}
          {kanji.length > 0 && (
            <DashboardCard
              title="Kanji"
              subtitle="Chữ Hán trong tiếng Nhật"
              count={kanji.length}
              emoji="🈯"
              bgColor="#FEF3C7"
              accentColor="#f59e0b"
              darkColor="#92400e"
              items={kanji}
              onPress={() => navigateToContent("kanji")}
            />
          )}

          {/* Start Button */}
          {testId && (
            <View style={{ marginTop: 8 }}>
              <BounceButton variant="solid" size="full" onPress={handleStartTest}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={20} color="white" style={{ marginRight: 8 }} />
                  <ThemedText
                    style={{
                      color: "white",
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    Bắt đầu kiểm tra
                  </ThemedText>
                </View>
              </BounceButton>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LessonDetailScreen;
