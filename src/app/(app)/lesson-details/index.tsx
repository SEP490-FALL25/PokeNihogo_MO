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

// --- Section Card Component ---
interface SectionCardProps {
  title: string;
  count: number;
  icon: string;
  bgColor: string;
  accentColor: string;
  previewItems: any[];
  onPress: () => void;
  renderPreview: (item: any, index: number) => React.ReactNode;
}

const SectionCard = ({
  title,
  count,
  icon,
  bgColor,
  accentColor,
  previewItems,
  onPress,
  renderPreview,
}: SectionCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.95}
      style={{
        backgroundColor: "white",
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: bgColor,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <ThemedText style={{ fontSize: 24 }}>{icon}</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: accentColor,
                marginBottom: 2,
              }}
            >
              {title}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 14,
                color: "#6b7280",
                fontWeight: "500",
              }}
            >
              {count} nội dung
            </ThemedText>
          </View>
        </View>
        <View
          style={{
            backgroundColor: bgColor,
            borderRadius: 12,
            padding: 8,
          }}
        >
          <ChevronRight size={20} color={accentColor} />
        </View>
      </View>

      {/* Preview Items */}
      {previewItems.length > 0 && (
        <View
          style={{
            backgroundColor: bgColor,
            borderRadius: 16,
            padding: 16,
          }}
        >
          {previewItems.slice(0, 3).map((item, index) => (
            <View key={index}>
              {renderPreview(item, index)}
              {index < Math.min(2, previewItems.length - 1) && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    marginVertical: 12,
                  }}
                />
              )}
            </View>
          ))}
          {previewItems.length > 3 && (
            <View style={{ marginTop: 12, alignItems: "center" }}>
              <ThemedText
                style={{
                  fontSize: 13,
                  color: accentColor,
                  fontWeight: "600",
                }}
              >
                +{previewItems.length - 3} nội dung khác
              </ThemedText>
            </View>
          )}
        </View>
      )}
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

          {/* Vocabulary Section */}
          {voca.length > 0 && (
            <SectionCard
              title="Từ vựng"
              count={voca.length}
              icon="📚"
              bgColor="#EEF2FF"
              accentColor="#4f46e5"
              previewItems={voca}
              onPress={() => navigateToContent("vocabulary")}
              renderPreview={(item) => (
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "#312e81",
                          marginBottom: 4,
                        }}
                      >
                        {item.wordJp}
                      </ThemedText>
                      <ThemedText
                        style={{
                          fontSize: 14,
                          color: "#6366f1",
                          fontWeight: "500",
                        }}
                      >
                        {item.reading}
                      </ThemedText>
                    </View>
                    {item.meanings && item.meanings.length > 0 && (
                      <ThemedText
                        style={{
                          fontSize: 13,
                          color: "#4f46e5",
                          fontWeight: "500",
                          marginLeft: 12,
                        }}
                      >
                        {typeof item.meanings[0] === "string"
                          ? item.meanings[0]
                          : item.meanings[0]?.meaning || ""}
                      </ThemedText>
                    )}
                  </View>
                </View>
              )}
            />
          )}

          {/* Grammar Section */}
          {grammar.length > 0 && (
            <SectionCard
              title="Ngữ pháp"
              count={grammar.length}
              icon="✏️"
              bgColor="#ECFEFF"
              accentColor="#0891b2"
              previewItems={grammar}
              onPress={() => navigateToContent("grammar")}
              renderPreview={(item) => (
                <View>
                  <ThemedText
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#164e63",
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </ThemedText>
                  {item.description && (
                    <ThemedText
                      style={{
                        fontSize: 13,
                        color: "#0e7490",
                        lineHeight: 20,
                      }}
                      numberOfLines={2}
                    >
                      {item.description}
                    </ThemedText>
                  )}
                </View>
              )}
            />
          )}

          {/* Kanji Section */}
          {kanji.length > 0 && (
            <SectionCard
              title="Kanji"
              count={kanji.length}
              icon="🈯"
              bgColor="#FEF3C7"
              accentColor="#d97706"
              previewItems={kanji}
              onPress={() => navigateToContent("kanji")}
              renderPreview={(item) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#fde68a",
                      borderRadius: 12,
                      width: 48,
                      height: 48,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 28,
                        fontWeight: "bold",
                        color: "#92400e",
                      }}
                    >
                      {item.character}
                    </ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText
                      style={{
                        fontSize: 15,
                        fontWeight: "bold",
                        color: "#92400e",
                        marginBottom: 2,
                      }}
                    >
                      {item.meaning?.split("##")[0] || item.meaning}
                    </ThemedText>
                    {(item.onReading || item.kunReading) && (
                      <ThemedText
                        style={{
                          fontSize: 12,
                          color: "#b45309",
                          fontWeight: "500",
                        }}
                      >
                        {[item.onReading, item.kunReading]
                          .filter(Boolean)
                          .join(" • ")}
                      </ThemedText>
                    )}
                  </View>
                </View>
              )}
            />
          )}

          {/* Start Button */}
          <View style={{ marginTop: 8 }}>
            <BounceButton variant="solid" size="full" onPress={() => {}}>
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
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LessonDetailScreen;
