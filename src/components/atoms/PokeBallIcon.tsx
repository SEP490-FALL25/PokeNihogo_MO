import React from 'react';
import { View } from 'react-native';
import Animated, { SharedValue, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

// Tạo các Animated components từ react-native-svg
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface AnimatedPokeballIconProps {
    size?: number;
    isOpen: SharedValue<number>; // SharedValue để điều khiển trạng thái mở (0 = đóng, 1 = mở)
    color?: string; // Màu sắc cho hiệu ứng hào quang/ánh sáng
}

const AnimatedPokeballIcon = ({ size = 100, isOpen, color = "#facc15" }: AnimatedPokeballIconProps) => {
    const half = size / 2;
    const strokeWidth = size * 0.07; // Độ dày của đường viền
    const separationDistance = size * 0.2; // Khoảng cách nửa trên/dưới tách ra

    // Hiệu ứng cho nửa trên (di chuyển lên)
    const animatedPropsTopPath = useAnimatedProps(() => {
        const translateY = -separationDistance * isOpen.value; // Dịch chuyển lên khi isOpen tăng
        return {
            transform: `translate(0, ${translateY})`
        };
    });

    // Hiệu ứng cho nửa dưới (di chuyển xuống)
    const animatedPropsBottomPath = useAnimatedProps(() => {
        const translateY = separationDistance * isOpen.value; // Dịch chuyển xuống khi isOpen tăng
        return {
            transform: `translate(0, ${translateY})`
        };
    });

    // Hiệu ứng cho đường kẻ giữa (di chuyển lên/xuống và mờ dần)
    const animatedPropsMidRect = useAnimatedProps(() => {
        const translateY = (separationDistance / 2) * isOpen.value; // Dịch chuyển nhẹ lên/xuống
        const opacity = 1 - isOpen.value; // Mờ dần khi mở
        return {
            transform: `translate(0, ${translateY})`,
            opacity: opacity
        };
    });

    // Hiệu ứng cho vòng tròn ngoài cùng của nút giữa (mờ dần)
    const animatedPropsCenterOuterCircle = useAnimatedProps(() => {
        const opacity = 1 - isOpen.value; // Mờ dần khi mở
        return { opacity: opacity };
    });

    // Hiệu ứng cho vòng tròn trong cùng của nút giữa (mờ dần)
    const animatedPropsCenterInnerCircle = useAnimatedProps(() => {
        const opacity = 1 - isOpen.value; // Mờ dần khi mở
        return { opacity: opacity };
    });

    // Hiệu ứng hào quang/ánh sáng khi mở
    const animatedPropsGlow = useAnimatedProps(() => {
        const scale = 1 + isOpen.value * 2; // Tăng kích thước hào quang
        const opacity = isOpen.value * 0.8; // Xuất hiện khi mở
        return {
            transform: `scale(${scale})`,
            opacity: opacity,
            // Đặt màu hào quang dựa trên prop color
            fill: color // Sử dụng màu được truyền vào
        };
    });

    return (
        <View style={{ width: size, height: size }}>
            <Svg height={size} width={size} viewBox="0 0 100 100">
                <Defs>
                    {/* Thêm hiệu ứng bóng cho nút giữa */}
                    <RadialGradient
                        id="grad"
                        cx="50%"
                        cy="50%"
                        rx="50%"
                        ry="50%"
                        fx="50%"
                        fy="50%"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0%" stopColor="#fff" stopOpacity="1" />
                        <Stop offset="60%" stopColor="#eee" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#aaa" stopOpacity="1" />
                    </RadialGradient>
                </Defs>

                {/* Hào quang khi mở */}
                <AnimatedCircle
                    cx={half}
                    cy={half}
                    r={half * 0.7} // Kích thước ban đầu của hào quang
                    fill={color}
                    animatedProps={animatedPropsGlow}
                />

                {/* Nửa màu đỏ trên */}
                <AnimatedPath
                    animatedProps={animatedPropsTopPath}
                    d={`M 5 50 A 45 45 0 0 1 95 50`}
                    fill="#e74c3c"
                />

                {/* Nửa màu trắng dưới */}
                <AnimatedPath
                    animatedProps={animatedPropsBottomPath}
                    d={`M 5 50 A 45 45 0 0 0 95 50`}
                    fill="#fff"
                />

                {/* Viền đen bên ngoài - Không cần animation trực tiếp,
                    vì nó sẽ được bọc bởi Animated.View bên ngoài nếu muốn di chuyển tổng thể
                */}
                <Circle
                    cx={half}
                    cy={half}
                    r={half - strokeWidth / 2}
                    fill="none"
                    stroke="#2c3e50"
                    strokeWidth={strokeWidth}
                />

                {/* Đường kẻ đen ở giữa */}
                <AnimatedRect
                    animatedProps={animatedPropsMidRect}
                    x="0"
                    y={half - strokeWidth / 2}
                    width={size}
                    height={strokeWidth}
                    fill="#2c3e50"
                />

                {/* Nút tròn ở giữa (viền ngoài) */}
                <AnimatedCircle
                    animatedProps={animatedPropsCenterOuterCircle}
                    cx={half}
                    cy={half}
                    r={size * 0.18}
                    fill="#2c3e50"
                />

                {/* Nút tròn ở giữa (lòng trong) */}
                <AnimatedCircle
                    animatedProps={animatedPropsCenterInnerCircle}
                    cx={half}
                    cy={half}
                    r={size * 0.12}
                    fill="url(#grad)"
                    stroke="#2c3e50"
                    strokeWidth={size * 0.02}
                />
            </Svg>
        </View>
    );
};

export default AnimatedPokeballIcon;