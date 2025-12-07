import { DailyLoginModal } from "@components/DailyLoginModal";
import HomeLayout, { HomeLayoutRef } from "@components/layouts/HomeLayout";
import MainNavigation from "@components/MainNavigation";
import { ThemedText } from "@components/ThemedText";
import WelcomeModal from "@components/ui/WelcomeModal";
import { SubscriptionFeatureKey } from "@constants/subscription.enum";
import { useAttendanceSummary, useCheckIn } from "@hooks/useAttendance";
import { useAuth } from "@hooks/useAuth";
import { useMinimalAlert } from "@hooks/useMinimalAlert";
import { useSrsReview } from "@hooks/useSrsReview";
import { useCheckFeature } from "@hooks/useSubscriptionFeatures";
import { useCreateNewExerciseAttempt } from "@hooks/useUserExerciseAttempt";
import { useRecentExercises } from "@hooks/useUserHistory";
import { useMarkAsRead } from "@hooks/useUserSrsReview";
import { ISrsReviewItem } from "@models/srs/srs-review.response";
import { IRecentExerciseItem } from "@models/user-history/user-history.response";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { ROUTES } from "@routes/routes";
import { useUserStore } from "@stores/user/user.config";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  BookOpen,
  BookText,
  ChevronRight,
  ChevronUp,
  Languages,
  Lock,
  Sparkles,
  X
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Dimensions,
  LayoutAnimation,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
  ViewStyle,
} from "react-native";
import { CopilotStep, useCopilot, walkthroughable } from "react-native-copilot";
import { NativeViewGestureHandler, TapGestureHandler } from "react-native-gesture-handler";
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import starters from "../../../../mock-data/starters.json";
import { Starter } from "../../../types/starter.types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Storage key for welcome modal shown state
const WELCOME_MODAL_SHOWN_KEY = "@WelcomeModal:hasBeenShown";

const useNormalizeDateKey = () => {
  return useCallback((dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "";
    }
  }, []);
};

/**
 * Exercise Card Component for Recent Exercises
 */
const ExerciseCard: React.FC<{
  exercise: IRecentExerciseItem;
  onPress: () => void;
  isLoading?: boolean;
}> = ({ exercise, onPress, isLoading = false }) => {
  const { t } = useTranslation();

  const getExerciseTypeInfo = useCallback((exerciseName: string) => {
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
  }, [t]);

  const getStatusColor = useCallback((status: string) => {
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
  }, []);

  const getStatusText = useCallback((status: string) => {
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
  }, [t]);

  const typeInfo = useMemo(() => getExerciseTypeInfo(exercise.exerciseName), [exercise.exerciseName, getExerciseTypeInfo]);
  const Icon = typeInfo.icon;
  const statusColor = useMemo(() => getStatusColor(exercise.status), [exercise.status, getStatusColor]);

  return (
    <TouchableOpacity
      style={[styles.testCard, isLoading && styles.testCardDisabled]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isLoading}
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

const useInsightContentCopy = () => {
  const { t } = useTranslation();
  
  return useCallback((insight: ISrsReviewItem) => {
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
  }, [t]);
};

const InsightCard: React.FC<{
  insight: ISrsReviewItem;
  onPress: (insight: ISrsReviewItem) => void;
  metaConfig: ReturnType<typeof useSrsTypeConfig>;
  style?: ViewStyle;
}> = ({ insight, onPress, metaConfig, style }) => {
  const { t } = useTranslation();
  const getInsightContentCopy = useInsightContentCopy();
  const meta = metaConfig[insight.contentType] || metaConfig.VOCABULARY;
  const { primary, secondary } = useMemo(() => getInsightContentCopy(insight), [insight, getInsightContentCopy]);
  const Icon = meta.icon;

  return (
    <TouchableOpacity
      style={[styles.insightCard, { borderColor: `${meta.color}33` }, style]}
      activeOpacity={0.95}
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
 */
export default function HomeScreen() {
  const { t } = useTranslation();
  const srsTypeConfig = useSrsTypeConfig();
  const { user } = useAuth();
  const { showAlert } = useMinimalAlert();

  // Modal state management
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showDailyLogin, setShowDailyLogin] = useState(false);
  const [hasAutoOpenedAttendance, setHasAutoOpenedAttendance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<ISrsReviewItem | null>(null);
  const [isFrontSide, setIsFrontSide] = useState(true);
  const [creatingExerciseId, setCreatingExerciseId] = useState<number | null>(null);
  
  // State for stacked vs expanded mode
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);
  const expandIconRotation = useSharedValue(0);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const backScrollRef = useRef(null);
  const homeLayoutRef = useRef<HomeLayoutRef>(null);
  const queryClient = useQueryClient();

  const { isFirstTimeLogin, starterId, email } = useUserStore();

  const {
    data: attendanceSummary,
    isLoading: isAttendanceLoading,
  } = useAttendanceSummary();

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

  const { data: recentExercisesData, refetch: refetchRecentExercises } = useRecentExercises({
    currentPage: 1,
    pageSize: 10,
  });

  const todayKey = useMemo(() => new Date().toISOString().split("T")[0], []);
  const normalizeDateKey = useNormalizeDateKey();

  const attendanceHistory = useMemo(() => {
    return (
      attendanceSummary?.attendances?.map((record) =>
        normalizeDateKey(record.date)
      ) || []
    );
  }, [attendanceSummary?.attendances, normalizeDateKey]);

  const hasCheckedInToday = useMemo(() => {
    if (!attendanceHistory.length) {
      return false;
    }
    return attendanceHistory.includes(todayKey);
  }, [attendanceHistory, todayKey]);

  const hasPersonalizedRecommendations = useCheckFeature(
    SubscriptionFeatureKey.PERSONALIZED_RECOMMENDATIONS
  );

  const {
    data: srsReviewData,
    isLoading: isSrsLoading,
    refetch: refetchSrsReview,
  } = useSrsReview({
    currentPage: 1,
    pageSize: 6,
  });

  const selectedStarter = React.useMemo(() => {
    return (
      starters.find((starter: Starter) => starter.id === starterId) ||
      starters[0]
    );
  }, [starterId]);

  useEffect(() => {
    const checkWelcomeModalShown = async () => {
      try {
        const hasBeenShown = await AsyncStorage.getItem(WELCOME_MODAL_SHOWN_KEY);
        if (hasBeenShown === "true") return;
        if (isFirstTimeLogin === true) {
          setShowWelcomeModal(true);
        }
      } catch (error) {
        console.error("Error checking welcome modal state:", error);
        if (isFirstTimeLogin === true) {
          setShowWelcomeModal(true);
        }
      }
    };
    checkWelcomeModalShown();
  }, [isFirstTimeLogin]);

  useEffect(() => {
    if (!attendanceSummary || isAttendanceLoading) return;
    if (!hasCheckedInToday && !hasAutoOpenedAttendance) {
      setShowDailyLogin(true);
      setHasAutoOpenedAttendance(true);
    }
  }, [attendanceSummary, hasCheckedInToday, hasAutoOpenedAttendance, isAttendanceLoading]);

  // Animation Style for Chevron
  const expandIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${expandIconRotation.value}deg` }],
    };
  });

  useFocusEffect(
    useCallback(() => {
      refetchSrsReview();
      refetchRecentExercises();
    }, [refetchSrsReview, refetchRecentExercises])
  );

  const handleWelcomeModalClose = useCallback(() => {
    setShowWelcomeModal(false);
  }, []);

  const checkInMutation = useCheckIn();
  
  // Handle check-in success/error with alerts
  useEffect(() => {
    if (checkInMutation.isSuccess && checkInMutation.data) {
      showAlert(
        checkInMutation.data?.message ||
          t("daily_login.success_message", "Điểm danh thành công!"),
        "success"
      );
    }
  }, [checkInMutation.isSuccess, checkInMutation.data, showAlert, t]);

  useEffect(() => {
    if (checkInMutation.isError) {
      const errorMessage = t(
        "daily_login.error_message",
        "Không thể điểm danh, vui lòng thử lại."
      );
      Alert.alert(t("daily_login.error_title", "Có lỗi xảy ra"), errorMessage);
      showAlert(errorMessage, "error");
    }
  }, [checkInMutation.isError, showAlert, t]);

  const markAsReadMutation = useMarkAsRead();
  
  // Handle mark as read success/error with alerts
  useEffect(() => {
    if (markAsReadMutation.isSuccess) {
      if (selectedInsight) {
        setSelectedInsight({ ...selectedInsight, isRead: true });
      }
      showAlert(
        t("home.flashcard.marked_as_read", "Đã đánh dấu đã đọc"),
        "success"
      );
    }
  }, [markAsReadMutation.isSuccess, selectedInsight, showAlert, t]);

  useEffect(() => {
    if (markAsReadMutation.isError) {
      showAlert(
        t("home.flashcard.mark_read_error", "Không thể đánh dấu đã đọc"),
        "error"
      );
    }
  }, [markAsReadMutation.isError, showAlert, t]);

  const handleDailyCheckin = useCallback(async () => {
    try {
      await checkInMutation.mutateAsync();
    } catch {}
  }, [checkInMutation]);

  const recentExercises = useMemo(() => {
    return recentExercisesData?.data?.results || [];
  }, [recentExercisesData]);

  const srsInsights = useMemo(() => {
    return srsReviewData?.data?.data?.results || [];
  }, [srsReviewData]);

  const isPersonalizationLocked = useMemo(() => {
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
    return { ...meta, count };
  }, [srsInsights, srsTypeConfig]);

  const { mutateAsync: createNewExerciseAttemptAsync, isPending: isCreatingExercise } = useCreateNewExerciseAttempt();

  const handleExercisePress = useCallback(async (exercise: IRecentExerciseItem) => {
    if (isCreatingExercise || creatingExerciseId !== null) {
      return; // Prevent multiple clicks
    }

    try {
      setCreatingExerciseId(exercise.exerciseId);
      // Create a new exercise attempt
      const response = await createNewExerciseAttemptAsync(exercise.exerciseId.toString());
      console.log(response);
      if (response?.data?.id) {
        // Navigate to quiz screen with the new exercise attempt ID
        router.push({
          pathname: ROUTES.QUIZ.QUIZ,
          params: {
            exerciseAttemptId: response.data.id.toString(),
            lessonId: exercise.lessonId.toString(),
          },
        });
      } else {
        setCreatingExerciseId(null);
        showAlert(
          t("home.exercise.error_creating", "Không thể tạo bài tập. Vui lòng thử lại."),
          "error"
        );
      }
    } catch (error) {
      console.error("Error creating exercise attempt:", error);
      setCreatingExerciseId(null);
      showAlert(
        t("home.exercise.error_creating", "Không thể tạo bài tập. Vui lòng thử lại."),
        "error"
      );
    }
  }, [isCreatingExercise, creatingExerciseId, createNewExerciseAttemptAsync, t, showAlert]);

  const handleSuggestionPress = useCallback((type: string) => {
    if (type === "learn") {
      router.push(ROUTES.TABS.LEARN);
      return;
    }
    if (type === "practice") {
      router.push(ROUTES.TABS.LISTENING);
    }
  }, []);

  /**
   * Handle personalized insight tap with Stack -> Expand logic
   */
  const toggleInsightsExpansion = useCallback(() => {
    // Spring animation for smoother bounce effect
    LayoutAnimation.configureNext({
      duration: 400,
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.7,
      },
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    
    const nextState = !isInsightsExpanded;
    setIsInsightsExpanded(nextState);
    expandIconRotation.value = withSpring(nextState ? 180 : 0);
  }, [isInsightsExpanded, expandIconRotation]);

  const handleInsightCardPress = useCallback((insight: ISrsReviewItem) => {
    if (!isInsightsExpanded) {
      toggleInsightsExpansion();
    } else {
      // If expanded, tapping opens the flashcard modal
      setSelectedInsight(insight);
      setShowFlashcardModal(true);
      setIsFrontSide(true);
      flipAnim.setValue(0);
    }
  }, [isInsightsExpanded, toggleInsightsExpansion, flipAnim]);

  const handleCloseFlashcardModal = useCallback(() => {
    setShowFlashcardModal(false);
    setSelectedInsight(null);
    setIsFrontSide(true);
    flipAnim.setValue(0);
  }, [flipAnim]);

  const toggleCardSide = useCallback(() => {
    const nextSideIsBack = isFrontSide;
    const toValue = nextSideIsBack ? 1 : 0;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    }).start();
    setIsFrontSide(!isFrontSide);
  }, [isFrontSide, flipAnim]);

  const handleUnlockPress = useCallback(() => {
    router.push(ROUTES.APP.SUBSCRIPTION);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["attendance-summary", user?.data?.id],
        }),
        queryClient.invalidateQueries({ queryKey: ["recent-exercises"] }),
        queryClient.invalidateQueries({ queryKey: ["user-srs-review"] }),
        queryClient.invalidateQueries({ queryKey: ["wallet-user"] }),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, user?.data?.id]);

  const WTTouchable = walkthroughable(TouchableOpacity);
  const { copilotEvents } = useCopilot();

  React.useEffect(() => {
    const handleStepChange = (step: any) => {
      if (step.name === "navigation" && homeLayoutRef.current) {
        setTimeout(() => {
          homeLayoutRef.current?.scrollTo(1000);
        }, 500);
      }
    };
    copilotEvents.on("stepChange", handleStepChange);
    return () => copilotEvents.off("stepChange", handleStepChange);
  }, [copilotEvents]);

  React.useEffect(() => {
    const handleTourStop = async () => {
      try {
        await AsyncStorage.setItem(WELCOME_MODAL_SHOWN_KEY, "true");
      } catch (error) {
        console.error("Error saving welcome modal state:", error);
      }
    };
    copilotEvents.on("stop", handleTourStop);
    return () => copilotEvents.off("stop", handleTourStop);
  }, [copilotEvents]);
  
  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  );

  return (
    <HomeLayout ref={homeLayoutRef} refreshControl={refreshControl}>
      <View style={styles.contentContainer}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <ThemedText type="subtitle" style={styles.welcomeTitle}>
            {t("home.welcome_back", { username })}
          </ThemedText>
          <ThemedText style={styles.welcomeSubtitle}>
            {t("home.ready_to_continue")}
          </ThemedText>
        </View>

        {shouldRenderPersonalization && (
          <View style={styles.aiSection}>
            <View style={styles.aiSectionContainer}>
              {/* First Card - AI Coach Intro */}
              <LinearGradient
                colors={isPersonalizationLocked ? ["#fefcfb", "#fff7ed", "#fff4e6"] : ["#eef2ff", "#fdf2f8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.aiHeroCard, isPersonalizationLocked && styles.aiHeroCardLocked]}
              >
                <View style={styles.aiHeroHeader}>
                  <View style={[styles.aiHeroBadge, isPersonalizationLocked && styles.aiHeroBadgeLocked]}>
                    <Sparkles size={16} color={isPersonalizationLocked ? "#d97706" : "#7c3aed"} />
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
                  {isPersonalizationLocked && (
                    <View style={styles.lockedPremiumBadge}>
                      <ThemedText style={styles.lockedPremiumBadgeText}>Premium</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={[styles.aiHeroTitle, isPersonalizationLocked && styles.aiHeroTitleLocked]} numberOfLines={2}>
                  {isPersonalizationLocked
                    ? t("home.ai.locked_title", "Nâng cấp để mở khóa")
                    : t("home.ai.unlocked_title", "Cá nhân hoá cho hôm nay")}
                </ThemedText>
                <ThemedText style={[styles.aiHeroSubtitle, isPersonalizationLocked && styles.aiHeroSubtitleLocked]} numberOfLines={3}>
                  {isPersonalizationLocked
                    ? t("home.ai.locked_subtitle", "Mua gói AI Coach để nhận gợi ý học tập riêng cho bạn.")
                    : dominantInsightType
                    ? t("home.ai.focus_message", {
                        topic: dominantInsightType.labelLower,
                        defaultValue: `Bạn đang cần củng cố ${dominantInsightType.labelLower} nhiều nhất.`,
                      })
                    : t("home.ai.no_insight_message", "Hệ thống sẽ theo dõi tiến trình để gửi thêm gợi ý khi có.")}
                </ThemedText>
              </LinearGradient>

              {/* Locked State Promo */}
              {isPersonalizationLocked && (
                <View style={styles.insightLockedState}>
                  <View style={styles.insightLockedBadge}>
                    <Lock size={18} color="#b45309" />
                    <ThemedText style={styles.insightLockedBadgeText}>
                      {t("home.insight_locked.badge", "Tính năng cao cấp")}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.insightLockedTitle} numberOfLines={2}>
                    {t("home.insight_locked.title", "Mở khóa trợ lý cá nhân hóa")}
                  </ThemedText>
                  <ThemedText style={styles.insightLockedDescription} numberOfLines={3}>
                    {t("home.insight_locked.description", "Tự động phân tích sai sót, đề xuất flashcard cần ôn và nhắc bạn luyện tập mỗi ngày.")}
                  </ThemedText>
                </View>
              )}

              {/* Lock Overlay */}
              {isPersonalizationLocked && (
                <CopilotStep
                  text={t("tour.ai_unlock_description", "Upgrade to Premium to unlock personalized AI assistant with smart features")}
                  order={5}
                  name="ai_unlock"
                >
                  <WTTouchable style={styles.lockOverlay} onPress={handleUnlockPress} activeOpacity={0.9}>
                    <View style={styles.lockOverlayContent}>
                      <View style={styles.lockIconContainer}>
                        <Lock size={48} color="#d97706" />
                      </View>
                      <ThemedText style={styles.lockOverlayText}>
                        {t("home.ai.unlock_button", "Mở khóa ngay")}
                      </ThemedText>
                    </View>
                  </WTTouchable>
                </CopilotStep>
              )}
            </View>

            {/* SRS Insight Cards List with Stacked Animation */}
            <View style={[
              styles.insightList,
              // Add top margin when stacked to push content down because cards are moved UP by negative margin
              !isInsightsExpanded && srsInsights.length > 0 && { marginTop: 24 }
            ]}>
              {!isPersonalizationLocked && isSrsLoading && (
                <View style={styles.insightSkeletonWrapper}>
                  {[1, 2].map((item) => (
                    <View key={item} style={styles.insightSkeleton} />
                  ))}
                </View>
              )}

              {!isPersonalizationLocked && !isSrsLoading && srsInsights.length > 0 && (
                <View style={styles.insightCardsWrapper}>
                  {isInsightsExpanded ? (
                    <ScrollView
                      style={styles.insightScrollView}
                      contentContainerStyle={styles.insightScrollContent}
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                    >
                      {srsInsights.map((insight, index) => {
                        const cardStyle: ViewStyle = {
                          marginTop: index === 0 ? 0 : 12,
                          zIndex: 1,
                        };

                        return (
                          <InsightCard
                            key={insight.id}
                            insight={insight}
                            onPress={handleInsightCardPress}
                            metaConfig={srsTypeConfig}
                            style={cardStyle}
                          />
                        );
                      })}
                    </ScrollView>
                  ) : (
                    <>
                      {srsInsights.map((insight, index) => {
                        // If stacked, only render top 3 cards to save rendering
                        if (index > 2) return null;
                        
                        let cardStyle: ViewStyle = {};
                        
                        if (index === 0) {
                          // First card relative
                          cardStyle = { 
                            zIndex: 10,
                          };
                        } else {
                          // Stacked cards
                          cardStyle = {
                            position: 'absolute',
                            top: -7 * index, // Stack upwards
                            left: 0,
                            right: 0,
                            height: '100%', // FORCE HEIGHT to match first card, hiding bottom
                            zIndex: 10 - index,
                            transform: [{ scaleX: 1 - (index * 0.04) }], // Slight width reduction
                            backgroundColor: '#fff', // Ensure opacity doesn't show through
                          };
                        }

                        return (
                          <InsightCard
                            key={insight.id}
                            insight={insight}
                            onPress={handleInsightCardPress}
                            metaConfig={srsTypeConfig}
                            style={cardStyle}
                          />
                        );
                      })}
                    </>
                  )}
                  
                  {/* Small collapse button ONLY when expanded, to allow user to re-stack */}
                  {isInsightsExpanded && srsInsights.length > 1 && (
                    <TouchableOpacity 
                      onPress={toggleInsightsExpansion} 
                      style={styles.expandButton}
                      activeOpacity={0.7}
                    >
                      <Reanimated.View style={expandIconStyle}>
                        <ChevronUp size={20} color="#9ca3af" />
                      </Reanimated.View>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {!isPersonalizationLocked && !isSrsLoading && srsInsights.length === 0 && (
                <View style={styles.insightEmptyState}>
                  <ThemedText style={styles.insightEmptyTitle}>
                    {t("home.insight_empty.title", "Mọi thứ đang rất tốt!")}
                  </ThemedText>
                  <ThemedText style={styles.insightEmptyDescription}>
                    {t("home.insight_empty.description", "Khi bạn luyện tập thêm, trợ lý AI sẽ dựa vào lịch sử để đề xuất các nội dung cần ưu tiên.")}
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
            <TouchableOpacity onPress={() => router.push(ROUTES.ME.EXERCISE_HISTORY)} activeOpacity={0.7}>
              <ThemedText style={styles.seeAllText}>{t("home.see_all")}</ThemedText>
            </TouchableOpacity>
          </View>
          {recentExercises.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScrollContent}>
              {recentExercises.map((exercise: IRecentExerciseItem) => (
                <ExerciseCard
                  key={exercise.exerciseId}
                  exercise={exercise}
                  onPress={() => handleExercisePress(exercise)}
                  isLoading={creatingExerciseId === exercise.exerciseId}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.recentEmptyState}>
              <ThemedText style={styles.recentEmptyTitle}>
                {t("home.recent_empty.title", "Chưa có bài tập gần đây")}
              </ThemedText>
              <ThemedText style={styles.recentEmptyDescription}>
                {t("home.recent_empty.description", "Hoàn thành một bài học hoặc luyện tập để xem lịch sử tại đây.")}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Suggestions */}
        {/* <ThemedView style={styles.suggestionsCard}>
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
        </ThemedView> */}

        <MainNavigation />
      </View>

      <WelcomeModal
        visible={showWelcomeModal}
        onClose={handleWelcomeModalClose}
        username={username}
        pokemonName={selectedStarter.name}
      />

      <DailyLoginModal
        visible={showDailyLogin}
        onClose={() => setShowDailyLogin(false)}
        onCheckIn={handleDailyCheckin}
        streak={attendanceSummary?.totalStreak ?? 0}
        weeklyCount={attendanceSummary?.count ?? 0}
        hasCheckedInToday={hasCheckedInToday}
        checkInHistory={attendanceHistory}
        isLoading={isAttendanceLoading && !attendanceSummary}
        isSubmitting={checkInMutation.isPending}
      />

      {/* Flashcard Modal */}
      <Modal
        visible={showFlashcardModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseFlashcardModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseFlashcardModal}>
          <View style={styles.flashcardModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.flashcardModalContainer}>
                <TouchableOpacity
                  style={styles.flashcardCloseButton}
                  onPress={handleCloseFlashcardModal}
                >
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>

                {selectedInsight && (() => {
                  const content = selectedInsight.content as any;
                  const isKanji = selectedInsight.contentType === "KANJI";
                  const isGrammar = selectedInsight.contentType === "GRAMMAR";

                  return (
                    <View style={{ position: "relative", width: "100%" }}>
                      <TapGestureHandler
                        enabled={true}
                        onActivated={toggleCardSide}
                        waitFor={!isFrontSide ? backScrollRef as any : undefined}
                      >
                        <View style={{ position: "relative", width: "100%" }}>
                        <Animated.View
                          style={[
                            styles.flashcard,
                            {
                              transform: [{ rotateY: flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) }],
                              backfaceVisibility: "hidden" as const,
                            },
                          ]}
                          pointerEvents={isFrontSide ? "auto" : "none"}
                        >
                          <View style={styles.flashcardContent}>
                            {isKanji ? (
                              <View style={styles.flashcardFrontContent}>
                                <ThemedText style={[styles.flashcardKanjiCharacter, { color: "#b45309" }]}>
                                  {content?.character || ""}
                                </ThemedText>
                              </View>
                            ) : isGrammar ? (
                              <View style={styles.flashcardFrontContent}>
                                <ThemedText style={[styles.flashcardGrammarStructure, { color: "#0e7490" }]}>
                                  {content?.structure || ""}
                                </ThemedText>
                                {content?.level && (
                                  <ThemedText style={[styles.flashcardGrammarLevel, { color: "#06b6d4" }]}>
                                    {content.level}
                                  </ThemedText>
                                )}
                              </View>
                            ) : (
                              <View style={styles.flashcardFrontContent}>
                                <ThemedText style={[styles.flashcardVocabularyWord, { color: "#0369a1" }]}>
                                  {content?.wordJp || ""}
                                </ThemedText>
                                {content?.reading && (
                                  <ThemedText style={[styles.flashcardVocabularyReading, { color: "#0ea5e9" }]}>
                                    {content.reading}
                                  </ThemedText>
                                )}
                              </View>
                            )}
                          </View>
                        </Animated.View>

                        <Animated.View
                          style={[
                            styles.flashcard,
                            styles.flashcardBack,
                            {
                              transform: [{ rotateY: flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] }) }],
                              backfaceVisibility: "hidden" as const,
                            },
                          ]}
                          pointerEvents={isFrontSide ? "none" : "auto"}
                        >
                          <NativeViewGestureHandler ref={backScrollRef as any}>
                            <ScrollView
                              nestedScrollEnabled
                              keyboardShouldPersistTaps="always"
                              scrollEventThrottle={16}
                              contentContainerStyle={styles.flashcardBackContent}
                              showsVerticalScrollIndicator={false}
                              style={{ flex: 1 }}
                            >
                              {isKanji ? (
                                <View style={styles.flashcardBackInner}>
                                  {content?.meaning && (
                                    <View style={[styles.flashcardBackBox, { backgroundColor: "#fef3c7", borderColor: "#fde68a" }]}>
                                      <ThemedText style={[styles.flashcardBackText, { color: "#92400e" }]}>{content.meaning}</ThemedText>
                                    </View>
                                  )}
                                  {(content?.onReading || content?.kunReading) && (
                                    <View style={styles.flashcardReadingContainer}>
                                      {content?.onReading && (
                                        <ThemedText style={[styles.flashcardReadingText, { color: "#d97706" }]}>
                                          {t("home.flashcard.on_reading", "On")}: {content.onReading}
                                        </ThemedText>
                                      )}
                                      {content?.kunReading && (
                                        <ThemedText style={[styles.flashcardReadingText, { color: "#d97706" }]}>
                                          {t("home.flashcard.kun_reading", "Kun")}: {content.kunReading}
                                        </ThemedText>
                                      )}
                                    </View>
                                  )}
                                </View>
                              ) : isGrammar ? (
                                <View style={styles.flashcardBackInner}>
                                  {content?.usages && content.usages.length > 0 && (
                                    <View style={[styles.flashcardBackBox, { backgroundColor: "#cffafe", borderColor: "#a5f3fc" }]}>
                                      <ThemedText style={[styles.flashcardBackText, { color: "#155e75" }]}>
                                        {content.usages[0]?.explanation || ""}
                                      </ThemedText>
                                      {content.usages[0]?.exampleSentence && (
                                        <ThemedText style={[styles.flashcardExampleText, { color: "#0e7490" }]}>
                                          {content.usages[0].exampleSentence}
                                        </ThemedText>
                                      )}
                                    </View>
                                  )}
                                </View>
                              ) : (
                                <View style={styles.flashcardBackInner}>
                                  {content?.meaning && (
                                    <View style={[styles.flashcardBackBox, { backgroundColor: "#e0f2fe", borderColor: "#bae6fd" }]}>
                                      <ThemedText style={[styles.flashcardBackText, { color: "#0369a1" }]}>{content.meaning}</ThemedText>
                                    </View>
                                  )}
                                </View>
                              )}
                            </ScrollView>
                          </NativeViewGestureHandler>
                        </Animated.View>
                        </View>
                      </TapGestureHandler>
                      
                      {/* Mark as Read Button */}
                      {!selectedInsight.isRead && (
                        <TouchableOpacity
                          style={styles.markAsReadButton}
                          onPress={() => {
                            if (!markAsReadMutation.isPending) {
                              markAsReadMutation.mutate(selectedInsight.id);
                            }
                          }}
                          disabled={markAsReadMutation.isPending}
                          activeOpacity={0.7}
                        >
                          <ThemedText style={styles.markAsReadButtonText}>
                            {markAsReadMutation.isPending
                              ? t("home.flashcard.marking", "Đang xử lý...")
                              : t("home.flashcard.mark_as_read", "Đã đọc")}
                          </ThemedText>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </HomeLayout>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 24,
    gap: 20,
  },
  welcomeSection: {
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
    flex: 1,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
  },
  aiSection: {
    gap: 16,
  },
  aiSectionContainer: {
    position: "relative",
    gap: 16,
  },
  aiHeroCard: {
    borderRadius: 24,
    padding: 20,
  },
  aiHeroCardLocked: {
    borderWidth: 1,
    borderColor: "#fcd34d",
    opacity: 0.6,
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
    backgroundColor: "rgba(217, 119, 6, 0.12)",
  },
  aiHeroBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7c3aed",
  },
  aiHeroBadgeTextLocked: {
    color: "#b45309",
    fontWeight: "600",
  },
  lockedPremiumBadge: {
    backgroundColor: "rgba(217, 119, 6, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.2)",
  },
  lockedPremiumBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#b45309",
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
    color: "#78350f",
    fontWeight: "700",
  },
  aiHeroSubtitle: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 16,
  },
  aiHeroSubtitleLocked: {
    color: "#92400e",
    fontWeight: "500",
  },
  insightList: {
    marginTop: 8,
    gap: 0,
  },
  insightCardsWrapper: {
    position: 'relative',
    minHeight: 120,
  },
  insightScrollView: {
    maxHeight: Dimensions.get("window").height * 0.5, // Max 50% of screen height
  },
  insightScrollContent: {
    paddingBottom: 8,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fcd34d",
    padding: 20,
    backgroundColor: "#fffef9",
    gap: 12,
    opacity: 0.6,
  },
  insightLockedBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(217, 119, 6, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.25)",
  },
  insightLockedBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#b45309",
  },
  insightLockedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#78350f",
  },
  insightLockedDescription: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: 22,
    fontWeight: "400",
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  unlockButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.2)",
  },
  lockOverlayContent: {
    alignItems: "center",
    gap: 16,
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(217, 119, 6, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(217, 119, 6, 0.4)",
  },
  lockOverlayText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#d97706",
  },
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
  suggestionsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 20,
    borderRadius: 16,
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
  testCard: {
    width: SCREEN_WIDTH * 0.6,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 8,
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
  testCardDisabled: {
    opacity: 0.6,
  },
  flashcardModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  flashcardModalContainer: {
    width: "100%",
    maxWidth: SCREEN_WIDTH - 40,
    position: "relative",
  },
  flashcardCloseButton: {
    position: "absolute",
    top: -40,
    right: 0,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  flashcardWrapper: {
    width: "100%",
    position: "relative",
  },
  flashcard: {
    width: "100%",
    minHeight: 400,
    maxHeight: Dimensions.get("window").height * 0.7,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 32,
  },
  flashcardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  flashcardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
    paddingBottom: 4,
  },
  flashcardFrontContent: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  flashcardKanjiCharacter: {
    fontSize: 72,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 86,
  },
  flashcardGrammarStructure: {
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 50,
  },
  flashcardGrammarLevel: {
    fontSize: 20,
    marginTop: 12,
    textAlign: "center",
  },
  flashcardVocabularyWord: {
    fontSize: 56,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 66,
  },
  flashcardVocabularyReading: {
    fontSize: 24,
    marginTop: 16,
    textAlign: "center",
  },
  flashcardHint: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
  },
  flashcardBackContent: {
    paddingVertical: 24,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  flashcardBackInner: {
    width: "100%",
    alignItems: "center",
  },
  flashcardBackBox: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  flashcardBackText: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 40,
  },
  flashcardExampleText: {
    fontSize: 18,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 26,
    fontStyle: "italic",
  },
  flashcardReadingContainer: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  flashcardReadingText: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
  },
  markAsReadButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#3b82f6",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  markAsReadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});