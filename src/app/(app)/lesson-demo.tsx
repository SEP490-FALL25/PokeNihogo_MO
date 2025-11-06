import { FontAwesome5 } from "@expo/vector-icons";
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
import { SafeAreaView } from "react-native-safe-area-context";
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
const TOTAL_LESSONS = 20; // Tổng số bài học

const CENTER_X = SCREEN_WIDTH / 2; // Tâm màn hình
const DUO_OFFSET = NODE_SIZE / 2 + 30; // Khoảng cách Duo so với cạnh node
const DUO_IMAGE_SIZE = 80;
const DUO_FIXED_Y_OFFSET = 0; // Điều chỉnh Duo lên trên một chút

// MẢNG CHỨA CÁC URL ẢNH LINH VẬT CỦA BẠN (Dùng ảnh Duo làm ví dụ)
const DUO_IMAGE_LIST = [
  "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2016_8_16_636069648836257156_thuat-ngu-trong-pokemon-go-cover.jpg",
  "https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/147C0/production/_132740938_indeximage.jpg",
];

// Duo sẽ xuất hiện ở node peak của mỗi đoạn: Node 3, Node 7, Node 11, Node 15, ...
const DUO_NODE_IDS: number[] = Array.from(
  { length: Math.ceil(TOTAL_LESSONS / 4) },
  (_, i) => 3 + i * 4
).filter((id) => id <= TOTAL_LESSONS);

// Định nghĩa kiểu dữ liệu cho node bài học
export type LessonNode = {
  id: number;
  type: "lesson";
  icon: string;
  x: number;
  y: number;
  isCompleted: boolean;
  isActive: boolean;
  isUnlocked: boolean;
  curveSide: "left" | "right";
};

/**
 * Tự động tạo dữ liệu bài học theo đường cong tuyến tính liên tục (không bị gián đoạn ở tâm).
 */
const generateLessonData = (
  total: number,
  screenWidth: number
): LessonNode[] => {
  const data: LessonNode[] = [];
  const middleX = screenWidth / 2;
  const HALF_CYCLE_SEGMENTS = HALF_CYCLE_NODES; // 4 segments: (0-1, 1-2, 2-3, 3-4)

  for (let i = 0; i < total; i++) {
    const y = NODE_SIZE / 2 + 30 + i * NODE_VERTICAL_SPACING;

    // Index trong chu kỳ 8 bước: 0, 1, 2, 3, 4, 5, 6, 7
    const indexInCycle = i % CYCLE_LENGTH;

    let normalizedOffset: number; // Tỷ lệ từ 0 (tâm) đến 1 (peak)
    let sign = 1; // 1: Cong phải, -1: Cong trái
    let curveSide: "left" | "right";

    // Tính toán độ lệch cho từng node trong chu kỳ 8 bước
    // Bắt đầu từ 0 (tâm), Peak ở 2 (Node 3), Tâm ở 4 (Node 5), Peak ngược ở 6 (Node 7), Tâm ở 0 (Node 9)
    // Tỷ lệ cho mỗi bước là 0.5 (CURVE_AMPLITUDE / PEAK_NODE_INDEX)

    if (indexInCycle <= PEAK_NODE_INDEX) {
      // Giai đoạn 1 (0, 1, 2): Tăng từ 0 đến +60 (Node 1 -> 3)
      normalizedOffset = indexInCycle / PEAK_NODE_INDEX;
      sign = 1;
    } else if (indexInCycle <= HALF_CYCLE_NODES) {
      // index <= 4
      // Giai đoạn 2 (2, 3, 4): Giảm từ +60 về 0 (Node 3 -> 5)
      normalizedOffset = 1 - (indexInCycle - PEAK_NODE_INDEX) / PEAK_NODE_INDEX;
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
        (indexInCycle - (HALF_CYCLE_NODES + PEAK_NODE_INDEX)) / PEAK_NODE_INDEX;
      sign = -1;
    }

    let offsetX = CURVE_AMPLITUDE * normalizedOffset * sign;
    curveSide = sign === 1 ? "right" : "left";

    const x = middleX + offsetX;

    data.push({
      id: i + 1,
      type: "lesson",
      icon: "star",
      x,
      y,
      isCompleted: i < 0,
      isActive: i === 0,
      isUnlocked: i <= 3,
      curveSide,
    });
  }

  return data;
};

// Component để render từng nút bài học
const LessonNodeComponent: React.FC<{ node: LessonNode }> = ({ node }) => {
  const { isActive, isUnlocked, id } = node;

  const style = useMemo(() => {
    let iconContainerStyle: ViewStyle[] = [styles.baseIconContainer];
    let iconColor = "#555";

    // Thay đổi icon cho node peak (node 3, 7, 11...)
    let iconName = "star";
    if ((id - 1) % 4 === 2) {
      iconName = "bolt";
    }

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

    return { iconContainerStyle, iconColor, iconName };
  }, [isActive, isUnlocked, id]);

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

  // Logic Progress Ring (Chỉ cho node Active)
  const progress = isActive ? 0.7 : 0;
  const progressColor = "#a3e635";
  const progressSize = NODE_SIZE + 10;
  const strokeWidth = 5;
  const radius = (progressSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 1) * circumference;

  return (
    <View style={nodeViewStyle}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.lessonContainer}
        disabled={!isUnlocked}
      >
        {/* Progress Ring (Chỉ hiển thị cho node Active) */}
        {isActive && (
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
            name={style.iconName}
            size={NODE_INNER_SIZE}
            color={style.iconColor}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

// --- Component Duo Động ---
const DynamicDuo: React.FC<{ lessonData: LessonNode[] }> = ({ lessonData }) => {
  // Lọc ra các node mà Duo sẽ xuất hiện (node 3, 7, 11...)
  // Node 3 (peak phải), Node 7 (peak trái)
  const duoNodes = lessonData.filter((node) => DUO_NODE_IDS.includes(node.id));

  return (
    <>
      {duoNodes.map((duoNode, index) => {
        // Chỉ hiển thị Duo nếu có đủ ảnh cho peak node này
        // Ví dụ: nếu có 3 ảnh, chỉ hiển thị đến peak node thứ 3 (index 0, 1, 2)
        if (index >= DUO_IMAGE_LIST.length) {
          return null;
        }

        let duoX: number;
        let duoY: number;
        // Lấy ảnh trực tiếp theo index (không dùng modulo để lặp lại)
        const duoImageSource = DUO_IMAGE_LIST[index];
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

export default function LessonMapScreen() {
  // Sử dụng useMemo để tránh re-calculate dữ liệu khi không cần thiết
  const LESSON_DATA = useMemo(
    () => generateLessonData(TOTAL_LESSONS, SCREEN_WIDTH),
    [SCREEN_WIDTH]
  );

  // Tính toán chiều cao ScrollView để cuộn được hết các node
  const contentHeight =
    LESSON_DATA.length > 0
      ? LESSON_DATA[LESSON_DATA.length - 1].y + NODE_VERTICAL_SPACING + 50
      : 600;

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        {/* ScrollView để cuộn bản đồ bài học */}
        <ScrollView contentContainerStyle={{ height: contentHeight }}>
          {/* Render các Nodes Bài học */}
          {LESSON_DATA.map((node) => (
            <LessonNodeComponent key={node.id} node={node} />
          ))}

          {/* Linh vật Duo (vị trí động và hướng nhìn động) */}
          {DUO_IMAGE_LIST.length > 0 && <DynamicDuo lessonData={LESSON_DATA} />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
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
