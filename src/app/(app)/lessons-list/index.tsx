import LessonCard from "@components/lesson/LessonCard";
import { ThemedText } from "@components/ThemedText";
import { Badge } from "@components/ui/Badge";
import EmptyState from "@components/ui/EmptyState";
import ErrorState from "@components/ui/ErrorState";
// Removed IconSymbol in favor of lucide-react-native icons
import { Skeleton } from "@components/ui/Skeleton";
import { useInfiniteUserLessons } from "@hooks/useLessons";
import { LessonProgress } from "@models/lesson/lesson.common";
import { ROUTES } from "@routes/routes";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Search } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Optimized animated wrapper for LessonCard
const AnimatedLessonCard = React.memo(
  ({
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
  }
);

AnimatedLessonCard.displayName = "AnimatedLessonCard";

const LessonsScreen = () => {
  const { t } = useTranslation();
  const { id, title } = useLocalSearchParams<{ id?: string; title?: string }>();

  // Search functionality with debouncing
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Infinite scroll with the new hook
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteUserLessons({
    pageSize: 5,
    lessonCategoryId: id ? parseInt(id, 10) : undefined,
  });
  // Get all lessons from all pages
  const allLessons = useMemo(() => {
    return (data?.pages ?? []).flatMap((p: any) => p?.data?.results ?? []);
  }, [data]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLessonPress = useCallback((lesson: LessonProgress) => {
    router.push({
      pathname: ROUTES.LESSON.DETAIL,
      params: { id: lesson.lessonId.toString() },
    });
  }, []);

  const { completedLessons, progressPercentage } = useMemo(() => {
    const completed = allLessons.filter(
      (lesson: LessonProgress) => lesson.status === "COMPLETED"
    ).length;
    const total = allLessons.length;
    return {
      completedLessons: completed,
      progressPercentage: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [allLessons]);

  // Filter lessons based on search query
  const filteredLessons = useMemo(() => {
    if (!debouncedQuery) return allLessons;
    return allLessons.filter((lesson: LessonProgress) =>
      lesson.lesson?.titleJp
        ?.toLowerCase()
        .includes(debouncedQuery.toLowerCase())
    );
  }, [allLessons, debouncedQuery]);

  const renderListHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#6b7280" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          {title || t("lessons.title")}
        </ThemedText>
      </View>

      {/* Progress Stats Card */}
      {allLessons.length > 0 && (
        <LinearGradient
          colors={["#6FAFB2", "#538f91"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.progressCard}
          className="rounded-3xl p-5 overflow-hidden shadow-lg"
        >
          {/* Decorative circles */}
          <View className="absolute w-30 h-30 rounded-full bg-white/10" />
          <View className="absolute w-20 h-20 rounded-full bg-white/8" />

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

          {/* Progress bar */}
          <View className="mt-4">
            <View className="h-2 bg-white/25 rounded-sm overflow-hidden">
              <LinearGradient
                colors={["#10b981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercentage}%` },
                ]}
                className="h-full rounded-sm"
              />
            </View>
          </View>
        </LinearGradient>
      )}

      {/* Search Bar */}
      <View className="mb-4">
        <LinearGradient
          colors={["#ffffff", "#fefefe"]}
          style={styles.searchBar}
        >
          <View className="w-9 h-9 rounded-xl bg-teal-50 items-center justify-center mr-3">
            <Search size={20} color="#6FAFB2" strokeWidth={2.5} />
          </View>
          <TextInput
            placeholder={t("search.placeholder")}
            placeholderTextColor="#94A3B8"
            className="flex-1 text-base font-semibold text-slate-800 tracking-wide"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center"
            >
              <ThemedText className="text-base font-bold text-slate-500">
                ✕
              </ThemedText>
            </Pressable>
          )}
        </LinearGradient>
      </View>

      {/* Results count */}
      {debouncedQuery.length > 0 && (
        <ThemedText className="text-sm font-bold text-slate-500 mb-3 ml-1 tracking-wide">
          {t("search.found_results", { count: filteredLessons.length })}
        </ThemedText>
      )}

      {/* Lessons Header */}
      {allLessons.length > 0 && (
        <View style={styles.lessonsHeader}>
          <ThemedText type="subtitle" style={styles.lessonsTitle}>
            📚 {t("lessons.lessons_list")}
          </ThemedText>
          <Badge variant="outline">
            {allLessons.length} {t("lessons.lessons_count")}
          </Badge>
        </View>
      )}
    </>
  );

  const renderLessonItem = ({ item }: { item: LessonProgress }) => (
    <AnimatedLessonCard
      lesson={item}
      onPress={handleLessonPress}
    />
  );

  const renderListFooter = () => (
    <>
      {isFetchingNextPage && (
        <View className="py-3">
          <ActivityIndicator size="large" color="#929898" />
        </View>
      )}
      {!hasNextPage && allLessons.length > 0 && (
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

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-slate-100">
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, padding: 16 }}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ChevronLeft size={24} color="#6b7280" />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.title}>
              {title || t("lessons.title")}
            </ThemedText>
          </View>
          <ErrorState
            title={`📚 ${t("lessons.error_loading_lessons")}`}
            description={`📚 ${t("lessons.error_loading_lessons_description")}`}
            error="Unknown error"
            onRetry={() => refetch()}
            retryText={t("common.retry")}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <StatusBar barStyle="dark-content" />

      <View style={styles.listContentContainer}>
        {renderListHeader()}

        {/* Lessons List */}
        {isLoading ? (
          <FlatList
            data={Array.from({ length: 5 }, (_, i) => i)}
            keyExtractor={(item) => `skeleton-${item}`}
            renderItem={() => (
              <Skeleton
                style={{ height: 120, borderRadius: 16 }}
                className="mb-3"
              />
            )}
            showsVerticalScrollIndicator={false}
            className="pb-6"
          />
        ) : filteredLessons.length === 0 ? (
          <EmptyState
            title={`📚 ${t("lessons.no_lessons")}`}
            description={t("lessons.no_lessons_description")}
            icon="book.closed"
          />
        ) : (
          <FlatList
            data={filteredLessons}
            keyExtractor={(item, index) => `lesson-${item.lessonId}-${item.id}-${index}`}
            renderItem={renderLessonItem}
            showsVerticalScrollIndicator={false}
            className="pb-6"
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                handleLoadMore();
              }
            }}
            refreshing={isLoading}
            onRefresh={handleRefresh}
            ListFooterComponent={renderListFooter}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
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
  // Progress Card - Enhanced with gradient styling
  progressCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#6FAFB2",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
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
    color: "white",
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },

  // Search Bar - Enhanced styling
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
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

