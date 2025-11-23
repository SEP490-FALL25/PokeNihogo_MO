import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

export interface LottieAnimationProps {
  /**
   * Source của animation - có thể là:
   * - require('./path/to/animation.json') cho file JSON
   * - require('./path/to/animation.lottie') cho file .lottie
   * - URL string cho animation từ internet
   */
  source: any;
  /**
   * Tự động phát khi component mount
   */
  autoPlay?: boolean;
  /**
   * Lặp lại animation
   */
  loop?: boolean;
  /**
   * Tốc độ phát (1 = bình thường, 2 = nhanh gấp đôi, 0.5 = chậm một nửa)
   */
  speed?: number;
  /**
   * Style cho container
   */
  style?: ViewStyle;
  /**
   * Chiều rộng của animation
   */
  width?: number;
  /**
   * Chiều cao của animation
   */
  height?: number;
  /**
   * Callback khi animation hoàn thành (chỉ khi loop = false)
   */
  onAnimationFinish?: () => void;
}

/**
 * Component để hiển thị Lottie animation
 * 
 * @example
 * // Sử dụng file JSON local
 * <LottieAnimation
 *   source={require('../../assets/animations/loading.json')}
 *   autoPlay
 *   loop
 *   width={200}
 *   height={200}
 * />
 * 
 * @example
 * // Sử dụng URL từ LottieFiles
 * <LottieAnimation
 *   source="https://lottie.host/embed/abc123.json"
 *   autoPlay
 *   loop
 * />
 */
export default function LottieAnimation({
  source,
  autoPlay = true,
  loop = true,
  speed = 1,
  style,
  width,
  height,
  onAnimationFinish,
}: LottieAnimationProps) {
  return (
    <View style={[styles.container, style]}>
      <LottieView
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        style={[
          width && height ? { width, height } : styles.defaultSize,
          style,
        ]}
        onAnimationFinish={onAnimationFinish}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  defaultSize: {
    width: 200,
    height: 200,
  },
});

