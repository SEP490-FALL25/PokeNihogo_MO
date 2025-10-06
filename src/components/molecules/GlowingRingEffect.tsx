import FloatingParticle from '@components/atoms/FloatingParticle';
import GlowingRing from '@components/atoms/GlowingRing';
import React, { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

interface GunnyEffectProps {
    color?: string;
    ringSize?: number;
    particleCount?: number;
}

export default function GlowingRingEffect({
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
                { rotateX: '80deg' },
                { rotate: `${rotation.value}deg` },
            ],
        };
    });

    const particles = Array.from({ length: particleCount });

    return (
        <Animated.View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
            {/* --- Glowing Ring --- */}
            <Animated.View style={animatedContainerStyle}>
                <GlowingRing size={ringSize} color={color} />
            </Animated.View>

            {/* --- Floating Particles --- */}
            {particles.map((_, index) => {
                const angle = Math.random() * 360;
                const radius = (ringSize / 2) * 0.7 * Math.random() + (ringSize / 2) * 0.1;
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
    );
}