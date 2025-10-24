import HomeLayout from "@components/layouts/HomeLayout";
import LessonCard from "@components/lesson/LessonCard";
import { ThemedText } from "@components/ThemedText";
import { Badge } from "@components/ui/Badge";
import EmptyState from "@components/ui/EmptyState";
import ErrorState from "@components/ui/ErrorState";
import { IconSymbol } from "@components/ui/IconSymbol";
import { Skeleton } from "@components/ui/Skeleton";
import { useUserProgressWithParams } from "@hooks/useLessons";
import { LessonProgress } from "@models/lesson/lesson.common";
import { ROUTES } from "@routes/routes";
import { router, useLocalSearchParams } from "expo-router";
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

// Optimized animated wrapper for LessonCard
const AnimatedLessonCard = React.memo(({
  lesson,
  onPress,
}: {
  lesson: LessonProgress;
  onPress: (lesson: LessonProgress) => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
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
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        paddingBottom: 12,
      }}
    >
      <LessonCard lesson={lesson} onPress={() => onPress(lesson)} />
    </Animated.View>
  );
});

AnimatedLessonCard.displayName = "AnimatedLessonCard";

const LessonsScreen = () => {
  const { t } = useTranslation();
  const { id, title } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [allLessons, setAllLessons] = useState<LessonProgress[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(50)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  const {
    data: progressData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useUserProgressWithParams({
    currentPage: currentPage,
    pageSize: PAGE_SIZE,
    lessonCategoryId: parseInt(id as string),
  });

  useEffect(() => {
    const newLessons = progressData?.data?.results;

    if (newLessons) {
      if (currentPage === 1) {
        setAllLessons(newLessons);
        Animated.parallel([
          Animated.timing(headerFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(headerSlideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Add only new lessons to avoid duplicates
        setAllLessons((prevLessons) => {
          const existingIds = new Set(prevLessons.map((l: LessonProgress) => l.id));
          const uniqueNewLessons = newLessons.filter(
            (l: LessonProgress) => !existingIds.has(l.id)
          );
          return [...prevLessons, ...uniqueNewLessons];
        });
      }

      setHasMore(newLessons.length >= PAGE_SIZE);
    }
    setLoadingMore(false);
  }, [progressData, currentPage, headerFadeAnim, headerSlideAnim]);

  // Spin animation effect
  useEffect(() => {
    if (loadingMore || isFetching) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    } else {
      spinAnim.setValue(0);
    }
  }, [loadingMore, isFetching, spinAnim]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setHasMore(true);
    setCurrentPage(1);
    setRefreshing(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !isFetching) {
      setLoadingMore(true);
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [loadingMore, hasMore, isFetching]);

  const handleLessonPress = useCallback((lesson: LessonProgress) => {
    router.push({
      pathname: ROUTES.LESSON.DETAIL,
      params: { id: lesson.lessonId.toString() },
    });
  }, []);

  const { completedLessons, progressPercentage } = useMemo(() => {
    const completed = allLessons.filter(
      (lesson) => lesson.status === "COMPLETED"
    ).length;
    const total = allLessons.length;
    return {
      completedLessons: completed,
      progressPercentage: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [allLessons]);

  const renderListHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <IconSymbol name="chevron.left" size={24} color="#6b7280" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          {title || t("lessons.title")}
        </ThemedText>
      </View>

      {isLoading && currentPage === 1 ? (
        <>
          <Skeleton className="h-32 w-full mb-4 rounded-lg" />
          <Skeleton className="h-24 w-full mb-4 rounded-lg" />
          <Skeleton className="h-24 w-full mb-4 rounded-lg" />
        </>
      ) : (
        allLessons.length > 0 && (
          <>
            <Animated.View
              style={[
                styles.progressCard,
                {
                  opacity: headerFadeAnim,
                  transform: [{ translateY: headerSlideAnim }],
                },
              ]}
            >
              <ThemedText type="subtitle" style={styles.progressTitle}>
                📊 {t("lessons.progress_title")}
              </ThemedText>
              <View style={styles.progressStats}>
                <View style={styles.progressStatItem}>
                  <ThemedText style={styles.progressStatNumber}>
                    {completedLessons}
                  </ThemedText>
                  <ThemedText style={styles.progressStatLabel}>
                    {t("lessons.lessons_completed")}
                  </ThemedText>
                </View>
                <View style={styles.progressStatItem}>
                  <ThemedText style={styles.progressStatNumber}>
                    {allLessons.length}
                  </ThemedText>
                  <ThemedText style={styles.progressStatLabel}>
                    {t("lessons.total_lessons")}
                  </ThemedText>
                </View>
                <View style={styles.progressStatItem}>
                  <ThemedText style={styles.progressStatNumber}>
                    {Math.round(progressPercentage)}%
                  </ThemedText>
                  <ThemedText style={styles.progressStatLabel}>
                    {t("common.complete")}
                  </ThemedText>
                </View>
              </View>
            </Animated.View>

            <View style={styles.lessonsHeader}>
              <ThemedText type="subtitle" style={styles.lessonsTitle}>
                📚 {t("lessons.lessons_list")}
              </ThemedText>
              <Badge variant="outline">
                {allLessons.length} {t("lessons.lessons_count")}
              </Badge>
            </View>
          </>
        )
      )}
    </>
  );

  const renderListFooter = () => (
    <>
      {hasMore && (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={handleLoadMore}
          disabled={loadingMore || isFetching}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.loadMoreText}>
            {loadingMore || isFetching
              ? t("common.loading")
              : t("lessons.load_more")}
          </ThemedText>
          {(loadingMore || isFetching) && (
            <Animated.View style={styles.loadingSpinner}>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: spinAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                }}
              >
                <IconSymbol name="arrow.clockwise" size={16} color="#3b82f6" />
              </Animated.View>
            </Animated.View>
          )}
        </TouchableOpacity>
      )}
      {!hasMore && allLessons.length > 0 && (
        <View style={styles.endOfResultsContainer}>
          <View style={styles.endOfResultsLine} />
          <ThemedText style={styles.endOfResultsText}>
            {t("lessons.end_of_results")}
          </ThemedText>
          <View style={styles.endOfResultsLine} />
        </View>
      )}
      <View style={{ height: 80 }} />
    </>
  );

  if (error) {
    return (
      <HomeLayout>
        <View style={{ flex: 1, padding: 16 }}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <IconSymbol name="chevron.left" size={24} color="#6b7280" />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.title}>
              {title || t("lessons.title")}
            </ThemedText>
          </View>
          <ErrorState
            title={`📚 ${t("lessons.error_loading_lessons")}`}
            description={`📚 ${t("lessons.error_loading_lessons_description")}`}
            error={error?.message || "Unknown error"}
            onRetry={() => refetch()}
            retryText={t("common.retry")}
          />
        </View>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.listContentContainer}>
        {renderListHeader()}
        {!isLoading && allLessons.length === 0 ? (
          <EmptyState
            title={`📚 ${t("lessons.no_lessons")}`}
            description={t("lessons.no_lessons_description")}
            icon="book.closed"
          />
        ) : (
          allLessons.map((lesson, index) => (
            <AnimatedLessonCard
              key={`${lesson.lessonId}-${lesson.id}`}
              lesson={lesson}
              onPress={handleLessonPress}
            />
          ))
        )}
        {renderListFooter()}
      </View>
    </HomeLayout>
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10, // Thêm chút khoảng trống ở trên đầu
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },
  progressCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24, // Tăng khoảng cách
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
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
  lessonsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  lessonsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  loadMoreButton: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3b82f6",
    marginRight: 8,
  },
  loadingSpinner: {
    marginLeft: 8,
  },
  endOfResultsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  endOfResultsLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  endOfResultsText: {
    fontSize: 14,
    color: "#9ca3af",
    marginHorizontal: 16,
    fontStyle: "italic",
  },
});

export default LessonsScreen;
