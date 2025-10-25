import { ThemedText } from "@components/ThemedText";
import { IconSymbol } from "@components/ui/IconSymbol";
import {
    LessonCategory as LessonCategoryType,
    LessonProgress,
} from "@models/lesson/lesson.common";
import { getCategoryIcon } from "@utils/lesson.utils";
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
    LayoutAnimation,
    Platform,
    StyleSheet,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import LessonCard from "./LessonCard";

// Simplified animated wrapper for LessonCard
const AnimatedLessonCard = React.memo(({
  lesson,
  onPress,
  index,
}: {
  lesson: LessonProgress;
  onPress: (lesson: LessonProgress) => void;
  index: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const animationDelay = Math.min(index * 50, 200);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        delay: animationDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, slideAnim]);

  const handlePress = useCallback(() => {
    onPress(lesson);
  }, [onPress, lesson]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <LessonCard lesson={lesson} onPress={handlePress} />
    </Animated.View>
  );
});

AnimatedLessonCard.displayName = "AnimatedLessonCard";

interface LessonCategoryProps {
  category: LessonCategoryType;
  onLessonPress?: (lesson: LessonProgress) => void;
  onCategoryPress?: (category: LessonCategoryType) => void;
}

const LessonCategory: React.FC<LessonCategoryProps> = React.memo(
  ({ category, onLessonPress, onCategoryPress }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const animatedRotation = useRef(new Animated.Value(0)).current;

    // Enable LayoutAnimation on Android
    useEffect(() => {
      if (Platform.OS === "android") {
        if (UIManager.setLayoutAnimationEnabledExperimental) {
          UIManager.setLayoutAnimationEnabledExperimental(true);
        }
      }
    }, []);
    // Memoized calculations for better performance
    const { completedLessons, totalLessons, progressPercentage } =
      useMemo(() => {
        const completed = category.lessons.filter(
          (lesson) => lesson.status === "COMPLETED"
        ).length;
        const total = category.lessons.length;
        const progress = total > 0 ? (completed / total) * 100 : 0;

        return {
          completedLessons: completed,
          totalLessons: total,
          progressPercentage: progress,
        };
      }, [category.lessons]);

    const handleToggle = useCallback(() => {
      if (onCategoryPress) {
        // Navigate to dedicated screen for better performance
        onCategoryPress(category);
      } else {
        // Fallback to expand/collapse for backward compatibility
        LayoutAnimation.configureNext({
          duration: 300,
          create: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
          update: {
            type: LayoutAnimation.Types.easeInEaseOut,
          },
          delete: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
        });

        // Animate chevron rotation
        Animated.timing(animatedRotation, {
          toValue: isExpanded ? 0 : 1,
          duration: 200,
          useNativeDriver: true,
        }).start();

        setIsExpanded(!isExpanded);
      }
    }, [onCategoryPress, category, isExpanded, animatedRotation]);

    // Get icon for this category
    const categoryIcon = getCategoryIcon(category.name);

    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handleToggle}
          style={[styles.categoryCard, { borderLeftColor: category.color }]}
          activeOpacity={0.8}
        >
          <View style={styles.categoryHeader}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: category.color },
              ]}
            >
              <IconSymbol
                name={categoryIcon as any}
                size={24}
                color="#ffffff"
              />
            </View>
            <View style={styles.categoryInfo}>
              <View style={styles.categoryDetails}>
                <ThemedText type="subtitle" style={styles.categoryName}>
                  {category.name}
                </ThemedText>
                <ThemedText style={styles.categoryDescription}>
                  {category.description}
                </ThemedText>
              </View>
              <View style={styles.statsContainer}>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progressPercentage}%`,
                          backgroundColor: category.color,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={styles.progressText}>
                    {completedLessons}/{totalLessons}
                  </ThemedText>
                </View>
                <View style={styles.navigationIcon}>
                  <IconSymbol
                    name={onCategoryPress ? "arrow.right" : "chevron.down"}
                    size={20}
                    color="#6b7280"
                  />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.lessonsContainer}>
            {category.lessons.map((lesson, index) => (
              <AnimatedLessonCard
                key={`${lesson.lessonId}-${lesson.id}-${index}`}
                lesson={lesson}
                onPress={onLessonPress || (() => {})}
                index={index}
              />
            ))}
          </View>
        )}
      </View>
    );
  }
);

LessonCategory.displayName = "LessonCategory";

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  categoryCard: {
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
  categoryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryDetails: {
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    marginRight: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  navigationIcon: {
    marginLeft: 8,
  },
  lessonsContainer: {
    marginTop: 12,
    paddingLeft: 8,
    gap: 12,
    overflow: "hidden",
  },
});

export default LessonCategory;
