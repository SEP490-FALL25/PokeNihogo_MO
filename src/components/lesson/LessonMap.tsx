import LottieAnimation from "@components/ui/LottieAnimation";
import { LessonProgress } from "@models/lesson/lesson.common";
import { Image, type ImageSource } from "expo-image";
import React, { useMemo } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

// Lấy kích thước màn hình
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// --- CẤU HÌNH CHUNG ---
const NODE_SIZE = 85; // Kích thước node
const NODE_VERTICAL_SPACING = 130; // Khoảng cách dọc
const CURVE_AMPLITUDE = 90; // Biên độ cong (Độ lệch tối đa)

// ĐỊNH NGHĨA CHU KỲ MỚI (Mô hình tuyến tính liên tục: Node 1 -> 5 là nửa chu kỳ)
const HALF_CYCLE_NODES = 4; // Số bước (segments) từ Tâm đến Tâm (Node 1 -> 5)
const PEAK_NODE_INDEX = 2; // Node thứ 3 là đỉnh (index 2)
const CYCLE_LENGTH = 8; // Tổng số bước (Node 1 -> Node 9)

const DUO_OFFSET = NODE_SIZE / 2 + 120; // Khoảng cách Duo so với cạnh node
const DUO_IMAGE_SIZE = 170;
const DUO_FIXED_Y_OFFSET = 0; // Điều chỉnh Duo lên trên một chút

const STATUS_ICON_MAP: Record<string, ImageSource> = {
  COMPLETED: require("@assets/images/COMPLETED.png"),
  FAILED: require("@assets/images/FAILED.png"),
  IN_PROGRESS: require("@assets/images/IN_PROGRESS.png"),
  NOT_STARTED: require("@assets/images/NOT_STARTED.png"),
  TESTING_LAST: require("@assets/images/TESTING_LAST.png"),
  TESTING_LAST_FAILED: require("@assets/images/TESTING_LAST_FAILED.png"),
};

const STATUS_STYLE_MAP: Record<
  string,
  { backgroundColor: string; shadowColor: string }
> = {
  COMPLETED: {
    backgroundColor: "#dcfce7",
    shadowColor: "#166534",
  },
  FAILED: {
    backgroundColor: "#fee2e2",
    shadowColor: "#991b1b",
  },
  IN_PROGRESS: {
    backgroundColor: "#dbeafe",
    shadowColor: "#1e3a8a",
  },
  NOT_STARTED: {
    backgroundColor: "#f3f4f6",
    shadowColor: "#222222",
  },
  TESTING_LAST: {
    backgroundColor: "#dbeafe",
    shadowColor: "#1e3a8a",
  },
  TESTING_LAST_FAILED: {
    backgroundColor: "#fee2e2",
    shadowColor: "#991b1b",
  },
};

// Định nghĩa kiểu dữ liệu cho node bài học
export type LessonNode = {
  id: number;
  lessonId: number;
  type: "lesson";
  iconSource: ImageSource;
  x: number;
  y: number;
  isCompleted: boolean;
  isActive: boolean;
  isUnlocked: boolean;
  curveSide: "left" | "right";
  progressPercentage: number;
  lessonProgress: LessonProgress; // Lưu thông tin gốc
};

// Type cho Duo source - có thể là ảnh hoặc Lottie animation
export type DuoSource = 
  | { type: "lottie"; source: any } // Lottie: require() hoặc URL string
  | { type: "image"; source: any }; // Image: require() hoặc { uri: string }

export interface LessonMapProps {
  lessons: LessonProgress[];
  /**
   * Danh sách ảnh hoặc Lottie animation cho Duo (optional)
   * 
   * Có thể truyền theo 2 cách:
   * 1. Format mới (khuyến nghị): [{ type: "lottie", source: require(...) }, { type: "image", source: "url" }]
   * 2. Format cũ (backward compatible): [require(...), "url", { uri: "..." }]
   *    - String hoặc object có uri -> tự động detect là image
   *    - require() hoặc object khác -> tự động detect là lottie
   */
  duoImages?: (DuoSource | any)[]; 
  onLessonPress?: (lesson: LessonProgress) => void;
  screenWidth?: number; // Cho phép override screen width
}

/**
 * Convert LessonProgress[] thành LessonNode[] với tính toán vị trí đường cong
 */
const convertLessonsToNodes = (
  lessons: LessonProgress[],
  screenWidth: number
): LessonNode[] => {
  const data: LessonNode[] = [];
  const middleX = screenWidth / 2;

  // Tìm bài học đang active (IN_PROGRESS hoặc bài học đầu tiên chưa completed)
  let activeIndex = -1;
  for (let i = 0; i < lessons.length; i++) {
    if (lessons[i].status === "IN_PROGRESS") {
      activeIndex = i;
      break;
    }
  }
  // Nếu không có IN_PROGRESS, tìm bài học đầu tiên chưa completed
  if (activeIndex === -1) {
    activeIndex = lessons.findIndex(
      (lesson) => lesson.status !== "COMPLETED"
    );
  }

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const y = NODE_SIZE / 2 + 30 + i * NODE_VERTICAL_SPACING;

    // Index trong chu kỳ 8 bước: 0, 1, 2, 3, 4, 5, 6, 7
    const indexInCycle = i % CYCLE_LENGTH;

    let normalizedOffset: number; // Tỷ lệ từ 0 (tâm) đến 1 (peak)
    let sign = 1; // 1: Cong phải, -1: Cong trái
    let curveSide: "left" | "right";

    // Tính toán độ lệch cho từng node trong chu kỳ 8 bước
    if (indexInCycle <= PEAK_NODE_INDEX) {
      // Giai đoạn 1 (0, 1, 2): Tăng từ 0 đến +60 (Node 1 -> 3)
      normalizedOffset = indexInCycle / PEAK_NODE_INDEX;
      sign = 1;
    } else if (indexInCycle <= HALF_CYCLE_NODES) {
      // index <= 4
      // Giai đoạn 2 (2, 3, 4): Giảm từ +60 về 0 (Node 3 -> 5)
      normalizedOffset =
        1 - (indexInCycle - PEAK_NODE_INDEX) / PEAK_NODE_INDEX;
      sign = 1;
    } else if (indexInCycle <= HALF_CYCLE_NODES + PEAK_NODE_INDEX) {
      // index <= 6
      // Giai đoạn 3 (4, 5, 6): Tăng từ 0 đến -60 (Node 5 -> 7)
      normalizedOffset = (indexInCycle - HALF_CYCLE_NODES) / PEAK_NODE_INDEX;
      sign = -1;
    } else {
      // index <= 7
      // Giai đoạn 4 (6, 7): Giảm từ -60 về -30 (Node 7 -> 8). Node 9 (index 0 của chu kỳ tiếp theo) là 0.
      normalizedOffset =
        1 -
        (indexInCycle - (HALF_CYCLE_NODES + PEAK_NODE_INDEX)) /
          PEAK_NODE_INDEX;
      sign = -1;
    }

    let offsetX = CURVE_AMPLITUDE * normalizedOffset * sign;
    curveSide = sign === 1 ? "right" : "left";

    const x = middleX + offsetX;

    const rawStatus = (lesson.status as string) ?? "NOT_STARTED";
    const statusKey = rawStatus.toUpperCase();
    const iconSource =
      STATUS_ICON_MAP[statusKey] ?? STATUS_ICON_MAP.NOT_STARTED;

    // Logic xác định trạng thái
    const isCompleted = statusKey === "COMPLETED";
    const isActive = i === activeIndex;
    // Unlock: Chỉ xét status, không cần check bài trước. Tất cả bài đều unlock (có thể làm bất kì bài nào)
    const isUnlocked = true;

    data.push({
      id: lesson.id,
      lessonId: lesson.lessonId,
      type: "lesson",
      iconSource,
      x,
      y,
      isCompleted,
      isActive,
      isUnlocked,
      curveSide,
      progressPercentage: lesson.progressPercentage,
      lessonProgress: lesson,
    });
  }

  return data;
};

// Component để render từng nút bài học
const LessonNodeComponent: React.FC<{
  node: LessonNode;
  onPress?: (lesson: LessonProgress) => void;
}> = ({ node, onPress }) => {
  const { isActive, isUnlocked, progressPercentage } = node;
  const translateY = useSharedValue(0);
  const shadowOpacity = useSharedValue(1);

  const style = useMemo(() => {
    const iconContainerStyle: ViewStyle[] = [
      styles.baseIconContainer,
      styles.lessonIconWrapper,
    ];
    let shadowColor = "#1a1a1a";

    if (!isUnlocked) {
      iconContainerStyle.push(styles.lessonIconLocked);
      shadowColor = "#111111";
    } else {
      const status =
        ((node.lessonProgress.status as string) ?? "NOT_STARTED").toUpperCase();
      const statusStyle =
        STATUS_STYLE_MAP[status] ?? STATUS_STYLE_MAP.NOT_STARTED;

      iconContainerStyle.push({
        backgroundColor: statusStyle.backgroundColor,
      });

      shadowColor = statusStyle.shadowColor;

      if (isActive) {
        iconContainerStyle.push(styles.lessonIconActive);
      }
    }

    return { iconContainerStyle, shadowColor };
  }, [isActive, isUnlocked, node.lessonProgress.status]);

  const handlePressIn = () => {
    if (!isUnlocked) return;
    translateY.value = withTiming(4, { duration: 100 });
    shadowOpacity.value = withTiming(0, { duration: 100 });
  };

  const handlePressOut = () => {
    if (!isUnlocked) return;
    translateY.value = withTiming(0, { duration: 150 });
    shadowOpacity.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    if (!isUnlocked) return;
    onPress?.(node.lessonProgress);
  };

  const animatedNodeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedShadowStyle = useAnimatedStyle(() => {
    return {
      opacity: shadowOpacity.value * 0.75, // Opacity mặc định 0.75, khi press sẽ về 0
    };
  });

  // Căn giữa node tại vị trí (x, y)
  // Container cần đủ lớn để chứa progress ring (94px) và shadow
  const containerPadding = 15; // Padding để chứa progress ring lớn hơn và shadow
  
  const nodeViewStyle = {
    position: "absolute" as const,
    left: node.x - (NODE_SIZE / 2 + containerPadding),
    top: node.y - (NODE_SIZE / 2 + containerPadding),
    width: NODE_SIZE + containerPadding * 2,
    height: NODE_SIZE + containerPadding * 2 + 6, // Thêm 6px cho shadow
    zIndex: 10,
  };

  // Shadow style dựa trên trạng thái node - tạo hiệu ứng 3D
  const shadowStyle: ViewStyle = {
    position: "absolute",
    width: NODE_SIZE - 2, // Nhỏ hơn node một chút để tạo hiệu ứng tự nhiên
    height: NODE_SIZE - 2,
    borderRadius: (NODE_SIZE - 2) / 2,
    backgroundColor: style.shadowColor,
    top: containerPadding + 6, // Đẩy shadow xuống dưới để tạo hiệu ứng 3D
    left: containerPadding + 1, // Căn giữa với node (vì width nhỏ hơn 2px)
    zIndex: 8,
  };

  // Logic Progress Ring - luôn hiển thị cho tất cả các node, chia thành 3 đoạn
  // Tăng kích thước để bao phủ cả shadow (shadow có offset 6px xuống dưới)
  const showProgress = true; // Luôn hiển thị progress ring cho tất cả bài học
  const progress = Math.max(0, Math.min(100, progressPercentage)) / 100;
  const progressColor = "#a3e635";
  const progressSize = NODE_SIZE + 20; // Tăng từ 10 lên 24 để bao phủ cả shadow (shadow offset 6px + margin)
  const strokeWidth = 7; // Tăng độ dày của progress ring
  const radius = (progressSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const segmentLength = circumference / 3; // Mỗi đoạn chiếm 1/3 chu vi
  const segmentFillLength = segmentLength * 0.85; // 85% đoạn được fill, 15% là khoảng cách
  const segmentGapLength = segmentLength * 0.15; // Khoảng cách giữa các đoạn
  
  // Tính toán progress cho từng đoạn (3 đoạn)
  const segmentProgress = progress * 3; // 0-3: tổng số đoạn đã hoàn thành
  const filledSegments = Math.floor(segmentProgress); // Số đoạn đã fill hoàn toàn (0, 1, 2, hoặc 3)
  const partialSegmentProgress = Math.max(0, Math.min(1, segmentProgress - filledSegments)); // Tiến độ của đoạn đang fill (0-1)
  
  // Tính toán strokeDasharray và strokeDashoffset cho progress
  let progressDashArray = "";
  
  if (filledSegments >= 3 || progress >= 1) {
    // Fill cả 3 đoạn (100%)
    progressDashArray = `${segmentFillLength} ${segmentGapLength} ${segmentFillLength} ${segmentGapLength} ${segmentFillLength} ${circumference}`;
  } else if (filledSegments === 2) {
    // Fill 2 đoạn + phần đoạn 3 (66-99%)
    const partialLength = segmentFillLength * partialSegmentProgress;
    progressDashArray = `${segmentFillLength} ${segmentGapLength} ${segmentFillLength} ${segmentGapLength} ${partialLength} ${circumference}`;
  } else if (filledSegments === 1) {
    // Fill 1 đoạn + phần đoạn 2 (33-65%)
    const partialLength = segmentFillLength * partialSegmentProgress;
    progressDashArray = `${segmentFillLength} ${segmentGapLength} ${partialLength} ${circumference}`;
  } else if (partialSegmentProgress > 0) {
    // Chỉ fill phần đoạn 1 (0-32%)
    const partialLength = segmentFillLength * partialSegmentProgress;
    progressDashArray = `${partialLength} ${circumference}`;
  }

  return (
    <View style={nodeViewStyle}>
      {/* Shadow Layer (tạo hiệu ứng 3D) */}
      {isUnlocked && (
        <Animated.View style={[shadowStyle, animatedShadowStyle]} />
      )}

      {/* Progress Ring (Luôn hiển thị cho tất cả các node, chia thành 3 đoạn) - Đặt ngoài để không bị clip và không di chuyển khi press */}
      {showProgress && (
        <View
          style={{
            position: "absolute",
            top: containerPadding - 8, // Căn giữa với node và shadow (điều chỉnh để bao phủ shadow)
            left: containerPadding - 10,
            zIndex: 10,
            pointerEvents: "none", // Không chặn touch events
          }}
        >
          <Svg
            height={progressSize}
            width={progressSize}
            style={styles.progressRing}
          >
          {/* Background circle - chia thành 3 đoạn với khoảng cách */}
          <Circle
            stroke="#d6d3c7"
            fill="none"
            cx={progressSize / 2}
            cy={progressSize / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${segmentFillLength} ${segmentGapLength}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${progressSize / 2} ${progressSize / 2})`}
          />
          
          {/* Progress circle - hiển thị progress dựa trên phần trăm hoàn thành */}
          {progressDashArray && (
            <Circle
              stroke={progressColor}
              fill="none"
              cx={progressSize / 2}
              cy={progressSize / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={progressDashArray}
              strokeLinecap="round"
              transform={`rotate(-90 ${progressSize / 2} ${progressSize / 2})`}
            />
          )}
        </Svg>
        </View>
      )}

      <Animated.View
        style={[
          animatedNodeStyle,
          {
            position: "absolute",
            top: containerPadding,
            left: containerPadding,
            width: NODE_SIZE,
            height: NODE_SIZE,
            borderRadius: NODE_SIZE / 2, // Bo tròn
            overflow: "hidden", // Clip nội dung
            zIndex: 11, // Nằm trên progress ring
          },
        ]}
      >
        <Pressable
          style={styles.lessonContainer}
          disabled={!isUnlocked}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
        >
          {/* Node Icon */}
          <View style={[...style.iconContainerStyle, { zIndex: 12 }]}>
            <Image
              source={node.iconSource}
              style={styles.lessonStatusImage}
              contentFit="contain"
            />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

// Helper function để detect và convert source cũ (backward compatibility)
const normalizeDuoSource = (source: any): DuoSource => {
  // Nếu đã là DuoSource format mới
  if (source && typeof source === "object" && "type" in source) {
    return source as DuoSource;
  }
  
  // Auto-detect: nếu là string hoặc có uri -> image, ngược lại -> lottie
  if (typeof source === "string" || (source && typeof source === "object" && "uri" in source)) {
    return { type: "image", source };
  }
  
  // Mặc định là Lottie (require() hoặc object khác)
  return { type: "lottie", source };
};

// --- Component Duo Động ---
const DynamicDuo: React.FC<{
  lessonData: LessonNode[];
  duoImages: DuoSource[];
}> = ({ lessonData, duoImages }) => {
  if (duoImages.length === 0) return null;

  // Tính toán các node mà Duo sẽ xuất hiện (peak nodes: index 2, 6, 10...)
  // Peak nodes là các node có indexInCycle === 2 hoặc === 6 trong chu kỳ 8
  const duoNodes = lessonData.filter((_, index) => {
    const indexInCycle = index % CYCLE_LENGTH;
    return indexInCycle === PEAK_NODE_INDEX || indexInCycle === PEAK_NODE_INDEX + HALF_CYCLE_NODES;
  });

  return (
    <>
      {duoNodes.map((duoNode, index) => {
        // Chỉ hiển thị Duo nếu có đủ animation cho peak node này
        if (index >= duoImages.length) {
          return null;
        }

        let duoX: number;
        let duoY: number;
        // Lấy source (đã được normalize trong LessonMap)
        const duoSource = duoImages[index];
        let duoTransform: { scaleX: number };

        // Logic định vị Duo dựa trên hướng cong (curveSide)

        // Nếu đường cong uốn sang PHẢI (Node 3), Duo đứng bên TRÁI và nhìn sang PHẢI
        if (duoNode.curveSide === "right") {
          duoX = duoNode.x - NODE_SIZE / 2 - DUO_OFFSET;
          duoTransform = { scaleX: -1 };
        }
        // Nếu đường cong uốn sang TRÁI (Node 7), Duo đứng bên PHẢI và nhìn sang TRÁI
        else {
          duoX = duoNode.x + NODE_SIZE / 2 + DUO_OFFSET;
          duoTransform = { scaleX: 1 };
        }

        // Điều chỉnh vị trí Y để Duo nằm cạnh node
        duoY = duoNode.y - DUO_IMAGE_SIZE / 2 + DUO_FIXED_Y_OFFSET;

        // Vị trí cuối cùng của Duo (căn giữa animation)
        const DUO_FINAL_POSITION = {
          left: duoX - DUO_IMAGE_SIZE / 2,
          top: duoY,
        };

        return (
          <View
            key={`duo-${duoNode.id}`}
            style={[styles.duoPlaceholder, DUO_FINAL_POSITION, {
              width: DUO_IMAGE_SIZE,
              height: DUO_IMAGE_SIZE,
              borderRadius: DUO_IMAGE_SIZE / 2, // Bo tròn hoàn toàn
              overflow: "hidden",
              aspectRatio: 1, // Đảm bảo hình vuông
            }]}
          >
            {duoSource.type === "lottie" ? (
              <View
                style={{
                  width: DUO_IMAGE_SIZE,
                  height: DUO_IMAGE_SIZE,
                  borderRadius: DUO_IMAGE_SIZE / 2,
                  overflow: "hidden",
                  justifyContent: "center",
                  alignItems: "center",
                  aspectRatio: 1, // Đảm bảo hình vuông
                }}
              >
                <LottieAnimation
                  source={duoSource.source}
                  autoPlay
                  loop
                  width={DUO_IMAGE_SIZE}
                  height={DUO_IMAGE_SIZE}
                  style={{
                    transform: [duoTransform],
                    maxWidth: DUO_IMAGE_SIZE,
                    maxHeight: DUO_IMAGE_SIZE,
                    width: DUO_IMAGE_SIZE,
                    height: DUO_IMAGE_SIZE,
                    aspectRatio: 1, // Đảm bảo hình vuông
                  }}
                />
              </View>
            ) : (
              <Image
                source={duoSource.source}
                style={[
                  {
                    width: DUO_IMAGE_SIZE,
                    height: DUO_IMAGE_SIZE,
                    maxWidth: DUO_IMAGE_SIZE,
                    maxHeight: DUO_IMAGE_SIZE,
                    borderRadius: DUO_IMAGE_SIZE / 2,
                    aspectRatio: 1, // Đảm bảo hình vuông
                    transform: [duoTransform],
                  },
                ]}
                contentFit="contain"
              />
            )}
          </View>
        );
      })}
    </>
  );
};
// --- End Component Duo Động ---

export default function LessonMap({
  lessons,
  duoImages = [],
  onLessonPress,
  screenWidth = SCREEN_WIDTH,
}: LessonMapProps) {
  // Convert lessons thành nodes với tính toán vị trí
  const lessonNodes = useMemo(
    () => convertLessonsToNodes(lessons, screenWidth),
    [lessons, screenWidth]
  );

  // Normalize duoImages để hỗ trợ backward compatibility
  const normalizedDuoImages = useMemo(() => {
    return duoImages.map((source) => normalizeDuoSource(source));
  }, [duoImages]);

  // Tính toán chiều cao ScrollView để cuộn được hết các node
  const contentHeight =
    lessonNodes.length > 0
      ? lessonNodes[lessonNodes.length - 1].y + NODE_VERTICAL_SPACING + 50
      : 600;

  return (
    <View style={styles.container}>
      {/* ScrollView để cuộn bản đồ bài học */}
      <ScrollView contentContainerStyle={{ height: contentHeight }}>
        {/* Render các Nodes Bài học */}
        {lessonNodes.map((node) => (
          <LessonNodeComponent
            key={`lesson-${node.lessonId}-${node.id}`}
            node={node}
            onPress={onLessonPress}
          />
        ))}

        {/* Linh vật Duo (vị trí động và hướng nhìn động) */}
        {normalizedDuoImages.length > 0 && (
          <DynamicDuo lessonData={lessonNodes} duoImages={normalizedDuoImages} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  lessonContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: NODE_SIZE, // NODE_SIZE
    height: NODE_SIZE, // NODE_SIZE
    borderRadius: NODE_SIZE / 2, // NODE_SIZE / 2 - Bo tròn
    overflow: "hidden",
  },
  progressRing: {
    // Position, top, left, zIndex được set inline để căn giữa với node
  },
  baseIconContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  lessonIconWrapper: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    overflow: "hidden",
  },
  lessonIconActive: {
    transform: [{ scale: 1.03 }],
  },
  lessonIconLocked: {
    backgroundColor: "#1f2937",
  },
  lessonStatusImage: {
    width: NODE_SIZE - 6,
    height: NODE_SIZE - 6,
  },
  // --- Duo/Linh vật ---
  duoPlaceholder: {
    position: "absolute",
    zIndex: 100,
    // Kích thước được set inline để đồng bộ với DUO_IMAGE_SIZE
  },
});

