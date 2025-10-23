import { ThemedText } from "@components/ThemedText";
import { IconSymbol } from "@components/ui/IconSymbol";
import {
  Lesson,
  LessonCategory as LessonCategoryType,
} from "@models/lesson/lesson.common";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View
} from "react-native";
import LessonCard from "./LessonCard";

// Animated wrapper for LessonCard
const AnimatedLessonCard = ({ 
  lesson, 
  onPress, 
  index 
}: {
  lesson: any;
  onPress: (lesson: any) => void;
  index: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50, // Staggered animation
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <LessonCard
        lesson={lesson}
        onPress={onPress}
      />
    </Animated.View>
  );
};

interface LessonCategoryProps {
  category: LessonCategoryType;
  onLessonPress?: (lesson: Lesson) => void;
}

const LessonCategory: React.FC<LessonCategoryProps> = ({
  category,
  onLessonPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedRotation = useRef(new Animated.Value(0)).current;

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  const handleToggle = () => {
    // Configure smooth layout animation
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
  };

  const completedLessons = category.lessons.filter(
    (lesson) => lesson.isCompleted
  ).length;
  const totalLessons = category.lessons.length;
  const progressPercentage =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "n5 - cơ bản":
      case "n5":
        return "1.circle.fill";
      case "n4 - sơ cấp":
      case "n4":
        return "2.circle.fill";
      case "n3 - trung cấp":
      case "n3":
        return "3.circle.fill";
      case "vocabulary":
        return "textformat.abc";
      case "grammar":
        return "textformat.123";
      case "reading":
        return "book.fill";
      case "listening":
        return "headphones";
      case "kanji":
        return "character";
      case "conversation":
        return "bubble.left.and.bubble.right.fill";
      case "writing":
        return "pencil.and.outline";
      default:
        return "folder.fill";
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleToggle}
        style={[styles.categoryCard, { borderLeftColor: category.color }]}
        activeOpacity={0.8}
      >
        <View style={styles.categoryHeader}>
          <View
            style={[styles.iconContainer, { backgroundColor: category.color }]}
          >
            <IconSymbol
              name={getCategoryIcon(category.name) as any}
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
              <Animated.View 
                style={[
                  styles.expandIcon,
                  {
                    transform: [{
                      rotate: animatedRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      }),
                    }],
                  },
                ]}
              >
                <IconSymbol
                  name="chevron.down"
                  size={20}
                  color="#6b7280"
                />
              </Animated.View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.lessonsContainer}>
          {category.lessons.map((lesson, index) => (
            <AnimatedLessonCard
              key={lesson.id}
              lesson={lesson}
              onPress={onLessonPress || (() => {})}
              index={index}
            />
          ))}
        </View>
      )}
    </View>
  );
};

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
  expandIcon: {
    marginLeft: 8,
  },
  lessonsContainer: {
    marginTop: 12,
    paddingLeft: 8,
    gap: 12,
    overflow: 'hidden',
  },
});

export default LessonCategory;
