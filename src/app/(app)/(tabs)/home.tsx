import { DailyLoginModal } from "@components/DailyLoginModal";
import HomeLayout, { HomeLayoutRef } from "@components/layouts/HomeLayout";
import MainNavigation from "@components/MainNavigation";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import WelcomeModal from "@components/ui/WelcomeModal";
import { useUserProgressInfinite } from "@hooks/useLessons";
import { useUserTests } from "@hooks/useUserTest";
import { IUserProgress } from "@models/user-progress/user-progress.common";
import { ROUTES } from "@routes/routes";
import { useUserStore } from "@stores/user/user.config";
import { router } from "expo-router";
import { Award, BookOpen, Calendar, ChevronRight, Clock, FileText, Flame, Headphones, Mic, Target, TrendingUp } from "lucide-react-native";
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
import * as Progress from "react-native-progress";
import starters from "../../../../mock-data/starters.json";
import { Starter } from "../../../types/starter.types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * User Test Item Type
 */
type UserTestItem = {
  id: number;
  limit: number;
  status: string;
  test: {
    id: number;
    name: string;
    description: string;
    price: number;
    levelN: number;
    testType: string;
    status: string;
    limit: number;
  };
};

/**
 * Weekly Progress Chart Component
 */
const WeeklyProgressChart: React.FC<{ data: number[] }> = ({ data }) => {
  const maxValue = Math.max(...data, 1);
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {data.map((value, index) => {
          const height = (value / maxValue) * 100;
          return (
            <View key={index} style={styles.chartBarWrapper}>
              <View style={styles.chartBarContainer}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: `${Math.max(height, 10)}%`,
                      backgroundColor:
                        value > 0 ? "#3b82f6" : "#e5e7eb",
                    },
                  ]}
                />
              </View>
              <ThemedText style={styles.chartLabel}>
                {days[index]}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

/**
 * Stat Card Component
 */
const StatCard: React.FC<{
  icon: React.ComponentType<{ size: number; color: string }>;
  value: string | number;
  label: string;
  color: string;
}> = ({ icon: Icon, value, label, color }) => (
  <ThemedView style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
      <Icon size={24} color={color} />
    </View>
    <ThemedText style={styles.statValue}>{value}</ThemedText>
    <ThemedText style={styles.statLabel}>{label}</ThemedText>
  </ThemedView>
);

/**
 * Recent Activity Card Component
 */
const RecentActivityCard: React.FC<{
  activity: IUserProgress;
  onPress: () => void;
}> = ({ activity, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "#10b981";
      case "IN_PROGRESS":
        return "#3b82f6";
      case "TESTING_LAST":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Hoàn thành";
      case "IN_PROGRESS":
        return "Đang học";
      case "TESTING_LAST":
        return "Đang kiểm tra";
      default:
        return "Chưa bắt đầu";
    }
  };

  return (
    <TouchableOpacity
      style={styles.recentCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.recentCardContent}>
        <View style={styles.recentCardHeader}>
          <View style={styles.recentCardIcon}>
            <BookOpen size={20} color={getStatusColor(activity.status)} />
          </View>
          <View style={styles.recentCardInfo}>
            <ThemedText style={styles.recentCardTitle} numberOfLines={1}>
              {activity.lesson.titleJp}
            </ThemedText>
            <ThemedText style={styles.recentCardSubtitle}>
              N{activity.lesson.levelJlpt}
            </ThemedText>
          </View>
        </View>
        <View style={styles.recentCardFooter}>
          <View
            style={[
              styles.recentCardStatus,
              { backgroundColor: `${getStatusColor(activity.status)}15` },
            ]}
          >
            <ThemedText
              style={[
                styles.recentCardStatusText,
                { color: getStatusColor(activity.status) },
              ]}
            >
              {getStatusText(activity.status)}
            </ThemedText>
          </View>
          <Progress.Bar
            progress={activity.progressPercentage / 100}
            width={60}
            height={4}
            color={getStatusColor(activity.status)}
            unfilledColor="#e5e7eb"
            borderWidth={0}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Test Card Component for Exercises
 */
const TestCard: React.FC<{
  test: UserTestItem;
  onPress: () => void;
}> = ({ test, onPress }) => {
  const getTestTypeColor = (testType: string) => {
    switch (testType) {
      case "LISTENING_TEST":
        return "#8b5cf6";
      case "READING_TEST":
        return "#f59e0b";
      case "SPEAKING_TEST":
        return "#ef4444";
      case "WRITING_TEST":
        return "#10b981";
      default:
        return "#3b82f6";
    }
  };

  const getTestTypeIcon = (testType: string) => {
    switch (testType) {
      case "LISTENING_TEST":
        return Headphones;
      case "READING_TEST":
        return FileText;
      case "SPEAKING_TEST":
        return Mic;
      default:
        return Target;
    }
  };

  const getTestTypeLabel = (testType: string) => {
    switch (testType) {
      case "LISTENING_TEST":
        return "Nghe";
      case "READING_TEST":
        return "Đọc";
      case "SPEAKING_TEST":
        return "Nói";
      case "WRITING_TEST":
        return "Viết";
      default:
        return "Bài tập";
    }
  };

  const Icon = getTestTypeIcon(test.test.testType);
  const color = getTestTypeColor(test.test.testType);
  const progress = test.limit / test.test.limit;

  return (
    <TouchableOpacity
      style={styles.testCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.testCardContent}>
        <View style={styles.testCardHeader}>
          <View style={[styles.testCardIcon, { backgroundColor: `${color}15` }]}>
            <Icon size={20} color={color} />
          </View>
          <View style={styles.testCardInfo}>
            <ThemedText style={styles.testCardTitle} numberOfLines={1}>
              {test.test.name}
            </ThemedText>
            <ThemedText style={styles.testCardSubtitle}>
              {getTestTypeLabel(test.test.testType)} • N{test.test.levelN}
            </ThemedText>
          </View>
        </View>
        <View style={styles.testCardFooter}>
          <View
            style={[
              styles.testCardStatus,
              { backgroundColor: `${color}15` },
            ]}
          >
            <ThemedText
              style={[
                styles.testCardStatusText,
                { color: color },
              ]}
            >
              {getTestTypeLabel(test.test.testType)}
            </ThemedText>
          </View>
          <Progress.Bar
            progress={Math.min(progress, 1)}
            width={60}
            height={4}
            color={color}
            unfilledColor="#e5e7eb"
            borderWidth={0}
          />
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

  // Fetch user progress list with pagination
  const { data: userProgressData } = useUserProgressInfinite({
    pageSize: 50,
    sortBy: "lastAccessedAt",
    sortOrder: "desc",
  });

  // Fetch recent tests/exercises
  const { data: userTestsData } = useUserTests({
    currentPage: 1,
    pageSize: 10,
    type: "ALL",
  });

  // Get all activities from paginated data
  const allActivities = useMemo(() => {
    if (!userProgressData?.pages) return [];
    return userProgressData.pages.flatMap(
      (page) => page?.data?.results || []
    );
  }, [userProgressData]);

  // Get recent activities from user progress
  const recentActivities = useMemo(() => {
    return allActivities
      .filter((item: IUserProgress) => item.status !== "NOT_STARTED")
      .sort(
        (a: IUserProgress, b: IUserProgress) =>
          new Date(b.lastAccessedAt).getTime() -
          new Date(a.lastAccessedAt).getTime()
      )
      .slice(0, 10);
  }, [allActivities]);

  // Calculate statistics
  const stats = useMemo(() => {
    const activities = allActivities as IUserProgress[];
    const completed = activities.filter(
      (item: IUserProgress) => item.status === "COMPLETED"
    ).length;
    const inProgress = activities.filter(
      (item: IUserProgress) => item.status === "IN_PROGRESS"
    ).length;
    const totalProgress =
      activities.length > 0
        ? activities.reduce(
            (sum: number, item: IUserProgress) =>
              sum + item.progressPercentage,
            0
          ) / activities.length
        : 0;

    // Mock weekly data (in real app, this would come from API)
    const weeklyData = [45, 60, 30, 75, 50, 80, 65];

    return {
      completed,
      inProgress,
      totalProgress: Math.round(totalProgress),
      weeklyData,
      streak: 7, // Mock data - should come from user profile
    };
  }, [allActivities]);

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

  // Get recent tests from API response
  const recentTests = useMemo(() => {
    const results = (userTestsData as any)?.data?.data?.results || [];
    return results.slice(0, 10) as UserTestItem[];
  }, [userTestsData]);

  /**
   * Handle activity card press
   */
  const handleActivityPress = (activity: IUserProgress) => {
    router.push(`${ROUTES.TABS.LEARN}?lessonId=${activity.lessonId}`);
  };

  /**
   * Handle test card press
   */
  const handleTestPress = (test: UserTestItem) => {
    const testType = test.test.testType;
    router.push({
      pathname: "/test",
      params: { testId: String(test.test.id), testType },
    });
  };

  /**
   * Handle suggestion press
   */
  const handleSuggestionPress = (type: string) => {
    switch (type) {
      case "continue":
        if (recentActivities.length > 0) {
          handleActivityPress(recentActivities[0]);
        }
        break;
      case "learn":
        router.push(ROUTES.TABS.LEARN);
        break;
      case "practice":
        router.push(ROUTES.TABS.LISTENING);
        break;
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

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            icon={Award}
            value={stats.completed}
            label={t("home.stats_completed")}
            color="#10b981"
          />
          <StatCard
            icon={BookOpen}
            value={stats.inProgress}
            label={t("home.stats_in_progress")}
            color="#3b82f6"
          />
          <StatCard
            icon={Flame}
            value={stats.streak}
            label={t("home.stats_streak")}
            color="#f59e0b"
          />
          <StatCard
            icon={TrendingUp}
            value={`${stats.totalProgress}%`}
            label={t("home.stats_progress")}
            color="#8b5cf6"
          />
        </View>

        {/* Weekly Progress Chart */}
        <ThemedView style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t("home.weekly_progress")}
            </ThemedText>
            <Calendar size={18} color="#6b7280" />
          </View>
          <WeeklyProgressChart data={stats.weeklyData} />
        </ThemedView>

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {t("home.recent_activities")}
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
              {recentActivities.map((activity: IUserProgress) => (
                <RecentActivityCard
                  key={activity.id}
                  activity={activity}
                  onPress={() => handleActivityPress(activity)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Tests/Exercises */}
        {recentTests.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {t("home.recent_exercises")}
              </ThemedText>
              <TouchableOpacity
                onPress={() => router.push(ROUTES.TABS.LISTENING)}
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
              {recentTests.map((test: UserTestItem) => (
                <TestCard
                  key={test.id}
                  test={test}
                  onPress={() => handleTestPress(test)}
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
            {recentActivities.length > 0 && (
              <SuggestionCard
                title={t("home.suggestion_continue")}
                description={t("home.suggestion_continue_desc")}
                icon={Clock}
                onPress={() => handleSuggestionPress("continue")}
              />
            )}
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
    backgroundColor: "#f3f4f6",
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
    backgroundColor: "#eff6ff",
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
  testCardContent: {
    padding: 16,
  },
  testCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  testCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  testCardInfo: {
    flex: 1,
  },
  testCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  testCardSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  testCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  testCardStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  testCardStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
