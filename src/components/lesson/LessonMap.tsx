import { FontAwesome5 } from "@expo/vector-icons";
import { LessonProgress } from "@models/lesson/lesson.common";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

// Lấy kích thước màn hình
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// --- CẤU HÌNH CHUNG ---
const NODE_SIZE = 70; // Kích thước node
const NODE_INNER_SIZE = 30; // Kích thước icon bên trong
const NODE_VERTICAL_SPACING = 120; // Khoảng cách dọc
const CURVE_AMPLITUDE = 90; // Biên độ cong (Độ lệch tối đa)

// ĐỊNH NGHĨA CHU KỲ MỚI (Mô hình tuyến tính liên tục: Node 1 -> 5 là nửa chu kỳ)
const HALF_CYCLE_NODES = 4; // Số bước (segments) từ Tâm đến Tâm (Node 1 -> 5)
const PEAK_NODE_INDEX = 2; // Node thứ 3 là đỉnh (index 2)
const CYCLE_LENGTH = 8; // Tổng số bước (Node 1 -> Node 9)

const DUO_OFFSET = NODE_SIZE / 2 + 30; // Khoảng cách Duo so với cạnh node
const DUO_IMAGE_SIZE = 80;
const DUO_FIXED_Y_OFFSET = 0; // Điều chỉnh Duo lên trên một chút

// Định nghĩa kiểu dữ liệu cho node bài học
export type LessonNode = {
  id: number;
  lessonId: number;
  type: "lesson";
  icon: string;
  x: number;
  y: number;
  isCompleted: boolean;
  isActive: boolean;
  isUnlocked: boolean;
  curveSide: "left" | "right";
  progressPercentage: number;
  lessonProgress: LessonProgress; // Lưu thông tin gốc
};

export interface LessonMapProps {
  lessons: LessonProgress[];
  duoImages?: string[]; // Danh sách ảnh Duo (optional)
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

    // Logic xác định trạng thái
    const isCompleted = lesson.status === "COMPLETED";
    const isActive = i === activeIndex;
    // Unlock: bài học đầu tiên hoặc bài học trước đã completed
    const isUnlocked =
      i === 0 || lessons[i - 1]?.status === "COMPLETED" || isActive;

    // Icon dựa trên vị trí peak (node 3, 7, 11...)
    let icon = "star";
    if (i % 4 === 2) {
      icon = "bolt";
    }

    data.push({
      id: lesson.id,
      lessonId: lesson.lessonId,
      type: "lesson",
      icon,
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
  const { isActive, isUnlocked, id, progressPercentage } = node;

  const style = useMemo(() => {
    let iconContainerStyle: ViewStyle[] = [styles.baseIconContainer];
    let iconColor = "#555";

    if (isActive) {
      iconContainerStyle.push(styles.lessonIconActive);
      iconColor = "#fff";
    } else if (isUnlocked) {
      iconContainerStyle.push(styles.lessonIconUnlocked);
      iconColor = "#888";
    } else {
      iconContainerStyle.push(styles.lessonIconLocked);
      iconColor = "#444";
    }

    return { iconContainerStyle, iconColor };
  }, [isActive, isUnlocked]);

  // Căn giữa node tại vị trí (x, y)
  const nodeViewStyle = {
    position: "absolute" as const,
    left: node.x - NODE_SIZE / 2,
    top: node.y - NODE_SIZE / 2,
    zIndex: 10,
  };

  const IconContainerStyle = [
    { width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2 },
    ...style.iconContainerStyle,
    { justifyContent: "center" as const, alignItems: "center" as const },
  ];

  // Logic Progress Ring (Chỉ cho node Active hoặc IN_PROGRESS)
  const showProgress = isActive && progressPercentage > 0;
  const progress = progressPercentage / 100;
  const progressColor = "#a3e635";
  const progressSize = NODE_SIZE + 10;
  const strokeWidth = 5;
  const radius = (progressSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={nodeViewStyle}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.lessonContainer}
        disabled={!isUnlocked}
        onPress={() => onPress?.(node.lessonProgress)}
      >
        {/* Progress Ring (Chỉ hiển thị cho node Active với progress > 0) */}
        {showProgress && (
          <Svg
            height={progressSize}
            width={progressSize}
            style={styles.progressRing}
          >
            <Circle
              stroke="#2e2e2e"
              fill="none"
              cx={progressSize / 2}
              cy={progressSize / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke={progressColor}
              fill="none"
              cx={progressSize / 2}
              cy={progressSize / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${progressSize / 2} ${progressSize / 2})`}
            />
          </Svg>
        )}

        {/* Node Icon */}
        <View style={IconContainerStyle}>
          <FontAwesome5
            name={node.icon}
            size={NODE_INNER_SIZE}
            color={style.iconColor}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

// --- Component Duo Động ---
const DynamicDuo: React.FC<{
  lessonData: LessonNode[];
  duoImages: string[];
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
        // Chỉ hiển thị Duo nếu có đủ ảnh cho peak node này
        if (index >= duoImages.length) {
          return null;
        }

        let duoX: number;
        let duoY: number;
        // Lấy ảnh trực tiếp theo index (không dùng modulo để lặp lại)
        const duoImageSource = duoImages[index];
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

        // Vị trí cuối cùng của Duo (căn giữa hình ảnh)
        const DUO_FINAL_POSITION = {
          left: duoX - DUO_IMAGE_SIZE / 2,
          top: duoY,
        };

        return (
          <View
            key={`duo-${duoNode.id}`}
            style={[styles.duoPlaceholder, DUO_FINAL_POSITION]}
          >
            <Image
              source={duoImageSource}
              style={[styles.duoImage, { transform: [duoTransform] }]}
              contentFit="contain"
            />
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
        {duoImages.length > 0 && (
          <DynamicDuo lessonData={lessonNodes} duoImages={duoImages} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  lessonContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  progressRing: {
    position: "absolute",
    transform: [{ rotate: "-90deg" }],
    zIndex: 9,
  },
  baseIconContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  // --- Node đang Active (Node BẮT ĐẦU) ---
  lessonIconActive: {
    backgroundColor: "#6bbf47",
    borderWidth: 4,
    borderColor: "#a3e635",
  },
  // --- Node đã mở khóa (nhưng chưa Active) ---
  lessonIconUnlocked: {
    backgroundColor: "#444",
    borderWidth: 0,
  },
  // --- Node bị khóa ---
  lessonIconLocked: {
    backgroundColor: "#333",
    borderWidth: 0,
  },
  // --- Duo/Linh vật ---
  duoPlaceholder: {
    position: "absolute",
    zIndex: 100,
  },
  duoImage: {
    width: DUO_IMAGE_SIZE,
    height: DUO_IMAGE_SIZE,
  },
});

