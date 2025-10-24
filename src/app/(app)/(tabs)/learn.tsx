import HomeLayout from "@components/layouts/HomeLayout";
import LessonCategory from "@components/lesson/LessonCategory";
import { ThemedText } from "@components/ThemedText";
import { Badge } from "@components/ui/Badge";
import ErrorState from "@components/ui/ErrorState";
import { IconSymbol } from "@components/ui/IconSymbol";
import { Skeleton } from "@components/ui/Skeleton";
import { useLessonCategories, useUserProgress } from "@hooks/useLessons";
import { LessonProgress } from "@models/lesson/lesson.common";
import { ROUTES } from "@routes/routes";
import { useUserStore } from "@stores/user/user.config";
import {
  getJLPTLevelColor,
  getSkillCategoryColor,
  getSkillCategoryIcon,
} from "@utils/lesson.utils";
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

// Optimized animated wrapper for LessonCategory
const AnimatedLessonCategory = React.memo(
  ({
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
            duration: 300,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
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
  }
);

AnimatedLessonCategory.displayName = "AnimatedLessonCategory";

const CategoriesScreen = () => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const { level: userLevel } = useUserStore();

  const { data: progressData, isLoading: progressLoading } = useUserProgress();
  const {
    data: lessonCategoriesData,
    isLoading: lessonCategoriesLoading,
    error: lessonCategoriesError,
  } = useLessonCategories();

  // Optimized animation effect when data loads
  useEffect(() => {
    const isDataReady = !progressLoading && !lessonCategoriesLoading;

    if (isDataReady) {
      setIsLoaded(true);

      // Simplified animation sequence
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [
    progressLoading,
    lessonCategoriesLoading,
    fadeAnim,
    slideAnim,
    progressAnim,
  ]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
    } finally {
      setRefreshing(false);
    }
  }, []);

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
    const routeMap: Record<string, any> = {
      reading: ROUTES.TABS.READING,
      speaking: ROUTES.TABS.SPEAKING,
      listening: ROUTES.TABS.LISTENING,
    };

    const route = routeMap[category.route];
    if (route) {
      router.push(route as any);
    }
  }, []);

  // Memoized level categories - filter by "jlpt-" prefix and sort N5 to N1
  const levelCategories = useMemo(
    () =>
      lessonCategoriesData?.data.results
        .filter((category: any) => {
          const slug = category.slug.toLowerCase();
          return slug.startsWith("jlpt-");
        })
        .sort((a: any, b: any) => {
          // Sort JLPT levels from N5 to N1 (ascending order)
          const levelOrder = [
            "jlpt-n5",
            "jlpt-n4",
            "jlpt-n3",
            "jlpt-n2",
            "jlpt-n1",
          ];
          const aIndex = levelOrder.indexOf(a.slug.toLowerCase());
          const bIndex = levelOrder.indexOf(b.slug.toLowerCase());
          return aIndex - bIndex;
        })
        .map((category: any) => ({
          id: category.id.toString(),
          name: category.name,
          description: category.name,
          color: getJLPTLevelColor(category.slug),
          level: category.slug.toUpperCase(),
          icon: "1.circle.fill",
          lessons: [],
        })) || [],
    [lessonCategoriesData?.data.results]
  );

  // Memoized skill categories - non-JLPT categories from API
  const skillCategories = useMemo(
    () =>
      lessonCategoriesData?.data.results
        .filter((category: any) => {
          const slug = category.slug.toLowerCase();
          return !slug.startsWith("jlpt-");
        })
        .map((category: any) => ({
          id: category.id.toString(),
          name: category.name,
          description: category.name,
          color: getSkillCategoryColor(category.slug),
          icon: getSkillCategoryIcon(category.slug),
          route: category.slug,
        })) || [],
    [lessonCategoriesData?.data.results]
  );

  if (progressLoading || lessonCategoriesLoading) {
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

  if (lessonCategoriesError) {
    return (
      <HomeLayout>
        <ThemedText type="title" style={styles.title}>
          📚 {t("lessons.title")}
        </ThemedText>
        <ErrorState
          title={t("lessons.error_loading_lessons")}
          description={t("lessons.error_loading_lessons_description")}
          error={lessonCategoriesError?.message || "Unknown error"}
          onRetry={() => {
            // TODO: Implement retry
          }}
          retryText={t("common.retry")}
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
                  {lessonCategoriesData?.data.results
                    .filter((category: any) =>
                      category.slug.startsWith("jlpt-")
                    )
                    .reduce(
                      (acc: number, category: any) =>
                        acc + category.completedLessons,
                      0
                    ) || 0}
                </ThemedText>
                <ThemedText style={styles.progressStatLabel}>
                  {t("lessons.lessons_completed")}
                </ThemedText>
              </View>
              <View style={styles.progressStatItem}>
                <ThemedText style={styles.progressStatNumber}>
                  {lessonCategoriesData?.data.results.filter((category: any) =>
                    category.slug.startsWith("jlpt-")
                  ).length || 0}
                </ThemedText>
                <ThemedText style={styles.progressStatLabel}>
                  {t("lessons.overall_progress")}
                </ThemedText>
              </View>
              <View style={styles.progressStatItem}>
                <ThemedText style={styles.progressStatNumber}>
                  {userLevel||"N5"}
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
            <TouchableOpacity onPress={() => router.push(ROUTES.TABS.SPEAKING)}>
              <ThemedText type="subtitle" style={styles.categoriesTitle}>
                {t("lessons.view_all_categories")}
              </ThemedText>
            </TouchableOpacity>
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
});

export default CategoriesScreen;
