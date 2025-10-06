// src/components/molecules/GunnyEffect.tsx
import FloatingParticle from '@components/atoms/FloatingParticle';
import GlowingRing from '@components/atoms/GlowingRing';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

interface GunnyEffectProps {
    color?: string;
    ringSize?: number;
    particleCount?: number;
}

export default function GunnyEffect({
    color = '#00FFFF',
    ringSize = 220,
    particleCount = 15,
}: GunnyEffectProps) {
    const rotation = useSharedValue(0);

    useEffect(() => {
        'worklet';
        rotation.value = withRepeat(
            withTiming(360, { duration: 10000, easing: Easing.linear }),
            -1
        );
    }, []);

    const animatedContainerStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            transform: [
                { perspective: 400 },
                { rotateX: '80deg' }, // Hiệu ứng nghiêng 3D
                { rotate: `${rotation.value}deg` }, // Hiệu ứng xoay tròn
            ],
        };
    });

    const particles = Array.from({ length: particleCount });

    return (
        // highlight-start
        // Tất cả các yếu tố hiệu ứng đều nằm trong Animated.View này
        <Animated.View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
            {/* 1. Vòng sáng - giờ đây nó sẽ xoay cùng với view cha */}
            <Animated.View style={animatedContainerStyle}>
                <GlowingRing size={ringSize} color={color} />
            </Animated.View>

            {/* 2. Các hạt ánh sáng - cũng sẽ xoay cùng với view cha */}
            {particles.map((_, index) => {
                // Tạo vị trí ngẫu nhiên BÊN TRONG vòng sáng
                const angle = Math.random() * 360;
                // Bán kính ngẫu nhiên, từ tâm ra gần mép
                const radius = (ringSize / 2) * 0.7 * Math.random() + (ringSize / 2) * 0.1;
                // Chuyển đổi tọa độ cực sang tọa độ Descartes
                const startX = ringSize / 2 + radius * Math.cos(angle * Math.PI / 180);
                const startY = ringSize / 2 + radius * Math.sin(angle * Math.PI / 180);

                return (
                    <FloatingParticle
                        key={index}
                        color={color}
                        delay={Math.random() * 3000}
                        startX={startX}
                        startY={startY}
                    />
                );
            })}
        </Animated.View>
        // highlight-end
    );
}