"use client"

import { RARITY_MAP } from "@constants/gacha.enum";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Star } from "lucide-react-native";
import { cssInterop } from "nativewind";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    Easing,
    FadeIn,
    interpolate,
    runOnJS,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
    type SharedValue,
} from "react-native-reanimated";
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from "react-native-svg";

// --- Cấu hình Tailwind cho Gradient ---
cssInterop(LinearGradient, { className: "style" })
const TWLinearGradient = LinearGradient as unknown as React.ComponentType<
    React.ComponentProps<typeof LinearGradient> & { className?: string }
>

// --- Màu sắc theo độ hiếm ---
const RARITY_GLOW_COLORS = {
    [RARITY_MAP.COMMON]: "#64748b",
    [RARITY_MAP.UNCOMMON]: "#10b981",
    [RARITY_MAP.RARE]: "#3b82f6",
    [RARITY_MAP.EPIC]: "#a855f7",
    [RARITY_MAP.LEGENDARY]: "#facc15",
}

// --- Animation Components cho SVG ---
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// --- 1. Component Hiệu ứng Nổ (Explosion) ---
const ExplosionBurst = ({ color, onComplete }: { color: string; onComplete: () => void }) => {
    const particles = useMemo(
        () =>
            Array.from({ length: 30 }).map((_, i) => {
                const angle = (i / 30) * Math.PI * 2
                const distance = 120 + Math.random() * 150
                return {
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    size: 3 + Math.random() * 6,
                    delay: Math.random() * 150,
                    duration: 700 + Math.random() * 300,
                }
            }),
        [],
    )

    return (
        <View style={{ position: "absolute", top: "50%", left: "50%" }}>
            {particles.map((particle, i) => (
                <ExplosionParticle
                    key={i}
                    {...particle}
                    color={color}
                    isLast={i === particles.length - 1}
                    onComplete={onComplete}
                />
            ))}
            <ExplosionFlash color={color} />
        </View>
    )
}

const ExplosionParticle = ({ x, y, size, delay, duration, color, isLast, onComplete }: any) => {
    const translateX = useSharedValue(0)
    const translateY = useSharedValue(0)
    const opacity = useSharedValue(0)

    useEffect(() => {
        opacity.value = withDelay(
            delay,
            withSequence(
                withTiming(1, { duration: 80 }),
                withTiming(0, { duration: duration, easing: Easing.out(Easing.quad) }),
            ),
        )
        translateX.value = withDelay(delay, withTiming(x, { duration, easing: Easing.out(Easing.quad) }))
        translateY.value = withDelay(
            delay,
            withTiming(y, { duration, easing: Easing.out(Easing.quad) }, (finished) => {
                if (finished && isLast && onComplete) {
                    runOnJS(onComplete)()
                }
            }),
        )
    }, [])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    }))

    return (
        <Animated.View
            style={[
                animatedStyle,
                {
                    position: "absolute",
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                },
            ]}
        />
    )
}

const ExplosionFlash = ({ color }: { color: string }) => {
    const scale = useSharedValue(0)
    const opacity = useSharedValue(0)

    useEffect(() => {
        scale.value = withSequence(
            withTiming(0.5, { duration: 80 }),
            withTiming(2.5, { duration: 500, easing: Easing.out(Easing.quad) }),
        )
        opacity.value = withSequence(
            withTiming(0.9, { duration: 80 }),
            withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }),
        )
    }, [])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }))

    return (
        <Animated.View
            style={[
                animatedStyle,
                {
                    position: "absolute",
                    width: 250,
                    height: 250,
                    marginLeft: -125,
                    marginTop: -125,
                    borderRadius: 125,
                    backgroundColor: color,
                },
            ]}
        />
    )
}

// --- 2. Component Pokéball Cao Cấp (Mới) ---
interface AnimatedPokeballIconProps {
    size?: number
    isOpen: SharedValue<number>
    color?: string
}

const AnimatedPokeballIcon = ({ size = 100, isOpen, color = "#facc15" }: AnimatedPokeballIconProps) => {
    const half = size / 2
    const strokeWidth = size * 0.05

    // 1. Hiệu ứng lõi năng lượng bên trong (Phình to ra khi mở)
    const innerLightStyle = useAnimatedProps(() => ({
        r: withTiming(isOpen.value * (size * 0.45), { duration: 300 }),
        opacity: withTiming(isOpen.value, { duration: 150 }),
    }));

    // 2. Hiệu ứng Nắp Trên (Xoay bản lề + Bay lên)
    const topHalfStyle = useAnimatedStyle(() => {
        // Mô phỏng xoay quanh tâm (bản lề ảo ở phía sau)
        const rotate = interpolate(isOpen.value, [0, 1], [0, -50]);
        const translateY = interpolate(isOpen.value, [0, 1], [0, -size * 0.2]);
        const translateX = interpolate(isOpen.value, [0, 1], [0, -size * 0.1]);

        return {
            transform: [
                { translateX: half }, { translateY: half }, // Dời tâm xoay về giữa
                { rotate: `${rotate}deg` },
                { translateX: -half }, { translateY: -half }, // Trả về vị trí
                { translateX },
                { translateY }
            ],
        };
    });

    // 3. Hiệu ứng Nắp Dưới (Hơi giật xuống tạo phản lực)
    const bottomHalfStyle = useAnimatedStyle(() => {
        const translateY = interpolate(isOpen.value, [0, 1], [0, size * 0.1]);
        return {
            transform: [{ translateY }],
        };
    });

    return (
        <View style={{ width: size, height: size }}>
            <Svg height={size} width={size} viewBox="0 0 100 100">
                <Defs>
                    {/* Gradient cho lõi năng lượng */}
                    <RadialGradient
                        id="glow"
                        cx="50"
                        cy="50"
                        rx="50"
                        ry="50"
                        fx="50"
                        fy="50"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <Stop offset="40%" stopColor="#ffffff" stopOpacity="0.9" />
                        <Stop offset="100%" stopColor={color} stopOpacity="0.2" />
                    </RadialGradient>
                    {/* Gradient cho nút bấm */}
                    <RadialGradient
                        id="btnGrad"
                        cx="50"
                        cy="50"
                        rx="50"
                        ry="50"
                        fx="50"
                        fy="50"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0%" stopColor="#fff" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#ddd" stopOpacity="1" />
                    </RadialGradient>
                </Defs>

                {/* --- Lõi ánh sáng (Nằm dưới cùng) --- */}
                <AnimatedCircle
                    cx="50"
                    cy="50"
                    fill="url(#glow)"
                    animatedProps={innerLightStyle}
                />

                {/* --- Nắp Dưới (Trắng) --- */}
                <AnimatedG animatedProps={bottomHalfStyle}>
                    <Path
                        d="M 5 50 A 45 45 0 0 0 95 50 L 95 50 L 5 50 Z"
                        fill="white"
                        stroke="#2c3e50"
                        strokeWidth={strokeWidth}
                    />
                    <Path
                        d="M 35 50 A 15 15 0 0 0 65 50"
                        fill="white"
                        stroke="#2c3e50"
                        strokeWidth={strokeWidth}
                    />
                </AnimatedG>

                {/* --- Nắp Trên (Đỏ) --- */}
                <AnimatedG animatedProps={topHalfStyle}>
                    <Path
                        d="M 5 50 A 45 45 0 0 1 95 50 L 95 50 L 5 50 Z"
                        fill="#ef4444"
                        stroke="#2c3e50"
                        strokeWidth={strokeWidth}
                    />
                    <Path
                        d="M 35 50 A 15 15 0 0 1 65 50"
                        fill="#ef4444"
                        stroke="#2c3e50"
                        strokeWidth={strokeWidth}
                    />
                    {/* Nút bấm (Gắn liền nắp trên) */}
                    <Circle
                        cx="50"
                        cy="50"
                        r="8"
                        fill="url(#btnGrad)"
                        stroke="#2c3e50"
                        strokeWidth={2}
                    />
                </AnimatedG>
            </Svg>
        </View>
    )
}

// --- 3. Animation Ném Bóng & Mở ---
enum ThrowStage {
    INITIAL,
    THROWING,
    WIGGLE1,
    WIGGLE2,
    WIGGLE3,
    CATCH_SUCCESS,
    OPENING_POKEBALL,
}

const PokeballThrowAnimation = ({ highestRarity, onComplete }: { highestRarity: number; onComplete: () => void }) => {
    const color = RARITY_GLOW_COLORS[highestRarity] || RARITY_GLOW_COLORS[RARITY_MAP.COMMON]
    const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

    const pokeballScale = useSharedValue(0.1)
    const pokeballTranslateX = useSharedValue(screenWidth * 1.5)
    const pokeballTranslateY = useSharedValue(screenHeight * 0.1)
    const pokeballRotate = useSharedValue(0)
    const pokeballOpacity = useSharedValue(0)
    const pokeballWiggle = useSharedValue(0)

    // SharedValues cho hiệu ứng mở
    const pokeballIsOpen = useSharedValue(0)
    const whiteFlashOpacity = useSharedValue(0)

    const [stage, setStage] = useState(ThrowStage.INITIAL)
    const [showExplosion, setShowExplosion] = useState(false)

    useEffect(() => {
        if (stage === ThrowStage.INITIAL) {
            // Ném bóng vào
            pokeballOpacity.value = withTiming(1, { duration: 300 })
            pokeballScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
            pokeballTranslateX.value = withTiming(
                screenWidth / 2 - 60, // Căn giữa chính xác hơn (size 120/2 = 60)
                { duration: 1000, easing: Easing.out(Easing.quad) },
            )
            pokeballTranslateY.value = withTiming(
                screenHeight / 2 - 60,
                { duration: 1000, easing: Easing.out(Easing.quad) },
                (finished) => {
                    if (finished) runOnJS(setStage)(ThrowStage.WIGGLE1)
                },
            )
            pokeballRotate.value = withTiming(720, { duration: 1000, easing: Easing.out(Easing.quad) })
        }
        // Lắc lần 1
        else if (stage === ThrowStage.WIGGLE1) {
            pokeballWiggle.value = withSequence(
                withTiming(-12, { duration: 150 }), withTiming(12, { duration: 150 }),
                withTiming(0, { duration: 100 }, (f) => f && runOnJS(setStage)(ThrowStage.WIGGLE2))
            )
        }
        // Lắc lần 2
        else if (stage === ThrowStage.WIGGLE2) {
            pokeballWiggle.value = withSequence(
                withDelay(300, withTiming(-8, { duration: 150 })), withTiming(8, { duration: 150 }),
                withTiming(0, { duration: 100 }, (f) => f && runOnJS(setStage)(ThrowStage.WIGGLE3))
            )
        }
        // Lắc lần 3
        else if (stage === ThrowStage.WIGGLE3) {
            pokeballWiggle.value = withSequence(
                withDelay(300, withTiming(-5, { duration: 150 })), withTiming(5, { duration: 150 }),
                withTiming(0, { duration: 100 }, (f) => f && runOnJS(setStage)(ThrowStage.CATCH_SUCCESS))
            )
        }
        // Dừng lắc, chuẩn bị mở
        else if (stage === ThrowStage.CATCH_SUCCESS) {
            pokeballWiggle.value = withTiming(0, { duration: 200 }, (finished) => {
                if (finished) {
                    runOnJS(setStage)(ThrowStage.OPENING_POKEBALL)
                }
            })
        }
        // Mở bóng và chớp sáng
        else if (stage === ThrowStage.OPENING_POKEBALL) {
            // 1. Mở nắp bóng (bật mạnh ra)
            pokeballIsOpen.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.5)) });

            // 2. Bóng to lên một chút trước khi nổ (tạo đà)
            pokeballScale.value = withTiming(1.3, { duration: 400, easing: Easing.in(Easing.quad) });

            // 3. Màn hình chớp trắng ngay khi mở hết cỡ
            whiteFlashOpacity.value = withDelay(300, withSequence(
                withTiming(1, { duration: 100 }), // Chớp sáng cực nhanh
                withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) }, (finished) => {
                    if (finished) {
                        // Kích hoạt nổ hạt sau khi chớp
                        runOnJS(setShowExplosion)(true)
                    }
                })
            ));

            // 4. Làm biến mất quả bóng ngay trong lúc màn hình trắng xoá
            pokeballOpacity.value = withDelay(350, withTiming(0, { duration: 100 }));
        }
    }, [stage])

    const pokeballAnimatedStyle = useAnimatedStyle(() => ({
        opacity: pokeballOpacity.value,
        transform: [
            { translateX: pokeballTranslateX.value },
            { translateY: pokeballTranslateY.value },
            { scale: pokeballScale.value },
            { rotate: `${pokeballRotate.value + pokeballWiggle.value}deg` },
        ],
        position: "absolute",
        zIndex: 10,
    }))

    const flashStyle = useAnimatedStyle(() => ({
        opacity: whiteFlashOpacity.value,
        zIndex: 20, // Phải nằm trên bóng
    }))

    const handleExplosionComplete = () => {
        onComplete()
    }

    return (
        <View style={StyleSheet.absoluteFill} className="bg-slate-950">
            {/* Background mờ ảo */}
            <TWLinearGradient
                colors={["rgba(15, 23, 42, 0)", color + "20", "rgba(15, 23, 42, 0)"]}
                className="absolute inset-0"
                style={{ opacity: 0.5 }}
            />

            {/* Quả bóng */}
            <Animated.View style={pokeballAnimatedStyle}>
                <AnimatedPokeballIcon size={120} isOpen={pokeballIsOpen} color={color} />
            </Animated.View>

            {/* Màn hình chớp trắng (Che khuyết điểm lúc chuyển cảnh) */}
            <Animated.View
                style={[StyleSheet.absoluteFill, { backgroundColor: 'white' }, flashStyle]}
                pointerEvents="none"
            />

            {/* Hiệu ứng nổ hạt */}
            {showExplosion && <ExplosionBurst color={color} onComplete={handleExplosionComplete} />}
        </View>
    )
}

// --- 4. Các Component hiển thị khác (Giữ nguyên logic cũ) ---
type FloatingSparkleProps = {
    color: string
    delay: number
    duration: number
    size: number
    startX: number | string
    startY: number | string
}

const FloatingSparkle = ({ color, delay, duration, size, startX, startY }: FloatingSparkleProps) => {
    "worklet"
    const opacity = useSharedValue(0)
    const translateY = useSharedValue(0)

    useEffect(() => {
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(withTiming(1, { duration: duration * 0.4 }), withTiming(0, { duration: duration * 0.6 })),
                -1,
            ),
        )
        translateY.value = withDelay(delay, withRepeat(withTiming(-100, { duration, easing: Easing.out(Easing.quad) }), -1))
    }, [])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }))

    return (
        <Animated.View
            style={[
                animatedStyle,
                {
                    position: "absolute",
                    left: startX,
                    top: startY,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                } as any,
            ]}
        />
    )
}

const RevealItem = ({ item, onNext }: { item: any; onNext: () => void }) => {
    const opacity = useSharedValue(0)
    const scale = useSharedValue(0.8)
    const silhouetteOpacity = useSharedValue(1)
    const pulse = useSharedValue(1)
    const colors = RARITY_GLOW_COLORS[item.rarity] || RARITY_GLOW_COLORS[RARITY_MAP.COMMON]
    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`

    useEffect(() => {
        opacity.value = 0
        scale.value = 0.8
        silhouetteOpacity.value = 1

        opacity.value = withTiming(1, { duration: 300 })
        scale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) })
        silhouetteOpacity.value = withDelay(500, withTiming(0, { duration: 400 }))

        if (item.rarity === RARITY_MAP.LEGENDARY) {
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
                    withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
                ),
                -1,
                true,
            )
        } else {
            pulse.value = 1
        }
    }, [item])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }))

    const pulseAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }))

    const particles = useMemo(() => {
        if (item.rarity < 4) return []
        const count = item.rarity === 4 ? 15 : 30
        return Array.from({ length: count }).map(() => ({
            delay: Math.random() * 2000,
            duration: 2000 + Math.random() * 2000,
            size: 2 + Math.random() * 4,
            startX: Math.random() * 100 + "%",
            startY: Math.random() * 20 + 80 + "%",
        }))
    }, [item.rarity])

    return (
        <TouchableOpacity activeOpacity={1} onPress={onNext} className="absolute inset-0 items-center justify-center">
            <TWLinearGradient colors={[colors, "#0f172a"]} className="absolute inset-0" />
            <Animated.View style={[{ ...StyleSheet.absoluteFillObject }, pulseAnimatedStyle]}>
                <Sparkles size={250} color={colors} style={{ opacity: 0.1, alignSelf: "center", top: "25%" }} />
            </Animated.View>
            {particles.map((p, i) => (
                <FloatingSparkle key={i} color={colors} {...p} />
            ))}
            <Animated.View style={animatedStyle} className="items-center">
                <View className="relative">
                    <View className="w-72 h-72">
                        <Image source={{ uri: imageUrl }} className="w-full h-full" />
                        <Animated.Image
                            source={{ uri: imageUrl }}
                            className="absolute w-full h-full"
                            style={[{ tintColor: "#020617" }, { opacity: silhouetteOpacity }]}
                        />
                        {item.isDuplicate && item.sparkles && (
                            <Animated.View
                                entering={FadeIn.delay(600)}
                                className="absolute top-2 right-2 bg-amber-500/95 px-2 py-1 rounded flex-row items-center gap-1"
                            >
                                <Sparkles size={14} color="#ffffff" fill="#ffffff" />
                                <Text className="text-white font-bold text-xs">{parseFloat(item.sparkles).toFixed(2)}</Text>
                            </Animated.View>
                        )}
                    </View>
                </View>
                <View className="flex-row gap-1 my-4">
                    {Array.from({ length: item.rarity }).map((_, i) => (
                        <Star key={i} size={24} color={colors} fill={colors} />
                    ))}
                </View>
                <Text className="text-4xl font-bold text-white">{item.name}</Text>
                <Text className="text-white/70 mt-8">Nhấn để tiếp tục...</Text>
            </Animated.View>
        </TouchableOpacity>
    )
}

// --- 5. Component Chính ---
export default function GachaAnimation({ results, onFinish }: { results: any; onFinish: () => void }) {
    const [stage, setStage] = useState("pokeballThrow")
    const [currentIndex, setCurrentIndex] = useState(0)

    const highestRarity = useMemo(() => {
        const rarities = results.map((r: any) => r.rarity)
        if (rarities.length === 0) return RARITY_MAP.COMMON
        return Math.max(...rarities)
    }, [results])

    const handleNextItem = () => {
        if (currentIndex < results.length - 1) {
            setCurrentIndex(currentIndex + 1)
        } else {
            setStage("summary")
        }
    }

    const renderContent = () => {
        switch (stage) {
            case "pokeballThrow":
                return <PokeballThrowAnimation highestRarity={highestRarity as number} onComplete={() => setStage("reveal")} />
            case "reveal":
                return <RevealItem item={results[currentIndex]} onNext={handleNextItem} />
            case "summary":
                return (
                    <Animated.View entering={FadeIn} className="absolute inset-0 bg-slate-900/95 justify-center p-4">
                        <Text className="text-3xl font-bold text-white text-center mb-6">Kết quả Gặp Gỡ</Text>
                        <View className="flex-row flex-wrap justify-center gap-2">
                            {results.map((item: any, index: number) => {
                                const itemColor = RARITY_GLOW_COLORS[item.rarity] || RARITY_GLOW_COLORS[RARITY_MAP.COMMON]
                                return (
                                    <View
                                        key={index}
                                        className="relative items-center p-2 bg-slate-800 rounded-lg border"
                                        style={{ borderColor: itemColor }}
                                    >
                                        <Image
                                            source={{
                                                uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`,
                                            }}
                                            className="w-16 h-16"
                                        />
                                        {item.isDuplicate && item.sparkles && (
                                            <View className="absolute top-1 right-1 bg-amber-500 px-1.5 py-0.5 rounded flex-row items-center gap-0.5">
                                                <Sparkles size={10} color="#ffffff" fill="#ffffff" />
                                                <Text className="text-white font-bold text-[10px]">{parseFloat(item.sparkles).toFixed(2)}</Text>
                                            </View>
                                        )}
                                        <Text className="text-white text-xs font-bold">{item.name}</Text>
                                        <View className="flex-row">
                                            {Array.from({ length: item.rarity }).map((_, i) => (
                                                <Star key={i} size={8} color={itemColor} />
                                            ))}
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                        <TouchableOpacity onPress={onFinish} className="mt-8 bg-cyan-500 p-3 rounded-xl mx-4">
                            <Text className="text-white font-bold text-center text-lg">Đóng</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )
            default:
                return null
        }
    }

    return <View style={StyleSheet.absoluteFill}>{renderContent()}</View>
}