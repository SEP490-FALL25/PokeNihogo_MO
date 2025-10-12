import HomeLayout from "@components/layouts/HomeLayout";
import LessonCategory from "@components/molecules/LessonCategory";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { Alert } from "@components/ui/Alert";
import { Badge } from "@components/ui/Badge";
import { Skeleton } from "@components/ui/Skeleton";
import { useLessons, useUserProgress } from "@hooks/useLessons";
import { Lesson } from "@models/lesson/lesson.common";
import { useUserStore } from "@stores/user/user.config";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const LessonsScreen = () => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const { level: userLevel } = useUserStore();
  const {
    data: lessonsData,
    isLoading: lessonsLoading,
    error: lessonsError,
    refetch,
  } = useLessons(userLevel || "N5");
  const { data: progressData, isLoading: progressLoading } = useUserProgress();

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

  const categories = lessonsData?.data.categories || [];

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
        {progressData && (
          <ThemedView style={styles.progressCard}>
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
          </ThemedView>
        )}

        {/* Current Level Info */}
        <ThemedView style={styles.levelInfoCard}>
          <ThemedText type="subtitle" style={styles.levelInfoTitle}>
            🎯 {t(`lessons.level_names.${userLevel}`)} - Cấp độ {userLevel}
          </ThemedText>
          <ThemedText style={styles.levelInfoDescription}>
            Khám phá {categories.length} danh mục bài học được thiết kế riêng
            cho cấp độ của bạn
          </ThemedText>
        </ThemedView>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <View style={styles.categoriesHeader}>
            <ThemedText type="subtitle" style={styles.categoriesTitle}>
              📖 {t("lessons.categories")}
            </ThemedText>
            <Badge variant="outline">
              {`${categories.length} ${t("lessons.categories_count")}`}
            </Badge>
          </View>

          {categories.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyStateTitle}>
                📭 {t("lessons.no_lessons")} {userLevel}
              </ThemedText>
              <ThemedText style={styles.emptyStateDescription}>
                {t("lessons.contact_admin")}
              </ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <LessonCategory
                  key={category.id}
                  category={category}
                  onLessonPress={handleLessonPress}
                />
              ))}
            </View>
          )}
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
  emptyState: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
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
  bottomSpacing: {
    height: 80,
  },
});

export default LessonsScreen;
