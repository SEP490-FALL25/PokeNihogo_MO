import HomeLayout from "@components/layouts/HomeLayout";
import LessonCategory from "@components/lesson/LessonCategory";
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
import { ROUTES } from "@routes/routes";
import { useUserStore } from "@stores/user/user.config";
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

// Component để render LessonMap cho từng level JLPT
const JLPTLevelMap: React.FC<{
  categoryId: string;
  levelName: string;
  onLessonPress: (lesson: LessonProgress) => void;
}> = ({ categoryId, levelName, onLessonPress }) => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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
          onRetry={() => {}}
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

  const DUO_IMAGE = [
    require("@assets/animations/hectordev4pokeball.json"),
    require("@assets/animations/Day 18 - Dreaming Snorlax.json"),
    require("@assets/animations/Animation - 1740640302159.json"),
    require("@assets/animations/Mystery Gift by Oscar Soronellas.json"),
  ];

  return (
    <View style={styles.levelMapContainer}>
      <ThemedText type="subtitle" style={styles.levelTitle}>
        {levelName}
      </ThemedText>
      {allLessons.length > 0 ? (
        <LessonMap
          duoImages={DUO_IMAGE}
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

  const renderSkillIcon = useCallback((slug: string) => {
    switch (slug) {
      case "listening":
        return <Headphones size={24} color="#ffffff" />;
      case "vocabulary":
        return <Type size={24} color="#ffffff" />;
      case "grammar":
        return <FileText size={24} color="#ffffff" />;
      case "reading":
        return <BookOpen size={24} color="#ffffff" />;
      case "speaking":
        return <Mic size={24} color="#ffffff" />;
      case "writing":
        return <Pencil size={24} color="#ffffff" />;
      case "conversation":
        return <MessageSquare size={24} color="#ffffff" />;
      case "kanji":
        return <Languages size={24} color="#ffffff" />;
      default:
        return <BookOpen size={24} color="#ffffff" />;
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

  // Lấy 3 level đầu tiên (N5, N4, N3) để hiển thị LessonMap
  const jlptLevelsForMap = useMemo(() => {
    return levelCategories.slice(0, 3);
  }, [levelCategories]);
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
                <ThemedText style={styles.separatorText}>
                  {"-".repeat(30)}
                </ThemedText>
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

<TouchableOpacity
                  onPress={() => router.push("/(app)/bottom")}
                >
                  <ThemedText type="subtitle" style={styles.categoriesTitle}>
                    bottom
                  </ThemedText>
                </TouchableOpacity>

        {/* Skill Categories - Trigger Button */}
        <View style={styles.categoriesSection}>
          <BottomSheet>
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
                          {renderSkillIcon(category.route)}
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
                          <ChevronRight size={20} color="#6b7280" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
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
