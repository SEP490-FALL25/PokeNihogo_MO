import HomeLayout from "@components/layouts/HomeLayout";
import LessonMap from "@components/lesson/LessonMap";
import { ThemedText } from "@components/ThemedText";
import { Badge } from "@components/ui/Badge";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
} from "@components/ui/BottomSheet";
import ErrorState from "@components/ui/ErrorState";
import { Skeleton } from "@components/ui/Skeleton";
import {
  useInfiniteUserLessons,
  useLessonCategories,
  useUserProgress,
} from "@hooks/useLessons";
import { LessonProgress } from "@models/lesson/lesson.common";
import { useIsFocused } from "@react-navigation/native";
import { ROUTES } from "@routes/routes";
import { useQueryClient } from "@tanstack/react-query";
import {
  getJLPTLevelColor,
  getSkillCategoryColor,
  getSkillCategoryIcon,
} from "@utils/lesson.utils";
import { router } from "expo-router";
import {
  BookOpen,
  ChevronRight,
  FileText,
  Headphones,
  Languages,
  MessageSquare,
  Mic,
  Pencil,
  Type,
} from "lucide-react-native";
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

// Constants
const DUO_IMAGES = [
  require("@assets/animations/hectordev4pokeball.json"),
  require("@assets/animations/Day 18 - Dreaming Snorlax.json"),
  require("@assets/animations/Animation - 1740640302159.json"),
  require("@assets/animations/Mystery Gift by Oscar Soronellas.json"),
];

const JLPT_LEVEL_ORDER = [
  "jlpt-n5",
  "jlpt-n4",
  "jlpt-n3",
  "jlpt-n2",
  "jlpt-n1",
] as const;

const SKILL_CATEGORY_ROUTE_MAP: Record<string, string> = {
  reading: ROUTES.TABS.READING,
  speaking: ROUTES.TABS.SPEAKING,
  listening: ROUTES.TABS.LISTENING,
};

const SKILL_ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  listening: Headphones,
  vocabulary: Type,
  grammar: FileText,
  reading: BookOpen,
  speaking: Mic,
  writing: Pencil,
  conversation: MessageSquare,
  kanji: Languages,
};

// Component để render LessonMap cho từng level JLPT
const JLPTLevelMap = React.memo<{
  categoryId: string;
  levelName: string;
  onLessonPress: (lesson: LessonProgress) => void;
}>(({ categoryId, levelName, onLessonPress }) => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteUserLessons({
    pageSize: 50,
    lessonCategoryId: parseInt(categoryId, 10),
  });

  // Lấy tất cả lessons từ tất cả pages
  const allLessons = useMemo(() => {
    return (data?.pages ?? []).flatMap((p: any) => p?.data?.results ?? []);
  }, [data]);

  // Load more khi cần
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  if (isError) {
    return (
      <View style={styles.levelMapContainer}>
        <ThemedText type="subtitle" style={styles.levelTitle}>
          {levelName}
        </ThemedText>
        <ErrorState
          title="Error loading lessons"
          description="Failed to load lessons for this level"
          error="Unknown error"
          onRetry={() => refetch()}
          retryText="Retry"
        />
      </View>
    );
  }

  if (isLoading && allLessons.length === 0) {
    return (
      <View style={styles.levelMapContainer}>
        <ThemedText type="subtitle" style={styles.levelTitle}>
          {levelName}
        </ThemedText>
        <Skeleton className="h-96 w-full rounded-lg" />
      </View>
    );
  }

  return (
    <View style={styles.levelMapContainer}>
      <ThemedText type="subtitle" style={styles.levelTitle}>
        {levelName}
      </ThemedText>
      {allLessons.length > 0 ? (
        <LessonMap
          duoImages={DUO_IMAGES}
          lessons={allLessons}
          onLessonPress={onLessonPress}
        />
      ) : (
        <View style={styles.emptyLevelContainer}>
          <ThemedText style={styles.emptyLevelText}>
            No lessons available for this level
          </ThemedText>
        </View>
      )}
    </View>
  );
});

JLPTLevelMap.displayName = "JLPTLevelMap";

// Memoized Skill Category Item Component
const SkillCategoryItem = React.memo<{
  category: any;
  isLoaded: boolean;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  onPress: (category: any) => void;
  renderIcon: (slug: string) => React.ReactNode;
}>(({ category, isLoaded, fadeAnim, slideAnim, onPress, renderIcon }) => {
  const animatedStyle = useMemo(
    () => ({
      opacity: isLoaded ? fadeAnim : 0,
      transform: [
        {
          translateY: isLoaded ? slideAnim : 30,
        },
      ],
    }),
    [isLoaded, fadeAnim, slideAnim]
  );

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.skillCategoryCard, { borderLeftColor: category.color }]}
        onPress={() => onPress(category)}
        activeOpacity={0.8}
      >
        <View style={styles.skillCategoryHeader}>
          <View
            style={[
              styles.skillCategoryIcon,
              { backgroundColor: category.color },
            ]}
          >
            {renderIcon(category.route)}
          </View>
          <View style={styles.skillCategoryInfo}>
            <ThemedText type="subtitle" style={styles.skillCategoryTitle}>
              {category.name}
            </ThemedText>
            <ThemedText style={styles.skillCategoryDescription}>
              {category.description}
            </ThemedText>
          </View>
          <View style={styles.skillCategoryArrow}>
            <ChevronRight size={20} color="#6b7280" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

SkillCategoryItem.displayName = "SkillCategoryItem";

const CategoriesScreen = () => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const isFocused = useIsFocused();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Close BottomSheet when screen loses focus (e.g., when navigating away)
  useEffect(() => {
    if (!isFocused && isBottomSheetOpen) {
      setIsBottomSheetOpen(false);
    }
  }, [isFocused, isBottomSheetOpen]);

  const queryClient = useQueryClient();

  const { isLoading: progressLoading, refetch: refetchProgress } = useUserProgress();
  const {
    data: lessonCategoriesData,
    isLoading: lessonCategoriesLoading,
    error: lessonCategoriesError,
    refetch: refetchCategories,
  } = useLessonCategories();

  // Optimized animation effect when data loads
  useEffect(() => {
    const isDataReady = !progressLoading && !lessonCategoriesLoading;

    if (isDataReady && !isLoaded) {
      setIsLoaded(true);

      // Simplified animation sequence
      // Note: fadeAnim and slideAnim are refs, stable across renders, so not in deps
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
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressLoading, lessonCategoriesLoading, isLoaded]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refetch all data queries including user lessons
      await Promise.all([
        refetchProgress(),
        refetchCategories(),
        // Refetch all user lessons infinite queries (all JLPT levels)
        queryClient.refetchQueries({ 
          queryKey: ["user-lessons-infinite"],
          exact: false, // Match all queries starting with this key (all categories/levels)
        }),
        // Refetch all user progress infinite queries
        queryClient.refetchQueries({ 
          queryKey: ["userProgressInfinite"],
          exact: false, // Match all queries starting with this key
        }),
        // Refetch all user progress queries
        queryClient.refetchQueries({ 
          queryKey: ["userProgress"],
          exact: false, // Match all queries starting with this key
        }),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchProgress, refetchCategories, queryClient]);

  // Auto refresh when component mounts
  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLessonPress = useCallback((lesson: LessonProgress) => {
    // Navigate to lesson detail or start lesson
    router.push({
      pathname: ROUTES.LESSON.DETAIL,
      params: { id: lesson.lessonId.toString() },
    });
  }, []);

  const handleSkillCategoryPress = useCallback((category: any) => {
    const route = SKILL_CATEGORY_ROUTE_MAP[category.route];
    if (route) {
      router.push(route as any);
    }
  }, []);

  const renderSkillIcon = useCallback((slug: string) => {
    const IconComponent = SKILL_ICON_MAP[slug] || BookOpen;
    return <IconComponent size={24} color="#ffffff" />;
  }, []);
  // Memoized level categories - filter by "jlpt-" prefix and sort N5 to N1
  const levelCategories = useMemo(() => {
    if (!lessonCategoriesData?.data.results) return [];
    
    return lessonCategoriesData.data.results
      .filter((category: any) => {
        const slug = category.slug.toLowerCase();
        return slug.startsWith("jlpt-");
      })
      .sort((a: any, b: any) => {
        const aIndex = JLPT_LEVEL_ORDER.indexOf(a.slug.toLowerCase() as any);
        const bIndex = JLPT_LEVEL_ORDER.indexOf(b.slug.toLowerCase() as any);
        // Handle items not in order array (shouldn't happen, but safe)
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
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
      }));
  }, [lessonCategoriesData?.data.results]);

  // Lấy 3 level đầu tiên (N5, N4, N3) để hiển thị LessonMap
  const jlptLevelsForMap = useMemo(() => {
    return levelCategories.slice(0, 3);
  }, [levelCategories]);
  // Memoized skill categories - non-JLPT categories from API
  const skillCategories = useMemo(() => {
    if (!lessonCategoriesData?.data.results) return [];
    
    return lessonCategoriesData.data.results
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
      }));
  }, [lessonCategoriesData?.data.results]);

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
          error={lessonCategoriesError?.message || t("common.error")}
          onRetry={() => {
            setRefreshing(true);
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
      <View style={styles.contentContainer}>
        {/* Lesson Maps for JLPT Levels (N5, N4, N3) */}
        {jlptLevelsForMap.map((level, index) => (
          <React.Fragment key={level.id}>
            {index > 0 && (
              <View style={styles.separatorContainer}>
                <View style={styles.separatorLine} />
                <ThemedText style={styles.separatorText}>{"-".repeat(30)}</ThemedText>
                <View style={styles.separatorLine} />
              </View>
            )}
            <JLPTLevelMap
              categoryId={level.id}
              levelName={level.name}
              onLessonPress={handleLessonPress}
            />
          </React.Fragment>
        ))}

        {/* Skill Categories - Trigger Button */}
        <View style={styles.categoriesSection}>
          <BottomSheet
            open={isBottomSheetOpen}
            onOpenChange={setIsBottomSheetOpen}
            closeOnBlur={true}
          >
            <BottomSheetTrigger>
              <View style={styles.categoriesHeader}>
                <ThemedText type="subtitle" style={styles.categoriesTitle}>
                  🚀 {t("lessons.skill_categories.title")}
                </ThemedText>
                <Badge variant="outline">
                  {skillCategories.length} {t("lessons.categories_count")}
                </Badge>
              </View>
            </BottomSheetTrigger>

            <BottomSheetContent snapPoints={[0.7]}>
              <BottomSheetHeader>
                <BottomSheetTitle>
                  🚀 {t("lessons.skill_categories.title")}
                </BottomSheetTitle>
              </BottomSheetHeader>

              <View style={styles.skillCategoriesContainer}>
                {skillCategories.map((category) => (
                  <SkillCategoryItem
                    key={category.id}
                    category={category}
                    isLoaded={isLoaded}
                    fadeAnim={fadeAnim}
                    slideAnim={slideAnim}
                    onPress={handleSkillCategoryPress}
                    renderIcon={renderSkillIcon}
                  />
                ))}
                <TouchableOpacity
                  onPress={() => router.push(ROUTES.TABS.SPEAKING)}
                >
                  <ThemedText type="subtitle" style={styles.categoriesTitle}>
                    {t("lessons.view_all_categories")}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push(ROUTES.APP.AI_CONVERSATION)}
                >
                  <ThemedText type="subtitle" style={styles.categoriesTitle}>
                    speak with ai
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push(ROUTES.APP.DEMO)}>
                  <ThemedText type="subtitle" style={styles.categoriesTitle}>
                    test ui
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push(ROUTES.ME.EXERCISE_HISTORY)}>
                  <ThemedText type="subtitle" style={styles.categoriesTitle}>
                    exercise history
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </BottomSheetContent>
          </BottomSheet>
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
  contentContainer: {
    flex: 1,
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
  // LessonMap styles
  levelMapContainer: {
    marginBottom: 24,
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  emptyLevelContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyLevelText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
    paddingHorizontal: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  separatorText: {
    fontSize: 14,
    color: "#9ca3af",
    marginHorizontal: 12,
    fontFamily: "monospace",
  },
});

export default CategoriesScreen;
