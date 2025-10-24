import HomeLayout from "@components/layouts/HomeLayout";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import ErrorState from "@components/ui/ErrorState";
import { IconSymbol } from "@components/ui/IconSymbol";
import { Progress } from "@components/ui/Progress";
import { Skeleton } from "@components/ui/Skeleton";
import { useLesson } from "@hooks/useLessons";
import { getDifficultyColor, getRarityColor, getTypeColor, getTypeIcon } from "@utils/lesson.utils";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

const LessonDetailScreen = () => {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: lessonData, isLoading, error } = useLesson(id || "");

  const lesson = lessonData?.data;

  if (isLoading) {
    return (
      <HomeLayout>
        <ThemedText type="title" style={styles.title}>
          📚 {t("lessons.title")}
        </ThemedText>
        <Skeleton className="h-8 w-3/4 mb-4 rounded" />
        <Skeleton className="h-4 w-full mb-2 rounded" />
        <Skeleton className="h-4 w-2/3 mb-4 rounded" />
        <Skeleton className="h-32 w-full mb-4 rounded-lg" />
        <Skeleton className="h-24 w-full mb-4 rounded-lg" />
      </HomeLayout>
    );
  }

  if (error || !lesson) {
    return (
      <HomeLayout>
        <ThemedText type="title" style={styles.title}>
          📚 {t("lessons.title")}
        </ThemedText>
        <ErrorState
          title="Không thể tải bài học"
          description="Không thể tải thông tin bài học. Vui lòng kiểm tra kết nối mạng và thử lại."
          error={error?.message || "Lesson not found"}
          onRetry={() => router.back()}
          retryText="Quay lại"
        />
      </HomeLayout>
    );
  }


  const handleStartLesson = () => {
    // Navigate to lesson content
    alert("Bắt đầu bài học: " + lesson.title);
  };

  return (
    <HomeLayout>
      <ThemedText type="title" style={styles.title}>
        📚 {lesson.title}
      </ThemedText>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol name="chevron.left" size={20} color="#3b82f6" />
            <ThemedText style={styles.backButtonText}>Quay lại</ThemedText>
          </TouchableOpacity>

          <ThemedView style={styles.lessonHeaderCard}>
            <View style={styles.lessonHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: getTypeColor(lesson.type) },
                ]}
              >
                <IconSymbol
                  name={getTypeIcon(lesson.type) as any}
                  size={32}
                  color="#ffffff"
                />
              </View>
              <View style={styles.lessonInfo}>
                <ThemedText type="subtitle" style={styles.lessonTitle}>
                  {lesson.title}
                </ThemedText>
                <ThemedText style={styles.lessonDescription}>
                  {lesson.description}
                </ThemedText>
              </View>
              {lesson.pokemonReward && (
                <View style={styles.pokemonReward}>
                  <Image
                    source={{ uri: lesson.pokemonReward.image }}
                    style={styles.pokemonImage}
                  />
                  <View
                    style={[
                      styles.rarityIndicator,
                      {
                        backgroundColor: getRarityColor(
                          lesson.pokemonReward.rarity
                        ),
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          </ThemedView>

          {/* Tags */}
          <ThemedView style={styles.tagsCard}>
            <View style={styles.tagsContainer}>
              <Badge variant="secondary">{lesson.level}</Badge>
              <Badge
                style={{
                  backgroundColor: getDifficultyColor(lesson.difficulty),
                }}
              >
                {lesson.difficulty}
              </Badge>
              <Badge variant="outline">{`⏱️ ${lesson.estimatedTime}m`}</Badge>
            </View>
          </ThemedView>

          {/* Progress */}
          {lesson.progress > 0 && (
            <ThemedView style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <ThemedText type="subtitle" style={styles.progressTitle}>
                  📊 {t("lessons.progress_title")}
                </ThemedText>
                <ThemedText style={styles.progressPercentage}>
                  {lesson.progress}%
                </ThemedText>
              </View>
              <Progress value={lesson.progress} className="h-3" />
            </ThemedView>
          )}
        </View>

        {/* Lesson Info */}
        <ThemedView style={styles.infoCard}>
          <ThemedText type="subtitle" style={styles.infoTitle}>
            ℹ️ {t("lessons.lesson_info.title")}
          </ThemedText>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>{t("lessons.lesson_info.lesson_type")}:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {t(`lessons.lesson_types.${lesson.type}`)}
              </ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>{t("lessons.lesson_info.level")}:</ThemedText>
              <Badge variant="secondary">{lesson.level}</Badge>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>{t("lessons.lesson_info.difficulty")}:</ThemedText>
              <Badge
                style={{
                  backgroundColor: getDifficultyColor(lesson.difficulty),
                }}
              >
                {t(`lessons.difficulty.${lesson.difficulty}`)}
              </Badge>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>
                {t("lessons.lesson_info.estimated_time")}:
              </ThemedText>
              <ThemedText style={styles.infoValue}>
                {lesson.estimatedTime} {t("lessons.lesson_info.minutes")}
              </ThemedText>
            </View>

            {lesson.pokemonReward && (
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>{t("lessons.lesson_info.reward")}:</ThemedText>
                <View style={styles.pokemonRewardInfo}>
                  <Image
                    source={{ uri: lesson.pokemonReward.image }}
                    style={styles.pokemonRewardImage}
                  />
                  <ThemedText style={styles.pokemonRewardName}>
                    {lesson.pokemonReward.name}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        </ThemedView>

        {/* Status */}
        <ThemedView style={styles.statusCard}>
          <ThemedText type="subtitle" style={styles.statusTitle}>
            📋 {t("lessons.lesson_info.status")}
          </ThemedText>

          {lesson.isCompleted ? (
            <View style={styles.statusContainer}>
              <ThemedText style={styles.statusCompleted}>
                ✅ {t("lessons.lesson_status.completed")}
              </ThemedText>
            </View>
          ) : lesson.progress > 0 ? (
            <View style={styles.statusContainer}>
              <ThemedText style={styles.statusInProgress}>
                🔄 {t("lessons.lesson_status.in_progress")}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.statusContainer}>
              <ThemedText style={styles.statusNotStarted}>
                ⭕ {t("lessons.lesson_status.not_started")}
              </ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Action Button */}
        <View style={styles.actionButtonContainer}>
          <Button
            onPress={handleStartLesson}
            style={styles.actionButton}
            size="lg"
          >
            {lesson.isCompleted
              ? "Ôn tập lại"
              : lesson.progress > 0
                ? "Tiếp tục học"
                : "Bắt đầu học"}
          </Button>
        </View>
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
  scrollView: {
    flex: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3b82f6",
    marginLeft: 4,
  },
  lessonHeaderCard: {
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
  lessonHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 22,
  },
  pokemonReward: {
    marginLeft: 12,
    position: "relative",
  },
  pokemonImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  rarityIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  tagsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  progressCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3b82f6",
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  pokemonRewardInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  pokemonRewardImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  pokemonRewardName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  statusCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  statusContainer: {
    alignItems: "center",
  },
  statusCompleted: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
  },
  statusInProgress: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
  statusNotStarted: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  actionButtonContainer: {
    marginBottom: 16,
  },
  actionButton: {
    width: "100%",
  },
  bottomSpacing: {
    height: 80,
  },
});

export default LessonDetailScreen;
