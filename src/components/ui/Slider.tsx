import React from "react";
import { View, ViewProps } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface SliderProps extends ViewProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  onValueChangeComplete?: (value: number[]) => void;
  disabled?: boolean;
}

// --- Constants ---
const THUMB_SIZE = 20;
const TRACK_HEIGHT = 4;
const THUMB_RADIUS = THUMB_SIZE / 2;

const Slider = React.forwardRef<View, SliderProps>(
  (
    {
      value,
      defaultValue = [0],
      min = 0,
      max = 100,
      step = 1,
      onValueChange,
      onValueChangeComplete,
      disabled = false,
      style,
      ...props
    },
    ref
  ) => {
    // --- Shared Values ---
    const containerWidthSv = useSharedValue(0);
    const isDragging = useSharedValue(false);

    // Khởi tạo progressSv với giá trị ban đầu, gọn hơn useEffect
    const initialProgress =
      ((value ?? defaultValue)[0] - min) / (max - min || 1);
    const progressSv = useSharedValue(
      Math.max(0, Math.min(1, initialProgress))
    );

    // --- Callbacks ---
    // Các hàm này sẽ được gọi từ UI thread thông qua runOnJS
    const notifyChange = (v: number[]) => {
      onValueChange?.(v);
    };

    const notifyChangeComplete = (v: number[]) => {
      onValueChangeComplete?.(v);
    };

    // --- Đồng bộ hóa với prop `value` từ bên ngoài ---
    // Sử dụng useAnimatedReaction để theo dõi sự thay đổi của `value` prop một cách hiệu quả
    useAnimatedReaction(
      () => value, // Theo dõi giá trị `value`
      (currentValue, previousValue) => {
        // Chỉ cập nhật nếu giá trị thực sự thay đổi và component không bị kéo
        if (
          currentValue !== previousValue &&
          currentValue !== undefined &&
          !isDragging.value
        ) {
          const v = currentValue[0] ?? min;
          const clamped = Math.max(min, Math.min(max, v));
          progressSv.value = withTiming((clamped - min) / (max - min || 1));
        }
      },
      [value, min, max, isDragging]
    );

    // --- Worklet: Logic tính toán chính ---
    // Hàm này chạy hoàn toàn trên UI thread để có hiệu năng cao nhất
    const updateProgress = (
      x: number,
      notify: boolean,
      isEndEvent: boolean
    ) => {
      "worklet";
      const width = containerWidthSv.value;
      if (width === 0) return;

      const availableWidth = Math.max(1, width - THUMB_SIZE);
      // Giới hạn toạ độ x trong phạm vi của thanh trượt
      const clampedX = Math.max(0, Math.min(availableWidth, x - THUMB_RADIUS));

      const rawProgress = clampedX / availableWidth;
      const rawValue = min + rawProgress * (max - min);

      // Làm tròn giá trị theo step
      const steppedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      const nextProgress = (clampedValue - min) / (max - min || 1);
      progressSv.value = nextProgress;

      // Gọi callback nếu cần
      if (notify) {
        runOnJS(notifyChange)([clampedValue]);
      }
      if (isEndEvent) {
        runOnJS(notifyChangeComplete)([clampedValue]);
      }
    };

    // --- Gestures ---
    const pan = Gesture.Pan()
      .enabled(!disabled)
      .onBegin(() => {
        isDragging.value = true;
      })
      .onUpdate((event) => {
        // Cập nhật trực tiếp, không dùng spring/timing để thumb bám theo ngón tay
        updateProgress(event.x, true, false);
      })
      .onEnd(() => {
        isDragging.value = false;
        // Lấy giá trị cuối cùng và gọi onValueChangeComplete
        const currentProgress = progressSv.value;
        const currentValue = min + currentProgress * (max - min);
        const finalValue = Math.round(currentValue / step) * step;
        runOnJS(notifyChangeComplete)([
          Math.max(min, Math.min(max, finalValue)),
        ]);
      });

    const tap = Gesture.Tap()
      .enabled(!disabled)
      .onEnd((event) => {
        // Khi nhấn, dùng withSpring để tạo hiệu ứng nhảy mượt mà
        progressSv.value = withSpring(progressSv.value);
        updateProgress(event.x, true, true);
      });

    // Kết hợp 2 gestures, ưu tiên Pan nếu cả 2 cùng được kích hoạt
    const composedGesture = Gesture.Exclusive(pan, tap);

    // --- Animated Styles ---
    const rangeStyle = useAnimatedStyle(() => {
      const width = containerWidthSv.value;
      const availableWidth = Math.max(0, width - THUMB_SIZE);
      const filledWidth = THUMB_RADIUS + progressSv.value * availableWidth;

      return {
        width: filledWidth,
      };
    });

    const thumbStyle = useAnimatedStyle(() => {
      const width = containerWidthSv.value;
      const availableWidth = Math.max(0, width - THUMB_SIZE);
      const translateX = progressSv.value * availableWidth;

      return {
        transform: [
          { translateX },
          // Phóng to thumb khi người dùng kéo
          { scale: withTiming(isDragging.value ? 1.2 : 1, { duration: 150 }) },
        ],
      };
    });

    return (
      // Cần GestureHandlerRootView ở root của app, nhưng để component này tự hoạt động, có thể bọc ở đây
      // <GestureHandlerRootView>
      <GestureDetector gesture={composedGesture}>
        <View
          ref={ref}
          style={[
            {
              height: THUMB_SIZE,
              justifyContent: "center",
              opacity: disabled ? 0.5 : 1,
            },
            style,
          ]}
          onLayout={(event) => {
            containerWidthSv.value = event.nativeEvent.layout.width;
          }}
          {...props}
        >
          {/* Track background */}
          <View
            style={{
              height: TRACK_HEIGHT,
              backgroundColor: "#e5e7eb",
              borderRadius: TRACK_HEIGHT / 2,
            }}
          />
          {/* Track filled range */}
          <Animated.View
            style={[
              {
                position: "absolute",
                left: 0,
                height: TRACK_HEIGHT,
                backgroundColor: "#3b82f6",
                borderRadius: TRACK_HEIGHT / 2,
              },
              rangeStyle,
            ]}
          />
          {/* Thumb */}
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0, // -(THUMB_SIZE - TRACK_HEIGHT) / 2 không cần thiết nếu container có height=THUMB_SIZE
                left: 0,
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                backgroundColor: "#ffffff",
                borderRadius: THUMB_RADIUS,
                borderWidth: 2,
                borderColor: "#3b82f6",},
              thumbStyle,
            ]}
          />
        </View>
      </GestureDetector>
      // </GestureHandlerRootView>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
export type { SliderProps };

