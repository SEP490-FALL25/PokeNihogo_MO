import { ThemedText } from "@components/ThemedText";
import BounceButton from "@components/ui/BounceButton";
import { RewardProgress } from "@components/ui/RewardProgress";
import { ExerciseAttemptStatus } from "@constants/exercise.enum";
import { useLesson, useLessonExercises } from "@hooks/useLessons";
import { useUserExerciseAttempt } from "@hooks/useUserExerciseAttempt";
import { ROUTES } from "@routes/routes";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
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
  ctaLabel: string;
  statusMeta?: {
    label: string;
    bgColor: string;
    textColor: string;
  } | null;
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
  ctaLabel,
  statusMeta,
}: DashboardCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={{
        backgroundColor: "white",
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,borderWidth: 2,
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
          <ThemedText style={{ fontSize: 28, lineHeight: 32 }}>{emoji}</ThemedText>
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
        <View style={{ alignItems: "flex-end" }}>
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
          {statusMeta ? (
            <View
              style={{
                marginTop: 8,
                backgroundColor: statusMeta.bgColor,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: statusMeta.textColor,
                }}
              >
                {statusMeta.label}
              </ThemedText>
            </View>
          ) : null}
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
          {ctaLabel}
        </ThemedText>
        <ChevronRight size={18} color="white" strokeWidth={3} />
      </View>
    </TouchableOpacity>
  );
};

// --- Main Screen ---
type ExerciseCategory = "vocabulary" | "grammar" | "kanji";

const LessonDetailScreen = () => {
  const { t } = useTranslation();
  const { id, status } = useLocalSearchParams<{ id?: string; status?: string }>();
  const { data: lessonData, isLoading, refetch: refetchLesson } = useLesson(id || "");
  const { data: lessonExercisesResponse, refetch: refetchLessonExercises } =
    useLessonExercises(id || "");
  const {
    data: exerciseAttemptData,
    isLoading: isExerciseAttemptLoading,
    refetch: refetchExerciseAttempts,
  } = useUserExerciseAttempt(id || "");
  const lesson: any = lessonData?.data || {};
  const lessonExercises: any[] = React.useMemo(
    () => lessonExercisesResponse?.data || [],
    [lessonExercisesResponse]
  );

  // Try multiple property names in case of mock/real difference, fallback to []
  const voca: any[] = lesson.voca || lesson.vocabulary || [];
  const grammar: any[] = lesson.grama || lesson.grammar || [];
  const kanji: any[] = lesson.kanji || [];
  const testId = lesson.testId;
  const checkLastTest = lesson.checkLastTest !== false; // Default to true if not specified

  const exerciseAttemptList = React.useMemo(() => {
    if (Array.isArray(exerciseAttemptData?.data)) {
      return exerciseAttemptData.data;
    }
    if (Array.isArray(exerciseAttemptData)) {
      return exerciseAttemptData;
    }
    return [];
  }, [exerciseAttemptData]);

  const exerciseAttemptMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    exerciseAttemptList.forEach((attempt: any) => {
      if (!attempt || !attempt.exerciseType) return;
      const key = attempt.exerciseType.toString().toLowerCase();
      map[key] = attempt;
    });
    return map;
  }, [exerciseAttemptList]);

  const exerciseStatusByType = React.useMemo(() => {
    const map: Record<string, string | undefined> = {};
    Object.entries(exerciseAttemptMap).forEach(([type, attempt]) => {
      map[type] = attempt?.status;
    });
    return map;
  }, [exerciseAttemptMap]);

  const getExerciseTypeLabel = React.useCallback(
    (type: ExerciseCategory | string) => {
      switch (type) {
        case "grammar":
          return t("lessons.lesson_types.grammar", "Grammar");
        case "kanji":
          return t("lessons.lesson_types.kanji", "Kanji");
        default:
          return t("lessons.lesson_types.vocabulary", "Vocabulary");
      }
    },
    [t]
  );

  const exerciseRewards = React.useMemo(() => {
    if (!Array.isArray(lessonExercises)) {
      return [];
    }

    const exercisesWithRewards = lessonExercises.filter(
      (item) => Array.isArray(item?.rewards) && item.rewards.length > 0
    );

    const exerciseRewardsList = exercisesWithRewards.map((item, index) => {
      const typeKey = (item.exerciseType || "").toLowerCase();
      const rewardDetails = (item.rewards || []).map((reward: any, idx: number) => ({
        id: reward.id ?? `${item.id}-${idx}`,
        name: reward.name,
        rewardType: reward.rewardType,
        rewardItem: reward.rewardItem,
        rewardTarget: reward.rewardTarget,
      }));

      return {
        id: item.id ?? index,
        name: item.exerciseType ? getExerciseTypeLabel(typeKey) : undefined,
        exerciseType: item.exerciseType,
        status: exerciseStatusByType[typeKey],
        rewards: rewardDetails,
        isBigReward: false,
      };
    });

    // Lấy rewardLesson từ exercise đầu tiên (vì tất cả đều giống nhau)
    const firstExercise = lessonExercises[0];
    const rewardLesson = firstExercise?.rewardLesson || [];
    
    // Tính số lượng exercises đã hoàn thành
    const completedExercises = exercisesWithRewards.filter((item) => {
      const typeKey = (item.exerciseType || "").toLowerCase();
      const normalized = (exerciseStatusByType[typeKey] || "").toUpperCase();
      return normalized === ExerciseAttemptStatus.COMPLETED;
    }).length;

    // Thêm phần thưởng cuối cùng (rewardLesson) nếu có
    if (rewardLesson.length > 0 && exercisesWithRewards.length > 0) {
      const rewardLessonDetails = rewardLesson.map((reward: any, idx: number) => ({
        id: reward.id ?? `reward-lesson-${idx}`,
        name: reward.name,
        rewardType: reward.rewardType,
        rewardItem: reward.rewardItem,
        rewardTarget: reward.rewardTarget,
      }));

      // Phần thưởng cuối cùng chỉ được nhận khi lesson status là COMPLETED
      // Ưu tiên lấy từ params (từ màn hình trước), fallback về lesson object
      const lessonStatus = (status || lesson.status || lesson.lessonProgress?.status || "").toUpperCase();
      const finalRewardStatus = lessonStatus === "COMPLETED" 
        ? ExerciseAttemptStatus.COMPLETED 
        : undefined;

      exerciseRewardsList.push({
        id: "reward-lesson-final",
        name: "Phần thưởng cuối cùng",
        exerciseType: undefined,
        status: finalRewardStatus,
        rewards: rewardLessonDetails,
        isBigReward: true,
      });
    }

    return exerciseRewardsList;
  }, [exerciseStatusByType, getExerciseTypeLabel, lessonExercises]);

  const getStatusMeta = React.useCallback(
    (type: ExerciseCategory) => {
      if (isExerciseAttemptLoading) return null;
      const attempt = exerciseAttemptMap[type];
      if (!attempt) return null;
      const normalized = (attempt.status || "").toUpperCase();

      const statusStyles: Record<
        string,
        { label: string; bgColor: string; textColor: string }
      > = {
        NOT_STARTED: {
          label: t("lesson_detail.status.not_started", "Chưa bắt đầu"),
          bgColor: "#e0f2fe",
          textColor: "#0369a1",
        },
        COMPLETED: {
          label: t("lesson_detail.status.completed", "Hoàn thành"),
          bgColor: "#dcfce7",
          textColor: "#15803d",
        },
        FAILED: {
          label: t("lesson_detail.status.failed", "Chưa đạt"),
          bgColor: "#fee2e2",
          textColor: "#b91c1c",
        },
        FAIL: {
          label: t("lesson_detail.status.failed", "Chưa đạt"),
          bgColor: "#fee2e2",
          textColor: "#b91c1c",
        },
        IN_PROGRESS: {
          label: t("lesson_detail.status.in_progress", "Đang làm"),
          bgColor: "#fef3c7",
          textColor: "#b45309",
        },
        ABANDONED: {
          label: t("lesson_detail.status.abandoned", "Đã bỏ"),
          bgColor: "#e2e8f0",
          textColor: "#475569",
        },
        SKIPPED: {
          label: t("lesson_detail.status.skipped", "Bỏ qua"),
          bgColor: "#f3f4f6",
          textColor: "#4b5563",
        },
        PENDING: {
          label: t("lesson_detail.status.pending", "Đang chờ"),
          bgColor: "#e0f2fe",
          textColor: "#0369a1",
        },
      };

      return (
        statusStyles[normalized] || {
          label: t("lesson_detail.status.unknown", "Chưa có dữ liệu"),
          bgColor: "#e2e8f0",
          textColor: "#475569",
        }
      );
    },
    [exerciseAttemptMap, isExerciseAttemptLoading, t]
  );

  useFocusEffect(
    React.useCallback(() => {
      if (!id) return;
      refetchLesson();
      refetchLessonExercises();
      refetchExerciseAttempts();
    }, [id, refetchLesson, refetchLessonExercises, refetchExerciseAttempts])
  );

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
    if (!checkLastTest) {
      console.warn("Cannot start test: checkLastTest is false");
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
            borderBottomRightRadius: 24,}}
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
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 100,
          }}
        >
          {exerciseRewards.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <RewardProgress exercises={exerciseRewards} />
            </View>
          )}
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
                {t("lesson_detail.about_title", "Về bài học này")}
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
                  lineHeight: 32,
                  fontSize: 26,
                  fontWeight: "bold",
                  color: "#6366f1",
                }}
              >
                {voca.length + grammar.length + kanji.length}
              </ThemedText>
              <ThemedText
                style={{
                  lineHeight: 16,
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: "600",
                  marginTop: 4,
                }}
              >
                {t("lesson_detail.stats.total_content", "Tổng nội dung")}
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
                  lineHeight: 32,
                  fontSize: 26,
                  fontWeight: "bold",
                  color: "#10b981",
                }}
              >
                3
              </ThemedText>
              <ThemedText
                style={{
                  lineHeight: 16,
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: "600",
                  marginTop: 4,
                }}
              >
                {t("lesson_detail.stats.sections", "Phần học")}
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
              {t("lesson_detail.content_list.title", "Danh sách nội dung")}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 13,
                color: "#6b7280",
                marginTop: 4,
              }}
            >
              {t(
                "lesson_detail.content_list.subtitle",
                "Chọn phần muốn học"
              )}
            </ThemedText>
          </View>

          {/* Vocabulary Section */}
          {voca.length > 0 && (
            <DashboardCard
              title={t("lesson_detail.cards.vocabulary.title", "Từ vựng")}
              subtitle={t(
                "lesson_detail.cards.vocabulary.subtitle",
                "Học từ mới tiếng Nhật"
              )}
              count={voca.length}
              emoji="📚"
              bgColor="#EEF2FF"
              accentColor="#6366f1"
              darkColor="#312e81"
              items={voca}
              onPress={() => navigateToContent("vocabulary")}
              ctaLabel={t("lesson_detail.cards.start_learning", "Bắt đầu học")}
              statusMeta={getStatusMeta("vocabulary")}
            />
          )}

          {/* Grammar Section */}
          {grammar.length > 0 && (
            <DashboardCard
              title={t("lesson_detail.cards.grammar.title", "Ngữ pháp")}
              subtitle={t(
                "lesson_detail.cards.grammar.subtitle",
                "Cấu trúc câu và mẫu câu"
              )}
              count={grammar.length}
              emoji="✏️"
              bgColor="#ECFEFF"
              accentColor="#06b6d4"
              darkColor="#164e63"
              items={grammar}
              onPress={() => navigateToContent("grammar")}
              ctaLabel={t("lesson_detail.cards.start_learning", "Bắt đầu học")}
              statusMeta={getStatusMeta("grammar")}
            />
          )}

          {/* Kanji Section */}
          {kanji.length > 0 && (
            <DashboardCard
              title={t("lesson_detail.cards.kanji.title", "Kanji")}
              subtitle={t(
                "lesson_detail.cards.kanji.subtitle",
                "Chữ Hán trong tiếng Nhật"
              )}
              count={kanji.length}
              emoji="🈯"
              bgColor="#FEF3C7"
              accentColor="#f59e0b"
              darkColor="#92400e"
              items={kanji}
              onPress={() => navigateToContent("kanji")}
              ctaLabel={t("lesson_detail.cards.start_learning", "Bắt đầu học")}
              statusMeta={getStatusMeta("kanji")}
            />
          )}

          {/* Start Button */}
          {testId && (
            <View style={{ marginTop: 8 }}>
              <BounceButton
                variant="solid"
                size="full"
                onPress={handleStartTest}
                disabled={!checkLastTest}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles
                    size={20}
                    color={checkLastTest ? "white" : "#9ca3af"}
                    style={{ marginRight: 8 }}
                  />
                  <ThemedText
                    style={{
                      color: checkLastTest ? "white" : "#9ca3af",
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    {t("lesson_detail.test.button", "Bắt đầu kiểm tra")}
                  </ThemedText>
                </View>
              </BounceButton>
              {!checkLastTest && (
                <ThemedText
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    textAlign: "center",
                    marginTop: 8,
                    fontStyle: "italic",
                  }}
                >
                  {t(
                    "lesson_detail.test.locked_hint",
                    "Hoàn thành tất cả các phần học để bắt đầu kiểm tra"
                  )}
                </ThemedText>
              )}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LessonDetailScreen;
