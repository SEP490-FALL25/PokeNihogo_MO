import HomeLayout from "@components/layouts/HomeLayout";
import LessonCategory from "@components/lesson/LessonCategory";
import { ThemedText } from "@components/ThemedText";
import { Badge } from "@components/ui/Badge";
import ErrorState from "@components/ui/ErrorState";
import { IconSymbol } from "@components/ui/IconSymbol";
import { Skeleton } from "@components/ui/Skeleton";
import { useLessons, useUserProgress } from "@hooks/useLessons";
import { LessonProgress } from "@models/lesson/lesson.common";
import { ROUTES } from "@routes/routes";
import { useUserStore } from "@stores/user/user.config";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// Animated wrapper for LessonCategory
const AnimatedLessonCategory = ({
  category,
  onLessonPress,
  onCategoryPress,
  delay,
  isLoaded,
}: {
  category: any;
  onLessonPress: (lesson: LessonProgress) => void;
  onCategoryPress?: (category: any) => void;
  delay: number;
  isLoaded: boolean;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (isLoaded) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          delay: delay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoaded, delay, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <LessonCategory
        category={category}
        onLessonPress={onLessonPress}
        onCategoryPress={onCategoryPress}
      />
    </Animated.View>
  );
};

const CategoriesScreen = () => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const { level: userLevel } = useUserStore();
  const {
    data: lessonsData,
    isLoading: lessonsLoading,
    error: lessonsError,
    refetch,
  } = useLessons(userLevel || "N5");
  const { data: progressData, isLoading: progressLoading } = useUserProgress();

  // Animation effect when data loads
  useEffect(() => {
    if (!lessonsLoading && !progressLoading && !lessonsError) {
      setIsLoaded(true);

      // Staggered animation for different elements
      Animated.sequence([
        // Progress card animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Progress bar animation
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [
    lessonsLoading,
    progressLoading,
    lessonsError,
    fadeAnim,
    slideAnim,
    progressAnim,
  ]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleLessonPress = useCallback((lesson: LessonProgress) => {
    // Navigate to lesson detail or start lesson
    router.push({
      pathname: ROUTES.LESSON.DETAIL,
      params: { id: lesson.lessonId.toString() },
    });
  }, []);

  const handleCategoryPress = useCallback((category: any) => {
    // Navigate to dedicated lessons screen with category ID
    router.push({
      pathname: ROUTES.LESSON.LIST_WITH_ID,
      params: {
        id: category.id,
        title: category.name,
      },
    });
  }, []);

  const handleSkillCategoryPress = useCallback((category: any) => {
    // Handle skill categories (Reading, Speaking, Listening)
    if (category.route === "reading") {
      router.push(ROUTES.TABS.READING);
    } else if (category.route === "speaking") {
      router.push(ROUTES.TABS.SPEAKING);
    } else if (category.route === "listening") {
      router.push(ROUTES.TABS.LISTENING);
    }
  }, []);

  // Memoized level categories (N5, N4, N3)
  const levelCategories = useMemo(
    () => [
      {
        id: "1",
        name: t("lessons.level_categories.n5_basic"),
        description: t("lessons.level_names.N5"),
        color: "#10b981",
        level: "N5" as const,
        icon: "1.circle.fill",
        lessons: [],
      },
      {
        id: "2",
        name: t("lessons.level_categories.n4_intermediate"),
        description: t("lessons.level_names.N4"),
        color: "#3b82f6",
        level: "N4" as const,
        icon: "2.circle.fill",
        lessons: [],
      },
      {
        id: "3",
        name: t("lessons.level_categories.n3_advanced"),
        description: t("lessons.level_names.N3"),
        color: "#8b5cf6",
        level: "N3" as const,
        icon: "3.circle.fill",
        lessons: [],
      },
    ],
    [t]
  );

  // Memoized skill categories (Reading, Speaking, Listening)
  const skillCategories = useMemo(
    () => [
      {
        id: "4",
        name: `📖 ${t("lessons.skill_categories.reading")} Practice`,
        description: t("lessons.lesson_types.reading"),
        color: "#f59e0b",
        icon: "book.fill",
        route: "reading",
      },
      {
        id: "5",
        name: `🎤 ${t("lessons.skill_categories.speaking")} Practice`,
        description: t("lessons.lesson_types.speaking"),
        color: "#ef4444",
        icon: "mic.fill",
        route: "speaking",
      },
      {
        id: "6",
        name: `🎧 ${t("lessons.skill_categories.listening")} Practice`,
        description: t("lessons.lesson_types.listening"),
        color: "#8b5cf6",
        icon: "headphones",
        route: "listening",
      },
    ],
    [t]
  );

  if (lessonsLoading || progressLoading) {
    return (
      <HomeLayout>
        <ThemedText type="title" style={styles.title}>
          📚 {t("lessons.title")}
        </ThemedText>
        <Skeleton className="h-32 w-full mb-4 rounded-lg" />
        <Skeleton className="h-24 w-full mb-4 rounded-lg" />
        <Skeleton className="h-24 w-full mb-4 rounded-lg" />
        <Skeleton className="h-24 w-full mb-4 rounded-lg" />
      </HomeLayout>
    );
  }

  if (lessonsError) {
    return (
      <HomeLayout>
        <ThemedText type="title" style={styles.title}>
          📚 {t("lessons.title")}
        </ThemedText>
        <ErrorState
          title="Lỗi tải dữ liệu"
          description="Không thể tải danh sách bài học. Vui lòng kiểm tra kết nối mạng và thử lại."
          error={lessonsError?.message || "Unknown error"}
          onRetry={() => refetch()}
          retryText="Thử lại"
        />
      </HomeLayout>
    );
  }

  return (
    <HomeLayout
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <ThemedText type="title" style={styles.title}>
        📚 {t("lessons.title")}
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        {t("lessons.progress_title")}
      </ThemedText>

      <View style={styles.contentContainer}>
        {/* Progress Header */}
        {progressData && isLoaded && (
          <Animated.View
            style={[
              styles.progressCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <ThemedText type="subtitle" style={styles.progressTitle}>
              📊 {t("lessons.progress_title")}
            </ThemedText>
            <View style={styles.progressStats}>
              <View style={styles.progressStatItem}>
                <ThemedText style={styles.progressStatNumber}>
                  {lessonsData?.data.completedLessons || 0}
                </ThemedText>
                <ThemedText style={styles.progressStatLabel}>
                  {t("lessons.lessons_completed")}
                </ThemedText>
              </View>
              <View style={styles.progressStatItem}>
                <ThemedText style={styles.progressStatNumber}>
                  {lessonsData?.data.totalLessons || 0}
                </ThemedText>
                <ThemedText style={styles.progressStatLabel}>
                  {t("lessons.overall_progress")}
                </ThemedText>
              </View>
              <View style={styles.progressStatItem}>
                <ThemedText style={styles.progressStatNumber}>
                  {userLevel}
                </ThemedText>
                <ThemedText style={styles.progressStatLabel}>
                  {t("lessons.select_level")}
                </ThemedText>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Level Categories (N5, N4, N3) */}
        <View style={styles.categoriesSection}>
          <View style={styles.categoriesHeader}>
            <ThemedText type="subtitle" style={styles.categoriesTitle}>
              🎯 {t("lessons.level_categories.title")}
            </ThemedText>
            <Badge variant="outline">
              {levelCategories.length} {t("lessons.categories_count")}
            </Badge>
          </View>

          <View style={styles.categoriesContainer}>
            {levelCategories.map((category, index) => (
              <AnimatedLessonCategory
                key={category.id}
                category={category}
                onLessonPress={handleLessonPress}
                onCategoryPress={handleCategoryPress}
                delay={index * 100}
                isLoaded={isLoaded}
              />
            ))}
          </View>
        </View>

        {/* Skill Categories (Reading, Speaking, Listening) */}
        <View style={styles.categoriesSection}>
          <View style={styles.categoriesHeader}>
            <ThemedText type="subtitle" style={styles.categoriesTitle}>
              🚀 {t("lessons.skill_categories.title")}
            </ThemedText>
            <Badge variant="outline">
              {skillCategories.length} {t("lessons.categories_count")}
            </Badge>
          </View>

          <View style={styles.skillCategoriesContainer}>
            {skillCategories.map((category, index) => (
              <Animated.View
                key={category.id}
                style={{
                  opacity: isLoaded ? fadeAnim : 0,
                  transform: [
                    {
                      translateY: isLoaded ? slideAnim : 30,
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.skillCategoryCard,
                    { borderLeftColor: category.color },
                  ]}
                  onPress={() => handleSkillCategoryPress(category)}
                  activeOpacity={0.8}
                >
                  <View style={styles.skillCategoryHeader}>
                    <View
                      style={[
                        styles.skillCategoryIcon,
                        { backgroundColor: category.color },
                      ]}
                    >
                      <IconSymbol
                        name={category.icon as any}
                        size={24}
                        color="#ffffff"
                      />
                    </View>
                    <View style={styles.skillCategoryInfo}>
                      <ThemedText
                        type="subtitle"
                        style={styles.skillCategoryTitle}
                      >
                        {category.name}
                      </ThemedText>
                      <ThemedText style={styles.skillCategoryDescription}>
                        {category.description}
                      </ThemedText>
                    </View>
                    <View style={styles.skillCategoryArrow}>
                      <IconSymbol
                        name="chevron.right"
                        size={20}
                        color="#6b7280"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </View>
    </HomeLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
  },
  progressCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  progressStatItem: {
    alignItems: "center",
  },
  progressStatNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  levelInfoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  levelInfoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  levelInfoDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  categoriesContainer: {
    gap: 16,
  },
  bottomSpacing: {
    height: 80,
  },
  skillCategoriesContainer: {
    gap: 16,
  },
  skillCategoryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  skillCategoryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  skillCategoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  skillCategoryInfo: {
    flex: 1,
  },
  skillCategoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  skillCategoryDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  skillCategoryArrow: {
    marginLeft: 8,
  },
  debugInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#3730a3",
    marginBottom: 4,
  },
  debugError: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 4,
  },
});

export default CategoriesScreen;
