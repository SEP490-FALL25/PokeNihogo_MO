// src/components/organisms/GachaAnimation.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Star } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { RARITY } from '../../../mock-data/gacha';

cssInterop(LinearGradient, { className: 'style' });
const TWLinearGradient = LinearGradient as unknown as React.ComponentType<React.ComponentProps<typeof LinearGradient> & { className?: string }>;

const RARITY_GLOW_COLORS = {
    [RARITY.COMMON]: '#4fd1c5',
    [RARITY.RARE]: '#a78bfa',
    [RARITY.LEGENDARY]: '#facc15',
};

// --- Giai đoạn 1: Sao băng ---
const ShootingStar = ({ highestRarity, onComplete }: { highestRarity: number, onComplete: () => void }) => {
    // ... (Component này không thay đổi, giữ nguyên)
};

// highlight-start
// --- Component con mới: Hạt ánh sáng lấp lánh ---
const FloatingSparkle = ({ color, delay, duration, size, startX, startY }: { color: string, delay: number, duration: number, size: number, startX: number, startY: number }) => {
    'worklet';
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(delay, withRepeat(withSequence(
            withTiming(1, { duration: duration * 0.4 }),
            withTiming(0, { duration: duration * 0.6 })
        ), -1));
        translateY.value = withDelay(delay, withRepeat(
            withTiming(-100, { duration, easing: Easing.out(Easing.quad) }),
            -1
        ));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[animatedStyle, { position: 'absolute', left: startX, top: startY, width: size, height: size, borderRadius: size / 2, backgroundColor: color }]} />
    );
};
// highlight-end

// Giai đoạn 2: Tiết lộ từng Pokémon (ĐÃ NÂNG CẤP)
const RevealItem = ({ item, onNext }: { item: any, onNext: () => void }) => {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);
    const silhouetteOpacity = useSharedValue(1);
    // highlight-start
    const pulse = useSharedValue(1); // Cho hiệu ứng "thở" của 5 sao
    // highlight-end

    const colors = RARITY_GLOW_COLORS[item.rarity];
    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;

    useEffect(() => {
        // Reset và chạy animation
        opacity.value = 0; scale.value = 0.8; silhouetteOpacity.value = 1;
        opacity.value = withTiming(1, { duration: 300 });
        scale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) });
        silhouetteOpacity.value = withDelay(500, withTiming(0, { duration: 400 }));

        // highlight-start
        // Chạy animation "thở" nếu là 5 sao
        if (item.rarity === RARITY.LEGENDARY) {
            pulse.value = withRepeat(withSequence(
                withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })
            ), -1, true);
        } else {
            pulse.value = 1; // Giữ nguyên nếu không phải 5 sao
        }
        // highlight-end
    }, [item]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));
    // highlight-start
    const pulseAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));
    // highlight-end

    // Tạo các hạt ánh sáng cho 4-5 sao
    const particles = useMemo(() => {
        if (item.rarity < RARITY.RARE) return [];
        const count = item.rarity === RARITY.RARE ? 15 : 30; // 4 sao có 15 hạt, 5 sao có 30 hạt
        return Array.from({ length: count }).map(() => ({
            delay: Math.random() * 2000,
            duration: 2000 + Math.random() * 2000,
            size: 2 + Math.random() * 4,
            startX: Math.random() * 100 + '%',
            startY: Math.random() * 20 + 80 + '%',
        }));
    }, [item.rarity]);

    return (
        <TouchableOpacity activeOpacity={1} onPress={onNext} className="absolute inset-0 items-center justify-center">
            <TWLinearGradient colors={[colors, '#0f172a']} className="absolute inset-0" />

            {/* highlight-start */}
            {/* Hào quang lớn phía sau (có hiệu ứng thở cho 5 sao) */}
            <Animated.View style={[{ ...StyleSheet.absoluteFillObject }, pulseAnimatedStyle]}>
                <Sparkles size={250} color={colors} style={{ opacity: 0.1, alignSelf: 'center', top: '25%' }} />
            </Animated.View>

            {/* Các hạt ánh sáng bay lên */}
            {particles.map((p, i) => (
                <FloatingSparkle key={i} color={colors} {...p} />
            ))}
            {/* highlight-end */}

            <Animated.View style={animatedStyle} className="items-center">
                <View className="w-72 h-72">
                    <Image source={{ uri: imageUrl }} className="w-full h-full" />
                    <Animated.Image source={{ uri: imageUrl }} className="absolute w-full h-full" style={[{ tintColor: '#020617' }, { opacity: silhouetteOpacity }]} />
                </View>
                <View className="flex-row gap-1 my-4">
                    {Array.from({ length: item.rarity }).map((_, i) => (<Star key={i} size={24} color={colors} fill={colors} />))}
                </View>
                <Text className="text-4xl font-bold text-white">{item.name}</Text>
                <Text className="text-white/70 mt-8">Nhấn để tiếp tục...</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};


export default function GachaAnimation({ results, onFinish }: { results: any, onFinish: () => void }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showSummary, setShowSummary] = useState(false);

    const handleNextItem = () => {
        if (currentIndex < results.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setShowSummary(true);
        }
    };

    if (showSummary) {
        return (
            <Animated.View entering={FadeIn} className="absolute inset-0 bg-slate-900/95 justify-center p-4">
                <Text className="text-3xl font-bold text-white text-center mb-6">Kết quả Cầu nguyện</Text>
                <View className="flex-row flex-wrap justify-center gap-2">
                    {results.map((item: any, index: number) => (
                        <View key={index} className="items-center p-2 bg-slate-800 rounded-lg border" style={{ borderColor: RARITY_GLOW_COLORS[item.rarity] }}>
                            <Image source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png` }} className="w-16 h-16" />
                            <Text className="text-white text-xs font-bold">{item.name}</Text>
                            <View className="flex-row">
                                {Array.from({ length: item.rarity }).map((_, i) => <Star key={i} size={8} color={RARITY_GLOW_COLORS[item.rarity]} />)}
                            </View>
                        </View>
                    ))}
                </View>
                <TouchableOpacity onPress={onFinish} className="mt-8 bg-cyan-500 p-3 rounded-xl mx-4">
                    <Text className="text-white font-bold text-center text-lg">Đóng</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    return (
        <View style={StyleSheet.absoluteFill}>
            <RevealItem item={results[currentIndex]} onNext={handleNextItem} />
        </View>
    );
}