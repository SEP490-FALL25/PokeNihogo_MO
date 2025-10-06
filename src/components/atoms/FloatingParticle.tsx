import React, { useEffect } from 'react';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface FloatingParticleProps {
    color?: string;
    size?: number;
    delay?: number;
    duration?: number;
    startX?: number;
    startY?: number;
}

export default function FloatingParticle({
    color = '#00FFFF',
    size = 5,
    delay = 0,
    duration = 3000,
    startX = 0,
    startY = 0,
}: FloatingParticleProps) {
    'worklet';
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(-80, { duration: duration, easing: Easing.out(Easing.quad) }),
                -1
            )
        );

        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(0.8, { duration: duration * 0.3 }),
                    withTiming(0, { duration: duration * 0.7, easing: Easing.in(Easing.quad) })
                ),
                -1
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View
            style={[
                animatedStyle,
                {
                    position: 'absolute',
                    left: startX,
                    top: startY,
                    width: size,
                    height: size,
                    backgroundColor: color,
                    borderRadius: size / 2,
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 5,
                    elevation: 10,
                },
            ]}
        />
    );
}