import HomeLayout from "@components/layouts/HomeLayout";
import LessonCategory from "@components/molecules/LessonCategory";
import { ThemedText } from "@components/ThemedText";
import { Alert } from "@components/ui/Alert";
import { Badge } from "@components/ui/Badge";
import { IconSymbol } from "@components/ui/IconSymbol";
import { Skeleton } from "@components/ui/Skeleton";
import { useLessons, useUserProgress, useUserProgressWithParams } from "@hooks/useLessons";
import { Lesson } from "@models/lesson/lesson.common";
import { useUserStore } from "@stores/user/user.config";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Animated wrapper for LessonCategory
const AnimatedLessonCategory = ({ 
  category, 
  onLessonPress, 
  delay, 
  isLoaded 
}: {
  category: any;
  onLessonPress: (lesson: Lesson) => void;
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
      />
    </Animated.View>
  );
};

const LessonsScreen = () => {
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
  
  // Test useUserProgressWithParams hook with some parameters
  const { 
    data: progressWithParamsData, 
    isLoading: progressWithParamsLoading,
    error: progressWithParamsError 
  } = useUserProgressWithParams({
    currentPage: 1,
    pageSize: 10,
    lessonCategoryId: 1,
  });

  // Console log data for debugging
  useEffect(() => {

    console.log("=== USER PROGRESS WITH PARAMS DATA ===");
    console.log("Progress With Params Data:", progressWithParamsData?.data.results);
  }, [lessonsData, lessonsLoading, lessonsError, progressData, progressLoading, progressWithParamsData, progressWithParamsLoading, progressWithParamsError]);

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
  }, [lessonsLoading, progressLoading, lessonsError, fadeAnim, slideAnim, progressAnim]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLessonPress = (lesson: Lesson) => {
    // Navigate to lesson detail or start lesson
    router.push(`/(app)/lesson/${lesson.id}`);
  };

  const handleNavigationPress = (route: string) => {
    if (route === "reading") {
      router.push("/(app)/(tabs)/reading");
    } else if (route === "speaking") {
      router.push("/(app)/(tabs)/speaking");
    }
  };

  // Create lessons from real progress data
  const createLessonsFromProgress = (progressData: any[]): Lesson[] => {
    return progressData.map((progressItem) => ({
      id: progressItem.lessonId.toString(),
      title: progressItem.lesson.titleJp,
      description: `Bài học N${progressItem.lesson.levelJlpt}`,
      isCompleted: progressItem.status === "COMPLETED",
      level: `N${progressItem.lesson.levelJlpt}` as "N5" | "N4" | "N3",
      estimatedTime: 15,
      type: "vocabulary" as const,
      difficulty: "beginner" as const,
      progress: progressItem.progressPercentage,
      tags: ["basic"],
      createdAt: progressItem.createdAt,
      updatedAt: progressItem.updatedAt,
    }));
  };

  // Create categories with real data only
  const levelCategories = [
    {
      id: "1",
      name: "N5 - Cơ bản",
      description: "Học tiếng Nhật cơ bản cho người mới bắt đầu",
      color: "#10b981",
      level: "N5" as const,
      icon: "1.circle.fill",
      lessons: progressWithParamsData?.data?.results 
        ? createLessonsFromProgress(progressWithParamsData.data.results)
        : [],
    },
  ];

  const navigationCategories = [
    {
      id: "4",
      name: "📖 Reading Practice",
      description: "Luyện tập đọc hiểu tiếng Nhật",
      color: "#f59e0b",
      icon: "book.fill",
      route: "reading",
    },
    {
      id: "5",
      name: "🎤 Speaking Practice", 
      description: "Luyện tập nói tiếng Nhật",
      color: "#ef4444",
      icon: "mic.fill",
      route: "speaking",
    },
  ];

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
        <Alert variant="destructive" className="mb-4">
          <Text className="text-red-800">
            Có lỗi xảy ra khi tải danh sách bài học. Vui lòng thử lại.
          </Text>
        </Alert>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <ThemedText type="title" style={styles.title}>
        📚 {t("lessons.title")}
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Tiếp tục hành trình học tập tiếng Nhật của bạn
      </ThemedText>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
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
              📊 Tiến độ học tập
            </ThemedText>
            <View style={styles.progressStats}>
              <View style={styles.progressStatItem}>
                <ThemedText style={styles.progressStatNumber}>
                  {lessonsData?.data.completedLessons || 0}
                </ThemedText>
                <ThemedText style={styles.progressStatLabel}>
                  Bài hoàn thành
                </ThemedText>
              </View>
              <View style={styles.progressStatItem}>
                <ThemedText style={styles.progressStatNumber}>
                  {lessonsData?.data.totalLessons || 0}
                </ThemedText>
                <ThemedText style={styles.progressStatLabel}>
                  Tổng bài học
                </ThemedText>
              </View>
              <View style={styles.progressStatItem}>
                <ThemedText style={styles.progressStatNumber}>
                  {userLevel}
                </ThemedText>
                <ThemedText style={styles.progressStatLabel}>Cấp độ</ThemedText>
              </View>
            </View>
            
            {/* Debug info for useUserProgressWithParams */}
            {progressWithParamsData && (
              <View style={styles.debugInfo}>
                <ThemedText style={styles.debugTitle}>
                  🔍 Debug Info (useUserProgressWithParams):
                </ThemedText>
                <ThemedText style={styles.debugText}>
                  Status: {progressWithParamsLoading ? "Loading..." : "Loaded"}
                </ThemedText>
                <ThemedText style={styles.debugText}>
                  Total Items: {progressWithParamsData?.data?.pagination?.totalItem || 0}
                </ThemedText>
                <ThemedText style={styles.debugText}>
                  Current Page: {progressWithParamsData?.data?.pagination?.current || 0}
                </ThemedText>
                {progressWithParamsError && (
                  <ThemedText style={styles.debugError}>
                    Error: {JSON.stringify(progressWithParamsError)}
                  </ThemedText>
                )}
              </View>
            )}
          </Animated.View>
        )}

        {/* Level Categories - Only show if has real data */}
        {levelCategories.some(category => category.lessons.length > 0) ? (
          <View style={styles.categoriesSection}>
            <View style={styles.categoriesHeader}>
              <ThemedText type="subtitle" style={styles.categoriesTitle}>
                🎯 Cấp độ học tập
              </ThemedText>
              <Badge variant="outline">
                {levelCategories.filter(category => category.lessons.length > 0).length} cấp độ
              </Badge>
            </View>

            <View style={styles.categoriesContainer}>
              {levelCategories
                .filter(category => category.lessons.length > 0)
                .map((category, index) => (
                  <AnimatedLessonCategory
                    key={category.id}
                    category={category}
                    onLessonPress={handleLessonPress}
                    delay={index * 100}
                    isLoaded={isLoaded}
                  />
                ))}
            </View>
          </View>
        ) : (
          !progressWithParamsLoading && (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateTitle}>
                📚 Chưa có bài học nào
              </ThemedText>
              <ThemedText style={styles.emptyStateDescription}>
                Bạn chưa có bài học nào trong hệ thống. Vui lòng liên hệ admin để được thêm bài học.
              </ThemedText>
            </View>
          )
        )}

        {/* Navigation Categories (Reading, Speaking) */}
        <View style={styles.categoriesSection}>
          <View style={styles.categoriesHeader}>
            <ThemedText type="subtitle" style={styles.categoriesTitle}>
              🚀 Luyện tập kỹ năng
            </ThemedText>
            <Badge variant="outline">
              {navigationCategories.length} kỹ năng
            </Badge>
          </View>

          <View style={styles.navigationContainer}>
            {navigationCategories.map((category, index) => (
              <Animated.View
                key={category.id}
                style={{
                  opacity: isLoaded ? fadeAnim : 0,
                  transform: [{ 
                    translateY: isLoaded ? slideAnim : 30 
                  }],
                }}
              >
                <TouchableOpacity
                  style={[styles.navigationCard, { borderLeftColor: category.color }]}
                  onPress={() => handleNavigationPress(category.route)}
                  activeOpacity={0.8}
                >
                  <View style={styles.navigationHeader}>
                    <View
                      style={[styles.navigationIcon, { backgroundColor: category.color }]}
                    >
                      <IconSymbol
                        name={category.icon as any}
                        size={24}
                        color="#ffffff"
                      />
                    </View>
                    <View style={styles.navigationInfo}>
                      <ThemedText type="subtitle" style={styles.navigationTitle}>
                        {category.name}
                      </ThemedText>
                      <ThemedText style={styles.navigationDescription}>
                        {category.description}
                      </ThemedText>
                    </View>
                    <View style={styles.navigationArrow}>
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
      </ScrollView>
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
  scrollView: {
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
  navigationContainer: {
    gap: 16,
  },
  navigationCard: {
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
  navigationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  navigationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  navigationInfo: {
    flex: 1,
  },
  navigationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  navigationDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  navigationArrow: {
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
  emptyState: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
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
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default LessonsScreen;
