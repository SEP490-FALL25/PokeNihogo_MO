import { DailyLoginModal } from "@components/DailyLoginModal";
import HomeLayout, { HomeLayoutRef } from "@components/layouts/HomeLayout";
import MainNavigation from "@components/MainNavigation";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import WelcomeModal from "@components/ui/WelcomeModal";
import { useRecentExercises } from "@hooks/useUserHistory";
import { IRecentExerciseItem } from "@models/user-history/user-history.response";
import { ROUTES } from "@routes/routes";
import { useUserStore } from "@stores/user/user.config";
import { router } from "expo-router";
import { BookOpen, BookText, ChevronRight, Languages, Target } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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

/**
 * Exercise Card Component for Recent Exercises
 */
const ExerciseCard: React.FC<{
  exercise: IRecentExerciseItem;
  onPress: () => void;
}> = ({ exercise, onPress }) => {
  const getExerciseTypeInfo = (exerciseName: string) => {
    const name = exerciseName.toLowerCase();
    if (name.includes("vocabulary") || name.includes("vocab")) {
      return {
        icon: BookOpen,
        color: "#3b82f6", // Blue
        type: "Từ vựng",
      };
    } else if (name.includes("kanji")) {
      return {
        icon: Languages,
        color: "#ef4444", // Red
        type: "Kanji",
      };
    } else if (name.includes("grammar") || name.includes("gramma")) {
      return {
        icon: BookText,
        color: "#f59e0b", // Amber
        type: "Ngữ pháp",
      };
    } else {
      return {
        icon: BookOpen,
        color: "#8b5cf6", // Purple
        type: "Bài tập",
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
        return "Hoàn thành";
      case "FAILED":
        return "Chưa đạt";
      case "SKIPPED":
        return "Đã bỏ qua";
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
 * HomeScreen Component
 *
 * Personalized home screen with statistics, charts, recent activities, and suggestions.
 *
 * @returns JSX.Element
 */
export default function HomeScreen() {
  const { t } = useTranslation();

  // Modal state management
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showDailyLogin, setShowDailyLogin] = useState(false);
  const homeLayoutRef = useRef<HomeLayoutRef>(null);

  // Global state from user store
  const { isFirstTimeLogin, starterId, email } = useUserStore();

  // Fetch user progress overview (for future use)
  // const { data: userProgressOverview } = useUserProgress();

  // Fetch recent exercises
  const { data: recentExercisesData } = useRecentExercises({
    currentPage: 1,
    pageSize: 10,
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

  /**
   * Handle welcome modal close
   */
  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
  };

  /**
   * Handle daily check-in action
   */
  const handleDailyCheckin = () => {
    console.log("User checked in daily!");
  };

  // Get recent exercises from API response
  const recentExercises = useMemo(() => {
    return recentExercisesData?.data?.results || [];
  }, [recentExercisesData]);

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
              username: email.split("@")[0] || "Trainer",
            })}
          </ThemedText>
          <ThemedText style={styles.welcomeSubtitle}>
            {t("home.ready_to_continue")}
          </ThemedText>
        </View>

        {/* Recent Exercises */}
        {recentExercises.length > 0 && (
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
          </View>
        )}

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
        username={email.split("@")[0] || "Trainer"}
        pokemonName={selectedStarter.name}
      />

      {/* Daily Login Modal */}
      <DailyLoginModal
        visible={showDailyLogin}
        onClose={() => setShowDailyLogin(false)}
        onCheckIn={handleDailyCheckin}
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
