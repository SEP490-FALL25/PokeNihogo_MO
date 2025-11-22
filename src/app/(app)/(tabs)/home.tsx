import { DailyLoginModal } from "@components/DailyLoginModal";
import HomeLayout, { HomeLayoutRef } from "@components/layouts/HomeLayout";
import MainNavigation from "@components/MainNavigation";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import WelcomeModal from "@components/ui/WelcomeModal";
import { SubscriptionFeatureKey } from "@constants/subscription.enum";
import useAuthHook from "@hooks/useAuth";
import { useMinimalAlert } from "@hooks/useMinimalAlert";
import { useSrsReview } from "@hooks/useSrsReview";
import { useCheckFeature } from "@hooks/useSubscriptionFeatures";
import { useRecentExercises } from "@hooks/useUserHistory";
import { ISrsReviewItem } from "@models/srs/srs-review.response";
import { IRecentExerciseItem } from "@models/user-history/user-history.response";
import { ROUTES } from "@routes/routes";
import attendanceService from "@services/attendance";
import { useUserStore } from "@stores/user/user.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  BookOpen,
  BookText,
  ChevronRight,
  Languages,
  Lock,
  Sparkles,
  Target,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useCopilot } from "react-native-copilot";
import starters from "../../../../mock-data/starters.json";
import { Starter } from "../../../types/starter.types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const normalizeDateKey = (dateString?: string) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

/**
 * Exercise Card Component for Recent Exercises
 */
const ExerciseCard: React.FC<{
  exercise: IRecentExerciseItem;
  onPress: () => void;
}> = ({ exercise, onPress }) => {
  const { t } = useTranslation();

  const getExerciseTypeInfo = (exerciseName: string) => {
    const name = exerciseName.toLowerCase();
    if (name.includes("vocabulary") || name.includes("vocab")) {
      return {
        icon: BookOpen,
        color: "#3b82f6", // Blue
        type: t("home.exercise_types.vocabulary", "Từ vựng"),
      };
    } else if (name.includes("kanji")) {
      return {
        icon: Languages,
        color: "#ef4444", // Red
        type: t("home.exercise_types.kanji", "Kanji"),
      };
    } else if (name.includes("grammar") || name.includes("gramma")) {
      return {
        icon: BookText,
        color: "#f59e0b", // Amber
        type: t("home.exercise_types.grammar", "Ngữ pháp"),
      };
    } else {
      return {
        icon: BookOpen,
        color: "#8b5cf6", // Purple
        type: t("home.exercise_types.exercise", "Bài tập"),
      };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "#10b981";
      case "FAILED":
        return "#ef4444";
      case "SKIPPED":
        return "#f59e0b";
      default:
        return "#3b82f6";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return t("home.exercise_status.completed", "Hoàn thành");
      case "FAILED":
        return t("home.exercise_status.failed", "Chưa đạt");
      case "SKIPPED":
        return t("home.exercise_status.skipped", "Đã bỏ qua");
      default:
        return status;
    }
  };

  const typeInfo = getExerciseTypeInfo(exercise.exerciseName);
  const Icon = typeInfo.icon;
  const statusColor = getStatusColor(exercise.status);

  return (
    <TouchableOpacity
      style={styles.testCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.testCardIcon, { backgroundColor: typeInfo.color }]}>
        <Icon size={24} color="#ffffff" />
      </View>
      <View style={styles.testCardContent}>
        <ThemedText style={styles.testCardTitle} numberOfLines={1}>
          {exercise.exerciseName}
        </ThemedText>
        <ThemedText style={styles.testCardSubtitle} numberOfLines={1}>
          {exercise.lessonTitle}
        </ThemedText>
        <View
          style={[
            styles.testCardStatus,
            { backgroundColor: `${statusColor}15` },
          ]}
        >
          <ThemedText
            style={[styles.testCardStatusText, { color: statusColor }]}
          >
            {getStatusText(exercise.status)}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Suggestion Card Component
 */
const SuggestionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  onPress: () => void;
}> = ({ title, description, icon: Icon, onPress }) => (
  <TouchableOpacity
    style={styles.suggestionCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.suggestionIcon}>
      <Icon size={20} color="#3b82f6" />
    </View>
    <View style={styles.suggestionContent}>
      <ThemedText style={styles.suggestionTitle}>{title}</ThemedText>
      <ThemedText style={styles.suggestionDescription} numberOfLines={2}>
        {description}
      </ThemedText>
    </View>
    <ChevronRight size={20} color="#9ca3af" />
  </TouchableOpacity>
);

/**
 * Personalized SRS insight card
 */
const useSrsTypeConfig = () => {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      VOCABULARY: {
        label: t("home.srs_types.vocabulary", "Từ vựng"),
        labelLower: t("home.srs_types.vocabulary_lower", "từ vựng"),
        color: "#6366f1",
        icon: BookOpen,
      },
      KANJI: {
        label: t("home.srs_types.kanji", "Kanji"),
        labelLower: t("home.srs_types.kanji_lower", "kanji"),
        color: "#f97316",
        icon: Languages,
      },
      GRAMMAR: {
        label: t("home.srs_types.grammar", "Ngữ pháp"),
        labelLower: t("home.srs_types.grammar_lower", "ngữ pháp"),
        color: "#10b981",
        icon: BookText,
      },
    }),
    [t]
  );
};

const getInsightContentCopy = (insight: ISrsReviewItem, t: ReturnType<typeof useTranslation>["t"]) => {
  const content = insight.content as any;

  if (!content) {
    return {
      primary: t("home.srs_insights.review_now", "Ôn tập ngay"),
      secondary: "",
    };
  }

  switch (content.type) {
    case "vocabulary":
      return {
        primary: content.wordJp ?? t("home.srs_insights.vocabulary_title", "Từ mới"),
        secondary: [content.reading, content.meaning]
          .filter(Boolean)
          .join(" · "),
      };
    case "kanji":
      return {
        primary: content.character ?? t("home.srs_insights.kanji_title", "Kanji"),
        secondary: [content.meaning, content.jlptLevel && `JLPT N${content.jlptLevel}`]
          .filter(Boolean)
          .join(" · "),
      };
    case "grammar":
      return {
        primary: content.structure ?? t("home.srs_insights.grammar_title", "Ngữ pháp"),
        secondary: content.level
          ? t("home.srs_insights.grammar_level", {
              level: content.level,
              defaultValue: `Trình độ ${content.level}`,
            })
          : "",
      };
    default:
      return {
        primary: t("home.srs_insights.review_now", "Ôn tập ngay"),
        secondary: "",
      };
  }
};

const InsightCard: React.FC<{
  insight: ISrsReviewItem;
  onPress: (insight: ISrsReviewItem) => void;
  metaConfig: ReturnType<typeof useSrsTypeConfig>;
}> = ({ insight, onPress, metaConfig }) => {
  const { t } = useTranslation();
  const meta = metaConfig[insight.contentType] || metaConfig.VOCABULARY;
  const { primary, secondary } = getInsightContentCopy(insight, t);
  const Icon = meta.icon;

  return (
    <TouchableOpacity
      style={[styles.insightCard, { borderColor: `${meta.color}33` }]}
      activeOpacity={0.85}
      onPress={() => onPress(insight)}
    >
      <View style={styles.insightBadgeRow}>
        <View style={[styles.insightBadge, { backgroundColor: `${meta.color}15` }]}>
          <Icon size={16} color={meta.color} />
          <ThemedText style={[styles.insightBadgeText, { color: meta.color }]}>
            {meta.label}
          </ThemedText>
        </View>
        {!insight.isRead && (
          <View style={styles.insightNewDot} />
        )}
      </View>

      <ThemedText style={styles.insightMessage} numberOfLines={2}>
        {insight.message}
      </ThemedText>

      <View style={styles.insightContent}>
        <ThemedText style={styles.insightContentPrimary} numberOfLines={1}>
          {primary}
        </ThemedText>
        {!!secondary && (
          <ThemedText style={styles.insightContentSecondary} numberOfLines={2}>
            {secondary}
          </ThemedText>
        )}
      </View>

      <View style={styles.insightAction}>
        <ThemedText style={[styles.insightActionText, { color: meta.color }]}>
          {t("home.srs_insights.action", "Ôn ngay")}
        </ThemedText>
        <ChevronRight size={16} color={meta.color} />
      </View>
    </TouchableOpacity>
  );
};

/**
 * HomeScreen Component
 *
 * Personalized home screen with statistics, charts, recent activities, and suggestions.
 *
 * @returns JSX.Element
 */
export default function HomeScreen() {
  const { t } = useTranslation();
  const srsTypeConfig = useSrsTypeConfig();
  const { user } = useAuthHook();
  const { showAlert } = useMinimalAlert();

  // Modal state management
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showDailyLogin, setShowDailyLogin] = useState(false);
  const [hasAutoOpenedAttendance, setHasAutoOpenedAttendance] = useState(false);
  const homeLayoutRef = useRef<HomeLayoutRef>(null);
  const queryClient = useQueryClient();

  // Global state from user store
  const { isFirstTimeLogin, starterId, email } = useUserStore();

  const {
    data: attendanceSummary,
    isLoading: isAttendanceLoading,
  } = useQuery({
    queryKey: ["attendance-summary", user?.data?.id],
    queryFn: attendanceService.getAttendanceSummary,
    enabled: !!user?.data?.id,
  });

  const username = useMemo(() => {
    const trimmedName = user?.data?.name?.trim();
    if (trimmedName) {
      return trimmedName;
    }

    if (email) {
      const [localPart] = email.split("@");
      if (localPart) {
        return localPart;
      }
    }

    return "Trainer";
  }, [user?.data?.name, email]);

  // Fetch user progress overview (for future use)
  // const { data: userProgressOverview } = useUserProgress();

  // Fetch recent exercises
  const { data: recentExercisesData } = useRecentExercises({
    currentPage: 1,
    pageSize: 10,
  });

  const todayKey = useMemo(() => new Date().toISOString().split("T")[0], []);

  const attendanceHistory = useMemo(() => {
    return (
      attendanceSummary?.attendances?.map((record) =>
        normalizeDateKey(record.date)
      ) || []
    );
  }, [attendanceSummary?.attendances]);

  const hasCheckedInToday = useMemo(() => {
    if (!attendanceHistory.length) {
      return false;
    }
    return attendanceHistory.includes(todayKey);
  }, [attendanceHistory, todayKey]);

  // Check if user has personalized recommendations feature
  const hasPersonalizedRecommendations = useCheckFeature(
    SubscriptionFeatureKey.PERSONALIZED_RECOMMENDATIONS
  );

  // Personalized SRS review insights
  const {
    data: srsReviewData,
    isLoading: isSrsLoading,
  } = useSrsReview({
    currentPage: 1,
    pageSize: 6,
  });

  // Get all activities from paginated data
  /**
   * Get user's selected starter Pokemon
   * Falls back to first starter if none selected
   */
  const selectedStarter = React.useMemo(() => {
    return (
      starters.find((starter: Starter) => starter.id === starterId) ||
      starters[0]
    );
  }, [starterId]);

  /**
   * Show welcome modal for first-time users
   */
  useEffect(() => {
    if (isFirstTimeLogin === true) {
      setShowWelcomeModal(true);
    }
  }, [isFirstTimeLogin]);

  useEffect(() => {
    if (!attendanceSummary || isAttendanceLoading) {
      return;
    }
    if (!hasCheckedInToday && !hasAutoOpenedAttendance) {
      setShowDailyLogin(true);
      setHasAutoOpenedAttendance(true);
    }
  }, [
    attendanceSummary,
    hasCheckedInToday,
    hasAutoOpenedAttendance,
    isAttendanceLoading,
  ]);

  /**
   * Handle welcome modal close
   */
  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
  };

  const checkInMutation = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance-summary", user?.data?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['wallet-user'] });
      showAlert(
        response?.message ||
          t("daily_login.success_message", "Điểm danh thành công!"),
        "success"
      );
    },
    onError: () => {
      const errorMessage = t(
        "daily_login.error_message",
        "Không thể điểm danh, vui lòng thử lại."
      );
      Alert.alert(
        t("daily_login.error_title", "Có lỗi xảy ra"),
        errorMessage
      );
      showAlert(errorMessage, "error");
    },
  });

  /**
   * Handle daily check-in action
   */
  const handleDailyCheckin = async () => {
    try {
      await checkInMutation.mutateAsync();
    } catch {
      // Error is handled in onError
    }
  };

  // Get recent exercises from API response
  const recentExercises = useMemo(() => {
    return recentExercisesData?.data?.results || [];
  }, [recentExercisesData]);

  const srsInsights = useMemo(() => {
    return srsReviewData?.data?.data?.results || [];
  }, [srsReviewData]);

  // Check if personalization is locked based on subscription feature
  const isPersonalizationLocked = useMemo(() => {
    // If user doesn't have the feature, it's locked
    return !hasPersonalizedRecommendations;
  }, [hasPersonalizedRecommendations]);

  const shouldRenderPersonalization = isSrsLoading || !!srsReviewData || isPersonalizationLocked;

  const dominantInsightType = useMemo(() => {
    if (!srsInsights.length) return null;
    const counts = srsInsights.reduce<Record<string, number>>((acc, insight) => {
      acc[insight.contentType] = (acc[insight.contentType] || 0) + 1;
      return acc;
    }, {});
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return null;
    const [type, count] = sorted[0];
    const meta =
      srsTypeConfig[type as ISrsReviewItem["contentType"]] ??
      srsTypeConfig.VOCABULARY;
    return {
      ...meta,
      count,
    };
  }, [srsInsights, srsTypeConfig]);

  const HighlightIcon = dominantInsightType?.icon;

  /**
   * Handle exercise card press
   */
  const handleExercisePress = (exercise: IRecentExerciseItem) => {
    router.push(`${ROUTES.TABS.LEARN}?lessonId=${exercise.lessonId}`);
  };

  /**
   * Handle suggestion press
   */
  const handleSuggestionPress = (type: string) => {
    if (type === "learn") {
      router.push(ROUTES.TABS.LEARN);
      return;
    }
    if (type === "practice") {
      router.push(ROUTES.TABS.LISTENING);
    }
  };

  /**
   * Handle personalized insight tap
   */
  const handleInsightPress = (insight: ISrsReviewItem) => {
    if (insight.contentType === "GRAMMAR") {
      router.push(ROUTES.TABS.LEARN);
      return;
    }

    // Direct vocabulary & kanji to dictionary hub for now
    router.push(ROUTES.ME.DICTIONARY);
  };

  const handleUnlockPress = () => {
    router.push(ROUTES.APP.SUBSCRIPTION);
  };

  const { copilotEvents } = useCopilot();

  // Handle tour step changes for auto-scroll
  React.useEffect(() => {
    const handleStepChange = (step: any) => {
      if (step.name === "navigation" && homeLayoutRef.current) {
        setTimeout(() => {
          homeLayoutRef.current?.scrollTo(1000);
        }, 500);
      }
    };

    copilotEvents.on("stepChange", handleStepChange);

    return () => {
      copilotEvents.off("stepChange", handleStepChange);
    };
  }, [copilotEvents]);
  return (
    <HomeLayout ref={homeLayoutRef}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <ThemedText type="subtitle" style={styles.welcomeTitle}>
            {t("home.welcome_back", {
              username,
            })}
          </ThemedText>
          <ThemedText style={styles.welcomeSubtitle}>
            {t("home.ready_to_continue")}
          </ThemedText>
        </View>

        {shouldRenderPersonalization && (
          <View style={styles.aiSection}>
            <View style={isPersonalizationLocked && styles.lockedContainer}>
              <LinearGradient
                colors={isPersonalizationLocked ? ["#f3f4f6", "#e5e7eb"] : ["#eef2ff", "#fdf2f8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.aiHeroCard, isPersonalizationLocked && styles.aiHeroCardLocked]}
              >
                <View style={styles.aiHeroHeader}>
                  <View style={[styles.aiHeroBadge, isPersonalizationLocked && styles.aiHeroBadgeLocked]}>
                    <Sparkles size={16} color={isPersonalizationLocked ? "#9ca3af" : "#7c3aed"} />
                    <ThemedText style={[styles.aiHeroBadgeText, isPersonalizationLocked && styles.aiHeroBadgeTextLocked]}>
                      {t("home.ai.assistant_badge", "Trợ lý AI")}
                    </ThemedText>
                  </View>
                  {srsInsights.length > 0 && !isPersonalizationLocked && (
                    <ThemedText style={styles.aiHeroCount}>
                      {t("home.ai.items_to_review", {
                        count: srsInsights.length,
                        defaultValue: "{{count}} mục cần ôn",
                      })}
                    </ThemedText>
                  )}
                </View>
                <ThemedText style={[styles.aiHeroTitle, isPersonalizationLocked && styles.aiHeroTitleLocked]} numberOfLines={2}>
                  {isPersonalizationLocked
                    ? t("home.ai.locked_title", "Nâng cấp để mở khóa")
                    : t("home.ai.unlocked_title", "Cá nhân hoá cho hôm nay")}
                </ThemedText>
                <ThemedText style={[styles.aiHeroSubtitle, isPersonalizationLocked && styles.aiHeroSubtitleLocked]} numberOfLines={3}>
                  {isPersonalizationLocked
                    ? t(
                        "home.ai.locked_subtitle",
                        "Mua gói AI Coach để nhận gợi ý học tập riêng cho bạn."
                      )
                    : dominantInsightType
                    ? t("home.ai.focus_message", {
                        topic: dominantInsightType.labelLower,
                        defaultValue: `Bạn đang cần củng cố ${dominantInsightType.labelLower} nhiều nhất.`,
                      })
                    : t(
                        "home.ai.no_insight_message",
                        "Hệ thống sẽ theo dõi tiến trình để gửi thêm gợi ý khi có."
                      )}
                </ThemedText>
                {dominantInsightType && HighlightIcon && !isPersonalizationLocked && (
                  <View style={styles.aiHeroHighlight}>
                    <HighlightIcon size={18} color={dominantInsightType.color} />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.aiHeroHighlightText} numberOfLines={1}>
                        {t("home.ai.highlight_count", {
                          count: dominantInsightType.count,
                          topic: dominantInsightType.labelLower,
                          defaultValue: "{{count}} mục {{topic}}",
                        })}
                      </ThemedText>
                      <ThemedText style={styles.aiHeroHighlightSub} numberOfLines={2}>
                        {t(
                          "home.ai.highlight_hint",
                          "Tập trung trong 5 phút để nhớ lâu hơn"
                        )}
                      </ThemedText>
                    </View>
                  </View>
                )}
                {isPersonalizationLocked && (
                  <View style={[styles.aiHeroHighlight, styles.aiHeroHighlightLocked]}>
                    <Lock size={18} color="#9ca3af" />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.aiHeroHighlightTextLocked} numberOfLines={1}>
                        {t(
                          "home.ai.locked_highlight_title",
                          "Quyền lợi dành riêng cho hội viên"
                        )}
                      </ThemedText>
                      <ThemedText style={styles.aiHeroHighlightSubLocked} numberOfLines={2}>
                        {t(
                          "home.ai.locked_highlight_subtitle",
                          "Mở khoá để xem roadmap học và nhắc nhở thông minh"
                        )}
                      </ThemedText>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </View>

            <View style={styles.insightList}>
              {isPersonalizationLocked && (
                <View style={styles.insightLockedState}>
                  <View style={styles.insightLockedBadge}>
                    <Lock size={18} color="#9ca3af" />
                    <ThemedText style={styles.insightLockedBadgeText}>
                      {t("home.insight_locked.badge", "Tính năng cao cấp")}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.insightLockedTitle} numberOfLines={2}>
                    {t("home.insight_locked.title", "Mở khóa trợ lý cá nhân hóa")}
                  </ThemedText>
                  <ThemedText style={styles.insightLockedDescription} numberOfLines={3}>
                    {t(
                      "home.insight_locked.description",
                      "Tự động phân tích sai sót, đề xuất flashcard cần ôn và nhắc bạn luyện tập mỗi ngày."
                    )}
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.unlockButton}
                    onPress={handleUnlockPress}
                    activeOpacity={0.85}
                  >
                    <ThemedText style={styles.unlockButtonText}>
                      {t("home.insight_locked.button", "Mua gói ngay")}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {!isPersonalizationLocked && isSrsLoading && (
                <View style={styles.insightSkeletonWrapper}>
                  {[1, 2].map((item) => (
                    <View key={item} style={styles.insightSkeleton} />
                  ))}
                </View>
              )}

              {!isPersonalizationLocked && !isSrsLoading && srsInsights.length > 0 && (
                <View style={styles.insightCardsWrapper}>
                  {srsInsights.slice(0, 3).map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      onPress={handleInsightPress}
                      metaConfig={srsTypeConfig}
                    />
                  ))}
                </View>
              )}

              {!isPersonalizationLocked && !isSrsLoading && srsInsights.length === 0 && (
                <View style={styles.insightEmptyState}>
                  <ThemedText style={styles.insightEmptyTitle}>
                    {t("home.insight_empty.title", "Mọi thứ đang rất tốt!")}
                  </ThemedText>
                  <ThemedText style={styles.insightEmptyDescription}>
                    {t(
                      "home.insight_empty.description",
                      "Khi bạn luyện tập thêm, trợ lý AI sẽ dựa vào lịch sử để đề xuất các nội dung cần ưu tiên."
                    )}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Recent Exercises */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t("home.recent_exercises")}
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push(ROUTES.TABS.LEARN)}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.seeAllText}>
                {t("home.see_all")}
              </ThemedText>
            </TouchableOpacity>
          </View>
          {recentExercises.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScrollContent}
            >
              {recentExercises.map((exercise: IRecentExerciseItem) => (
                <ExerciseCard
                  key={exercise.exerciseId}
                  exercise={exercise}
                  onPress={() => handleExercisePress(exercise)}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.recentEmptyState}>
              <ThemedText style={styles.recentEmptyTitle}>
                {t("home.recent_empty.title", "Chưa có bài tập gần đây")}
              </ThemedText>
              <ThemedText style={styles.recentEmptyDescription}>
                {t(
                  "home.recent_empty.description",
                  "Hoàn thành một bài học hoặc luyện tập để xem lịch sử tại đây."
                )}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Personalized Suggestions */}
        <ThemedView style={styles.suggestionsCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("home.suggestions")}
          </ThemedText>
          <View style={styles.suggestionsList}>
            <SuggestionCard
              title={t("home.suggestion_new_lesson")}
              description={t("home.suggestion_new_lesson_desc")}
              icon={BookOpen}
              onPress={() => handleSuggestionPress("learn")}
            />
            <SuggestionCard
              title={t("home.suggestion_practice")}
              description={t("home.suggestion_practice_desc")}
              icon={Target}
              onPress={() => handleSuggestionPress("practice")}
            />
          </View>
        </ThemedView>

        {/* Main Navigation */}
        <MainNavigation />
      </ScrollView>

      {/* Welcome Modal */}
      <WelcomeModal
        visible={showWelcomeModal}
        onClose={handleWelcomeModalClose}
        username={username}
        pokemonName={selectedStarter.name}
      />

      {/* Daily Login Modal */}
      <DailyLoginModal
        visible={showDailyLogin}
        onClose={() => setShowDailyLogin(false)}
        onCheckIn={handleDailyCheckin}
        streak={attendanceSummary?.totalStreak ?? 0}
        hasCheckedInToday={hasCheckedInToday}
        checkInHistory={attendanceHistory}
        isLoading={isAttendanceLoading && !attendanceSummary}
        isSubmitting={checkInMutation.isPending}
      />
    </HomeLayout>
  );
}

/**
 * Styles for HomeScreen component
 */
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 20,
  },
  // Welcome Section
  welcomeSection: {
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
  },
  // AI personalization
  aiSection: {
    gap: 16,
  },
  lockedContainer: {
    opacity: 0.6,
  },
  aiHeroCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  aiHeroCardLocked: {
    shadowColor: "#9ca3af",
    shadowOpacity: 0.05,
  },
  aiHeroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  aiHeroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  aiHeroBadgeLocked: {
    backgroundColor: "rgba(156, 163, 175, 0.15)",
  },
  aiHeroBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7c3aed",
  },
  aiHeroBadgeTextLocked: {
    color: "#9ca3af",
  },
  aiHeroCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4338ca",
  },
  aiHeroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  aiHeroTitleLocked: {
    color: "#6b7280",
  },
  aiHeroSubtitle: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 16,
  },
  aiHeroSubtitleLocked: {
    color: "#9ca3af",
  },
  aiHeroHighlight: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(67, 56, 202, 0.08)",
  },
  aiHeroHighlightLocked: {
    backgroundColor: "rgba(156, 163, 175, 0.08)",
  },
  aiHeroHighlightText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#312e81",
  },
  aiHeroHighlightTextLocked: {
    color: "#6b7280",
  },
  aiHeroHighlightSub: {
    fontSize: 13,
    color: "#4c1d95",
  },
  aiHeroHighlightSubLocked: {
    color: "#9ca3af",
  },
  insightList: {
    gap: 12,
  },
  insightCardsWrapper: {
    gap: 12,
  },
  insightCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#fff",
  },
  insightBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  insightBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  insightBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  insightNewDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f97316",
  },
  insightMessage: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
    marginBottom: 8,
    lineHeight: 21,
  },
  insightContent: {
    marginBottom: 12,
  },
  insightContentPrimary: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  insightContentSecondary: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  insightAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  insightActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  insightSkeletonWrapper: {
    gap: 10,
  },
  insightSkeleton: {
    height: 110,
    borderRadius: 18,
    backgroundColor: "#e5e7eb",
    opacity: 0.6,
  },
  insightEmptyState: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d9d6fe",
    padding: 16,
    backgroundColor: "#f5f3ff",
  },
  insightEmptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4c1d95",
    marginBottom: 6,
  },
  insightEmptyDescription: {
    fontSize: 14,
    color: "#6d28d9",
    lineHeight: 20,
  },
  insightLockedState: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 20,
    backgroundColor: "#f9fafb",
    gap: 12,
    opacity: 0.7,
  },
  insightLockedBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(156, 163, 175, 0.12)",
  },
  insightLockedBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  insightLockedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6b7280",
  },
  insightLockedDescription: {
    fontSize: 14,
    color: "#9ca3af",
    lineHeight: 22,
  },
  unlockButton: {
    marginTop: 4,
    borderRadius: 14,
    backgroundColor: "#7c3aed",
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  unlockButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  // Statistics
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    textAlign: "center",
  },
  // Chart
  chartCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartContainer: {
    marginTop: 8,
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chartBarContainer: {
    width: "80%",
    height: 100,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  chartBar: {
    width: "100%",
    borderRadius: 6,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
  },
  // Recent Activities
  recentSection: {
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  recentScrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  recentEmptyState: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  recentEmptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  recentEmptyDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  recentCard: {
    width: SCREEN_WIDTH * 0.75,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginRight: 12,
  },
  recentCardContent: {
    padding: 16,
  },
  recentCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  recentCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(243, 244, 246, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  recentCardInfo: {
    flex: 1,
  },
  recentCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  recentCardSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  recentCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentCardStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recentCardStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Suggestions
  suggestionsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  suggestionsList: {
    gap: 12,
    marginTop: 16,
  },
  suggestionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(239, 246, 255, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
  // Test Card Styles
  testCard: {
    width: SCREEN_WIDTH * 0.6,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    shadowColor: "#000",
    padding: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginRight: 12,
    flexDirection: "row",
    overflow: "hidden",
    minHeight: 70,
    height: 100,
  },
  testCardIcon: {
    height: "100%",
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 12,
    opacity: 0.6,
  },
  testCardContent: {
    flex: 1,
    padding: 12,
    paddingLeft: 8,
    justifyContent: "center",
  },
  testCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  testCardSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  testCardStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  testCardStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
