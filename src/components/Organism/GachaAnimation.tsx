"use client"

import { RARITY_MAP } from "@constants/gacha.enum"; // Đảm bảo đường dẫn này đúng
// import { Sound } from "expo-av" // Bỏ comment nếu bạn muốn thêm âm thanh
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Star } from "lucide-react-native";
import { cssInterop } from "nativewind";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    Easing,
    FadeIn,
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
// 1. IMPORT TỪ REACT-NATIVE-SVG
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from "react-native-svg";

cssInterop(LinearGradient, { className: "style" })
const TWLinearGradient = LinearGradient as unknown as React.ComponentType<
    React.ComponentProps<typeof LinearGradient> & { className?: string }
>

const RARITY_GLOW_COLORS = {
    [RARITY_MAP.COMMON]: "#64748b",
    [RARITY_MAP.UNCOMMON]: "#10b981",
    [RARITY_MAP.RARE]: "#3b82f6",
    [RARITY_MAP.EPIC]: "#a855f7",
    [RARITY_MAP.LEGENDARY]: "#facc15",
}

// --- Hiệu ứng nổ (Giữ nguyên) ---
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
        <View
            style={{
                position: "absolute",
                top: "50%",
                left: "50%",
            }}
        >
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

// --- Component Pokéball bằng SVG (Có thể tách ra file riêng) ---
// Tạo các Animated components từ react-native-svg
const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedPath = Animated.createAnimatedComponent(Path)
const AnimatedRect = Animated.createAnimatedComponent(Rect)

interface AnimatedPokeballIconProps {
    size?: number
    isOpen: SharedValue<number> // SharedValue để điều khiển trạng thái mở (0 = đóng, 1 = mở)
    color?: string // Màu sắc cho hiệu ứng hào quang/ánh sáng
}

const AnimatedPokeballIcon = ({ size = 100, isOpen, color = "#facc15" }: AnimatedPokeballIconProps) => {
    const half = size / 2
    const strokeWidth = size * 0.07 // Độ dày của đường viền
    const separationDistance = size * 0.2 // Khoảng cách nửa trên/dưới tách ra

    // Hiệu ứng cho nửa trên (di chuyển lên)
    const animatedPropsTopPath = useAnimatedProps(() => {
        // react-native-svg expects a transform array on native; a string causes
        // a ReadableArray cast crash in the bridge. Keep it as an array of
        // transform objects.
        const translateY = -separationDistance * isOpen.value // Dịch chuyển lên khi isOpen tăng
        return {
            transform: [{ translateX: 0 }, { translateY }],
        }
    })

    // Hiệu ứng cho nửa dưới (di chuyển xuống)
    const animatedPropsBottomPath = useAnimatedProps(() => {
        const translateY = separationDistance * isOpen.value // Dịch chuyển xuống khi isOpen tăng
        return {
            transform: [{ translateX: 0 }, { translateY }],
        }
    })

    // Hiệu ứng cho đường kẻ giữa (mờ dần)
    const animatedPropsMidRect = useAnimatedProps(() => {
        const opacity = 1 - isOpen.value // Mờ dần khi mở
        return { opacity: opacity }
    })

    // Hiệu ứng cho vòng tròn ngoài cùng của nút giữa (mờ dần)
    const animatedPropsCenterOuterCircle = useAnimatedProps(() => {
        const opacity = 1 - isOpen.value // Mờ dần khi mở
        return { opacity: opacity }
    })

    // Hiệu ứng cho vòng tròn trong cùng của nút giữa (mờ dần)
    const animatedPropsCenterInnerCircle = useAnimatedProps(() => {
        const opacity = 1 - isOpen.value // Mờ dần khi mở
        return { opacity: opacity }
    })

    // Hiệu ứng hào quang/ánh sáng khi mở
    const animatedPropsGlow = useAnimatedProps(() => {
        const scale = 1 + isOpen.value * 2 // Tăng kích thước hào quang
        const opacity = isOpen.value * 0.8 // Xuất hiện khi mở
        return {
            transform: [{ scale: scale }],
            opacity: opacity,
            fill: color, // Sử dụng màu được truyền vào
        }
    })

    return (
        <View style={{ width: size, height: size }}>
            <Svg height={size} width={size} viewBox="0 0 100 100">
                <Defs>
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
                    animatedProps={animatedPropsGlow}
                />

                {/* Nửa màu đỏ trên */}
                <AnimatedPath animatedProps={animatedPropsTopPath} d={`M 5 50 A 45 45 0 0 1 95 50`} fill="#e74c3c" />

                {/* Nửa màu trắng dưới */}
                <AnimatedPath animatedProps={animatedPropsBottomPath} d={`M 5 50 A 45 45 0 0 0 95 50`} fill="#fff" />

                {/* Viền đen bên ngoài (không cần animation) */}
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
    )
}

// --- Component Ném Bóng (Phần chính bạn hỏi) ---
enum ThrowStage {
    INITIAL,
    THROWING,
    WIGGLE1,
    WIGGLE2,
    WIGGLE3,
    CATCH_SUCCESS,
    OPENING_POKEBALL, // Giai đoạn mở bóng
    EXPLODE,
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

    // SharedValue mới để điều khiển việc mở Pokéball
    const pokeballIsOpen = useSharedValue(0) // 0 = đóng, 1 = mở

    const [stage, setStage] = useState(ThrowStage.INITIAL)
    const [showExplosion, setShowExplosion] = useState(false)

    // ... (Optional: Load sound) ...

    useEffect(() => {
        if (stage === ThrowStage.INITIAL) {
            pokeballOpacity.value = withTiming(1, { duration: 300 })
            pokeballScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
            pokeballTranslateX.value = withTiming(
                screenWidth / 2 - 50, // Vị trí trung tâm (trừ 1 nửa width)
                { duration: 1000, easing: Easing.out(Easing.quad) },
            )
            pokeballTranslateY.value = withTiming(
                screenHeight / 2 - 50, // Vị trí trung tâm (trừ 1 nửa height)
                { duration: 1000, easing: Easing.out(Easing.quad) },
                (finished) => {
                    if (finished) {
                        runOnJS(setStage)(ThrowStage.WIGGLE1)
                    }
                },
            )
            pokeballRotate.value = withTiming(720, { duration: 1000, easing: Easing.out(Easing.quad) })
        } else if (stage === ThrowStage.WIGGLE1) {
            pokeballWiggle.value = withSequence(
                withTiming(-10, { duration: 200, easing: Easing.inOut(Easing.quad) }),
                withTiming(10, { duration: 200, easing: Easing.inOut(Easing.quad) }),
                withTiming(-5, { duration: 150, easing: Easing.inOut(Easing.quad) }),
                withTiming(5, { duration: 150, easing: Easing.inOut(Easing.quad) }),
                withTiming(0, { duration: 100, easing: Easing.inOut(Easing.quad) }, (finished) => {
                    if (finished) runOnJS(setStage)(ThrowStage.WIGGLE2)
                }),
            )
        } else if (stage === ThrowStage.WIGGLE2) {
            pokeballWiggle.value = withSequence(
                withDelay(
                    200, // Độ trễ giữa các lần lắc
                    withTiming(-8, { duration: 180, easing: Easing.inOut(Easing.quad) }),
                ),
                withTiming(8, { duration: 180, easing: Easing.inOut(Easing.quad) }),
                withTiming(-4, { duration: 120, easing: Easing.inOut(Easing.quad) }),
                withTiming(4, { duration: 120, easing: Easing.inOut(Easing.quad) }),
                withTiming(0, { duration: 80, easing: Easing.inOut(Easing.quad) }, (finished) => {
                    if (finished) runOnJS(setStage)(ThrowStage.WIGGLE3)
                }),
            )
        } else if (stage === ThrowStage.WIGGLE3) {
            pokeballWiggle.value = withSequence(
                withDelay(
                    200, // Độ trễ giữa các lần lắc
                    withTiming(-6, { duration: 150, easing: Easing.inOut(Easing.quad) }),
                ),
                withTiming(6, { duration: 150, easing: Easing.inOut(Easing.quad) }),
                withTiming(-3, { duration: 100, easing: Easing.inOut(Easing.quad) }),
                withTiming(3, { duration: 100, easing: Easing.inOut(Easing.quad) }),
                withTiming(0, { duration: 70, easing: Easing.inOut(Easing.quad) }, (finished) => {
                    if (finished) runOnJS(setStage)(ThrowStage.CATCH_SUCCESS)
                }),
            )
        } else if (stage === ThrowStage.CATCH_SUCCESS) {
            // Đã bắt thành công, dừng lắc và chuyển sang giai đoạn MỞ
            pokeballWiggle.value = withTiming(0, { duration: 100 }, (finished) => {
                if (finished) {
                    runOnJS(setStage)(ThrowStage.OPENING_POKEBALL)
                }
            })
        } else if (stage === ThrowStage.OPENING_POKEBALL) {
            // Kích hoạt hiệu ứng mở bóng
            pokeballIsOpen.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }, (finished) => {
                if (finished) {
                    // Sau khi mở xong, làm mờ bóng đi
                    pokeballOpacity.value = withTiming(0, { duration: 300 }, (finishedExplosion) => {
                        if (finishedExplosion) {
                            // Sau khi bóng mờ, kích hoạt hiệu ứng nổ
                            runOnJS(setShowExplosion)(true)
                        }
                    })
                }
            })
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
    }))

    const handleExplosionComplete = () => {
        onComplete()
    }

    return (
        <View style={StyleSheet.absoluteFill} className="bg-slate-950">
            <TWLinearGradient
                colors={["rgba(15, 23, 42, 0)", color + "15", "rgba(15, 23, 42, 0)"]}
                className="absolute inset-0"
                style={{ opacity: 0.3 }}
            />

            <Animated.View style={pokeballAnimatedStyle}>
                {/* Sử dụng AnimatedPokeballIcon và truyền các props */}
                <AnimatedPokeballIcon size={100} isOpen={pokeballIsOpen} color={color} />
            </Animated.View>

            {showExplosion && <ExplosionBurst color={color} onComplete={handleExplosionComplete} />}
        </View>
    )
}
// --- Kết thúc: Component Ném Bóng ---

// --- Các component hiển thị (Giữ nguyên) ---
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
                                <Text className="text-white font-bold text-xs">{item.sparkles}</Text>
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

// --- Component Chính (Giữ nguyên) ---
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
                                                <Text className="text-white font-bold text-[10px]">{item.sparkles}</Text>
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