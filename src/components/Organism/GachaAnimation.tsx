"use client"

import { LinearGradient } from "expo-linear-gradient"
import { Sparkles, Star } from "lucide-react-native"
import { cssInterop } from "nativewind"
import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Image, StyleSheet, Text, TouchableOpacity, View, Dimensions } from "react-native"
import Animated, {
  Easing,
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"
import { RARITY } from "../../../mock-data/gacha"

cssInterop(LinearGradient, { className: "style" })
const TWLinearGradient = LinearGradient as unknown as React.ComponentType<
  React.ComponentProps<typeof LinearGradient> & { className?: string }
>

const RARITY_GLOW_COLORS = {
  [RARITY.COMMON]: "#4fd1c5",
  [RARITY.RARE]: "#a78bfa",
  [RARITY.LEGENDARY]: "#facc15",
}

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
          shadowColor: color,
          shadowRadius: 10,
          shadowOpacity: 0.8,
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
          shadowColor: color,
          shadowRadius: 80,
          shadowOpacity: 1,
        },
      ]}
    />
  )
}

const ShootingStar = ({ highestRarity, onComplete }: { highestRarity: number; onComplete: () => void }) => {
  const color = RARITY_GLOW_COLORS[highestRarity]
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window")
  const [showExplosion, setShowExplosion] = useState(false)

  const stars = useMemo(
    () => [
      {
        startX: -300,
        startY: screenHeight * 0.05,
        endX: screenWidth * 0.5,
        endY: screenHeight * 0.5,
        delay: 0,
        duration: 2800,
        size: 1.4,
        rotation: "20deg",
      },
      {
        startX: screenWidth + 300,
        startY: screenHeight * 0.1,
        endX: screenWidth * 0.5,
        endY: screenHeight * 0.5,
        delay: 600,
        duration: 2600,
        size: 1.2,
        rotation: "-20deg",
      },
      {
        startX: screenWidth * 0.5,
        startY: -300,
        endX: screenWidth * 0.5,
        endY: screenHeight * 0.5,
        delay: 1200,
        duration: 3000,
        size: 1.8,
        rotation: "0deg",
      },
      {
        startX: -250,
        startY: screenHeight * 0.25,
        endX: screenWidth * 0.5,
        endY: screenHeight * 0.5,
        delay: 400,
        duration: 2700,
        size: 1.0,
        rotation: "25deg",
      },
      {
        startX: screenWidth + 250,
        startY: screenHeight * 0.2,
        endX: screenWidth * 0.5,
        endY: screenHeight * 0.5,
        delay: 800,
        duration: 2500,
        size: 1.1,
        rotation: "-25deg",
      },
      {
        startX: -200,
        startY: screenHeight * 0.4,
        endX: screenWidth * 0.5,
        endY: screenHeight * 0.5,
        delay: 1000,
        duration: 2400,
        size: 0.9,
        rotation: "35deg",
      },
      {
        startX: screenWidth + 200,
        startY: screenHeight * 0.35,
        endX: screenWidth * 0.5,
        endY: screenHeight * 0.5,
        delay: 1400,
        duration: 2300,
        size: 0.95,
        rotation: "-35deg",
      },
    ],
    [screenWidth, screenHeight],
  )

  const handleStarsConverged = () => {
    setShowExplosion(true)
  }

  return (
    <View style={StyleSheet.absoluteFill} className="bg-slate-950">
      <TWLinearGradient
        colors={["rgba(15, 23, 42, 0)", color + "15", "rgba(15, 23, 42, 0)"]}
        className="absolute inset-0"
        style={{ opacity: 0.3 }}
      />

      {stars.map((star, index) => (
        <SingleShootingStar
          key={index}
          {...star}
          color={color}
          isLast={index === stars.length - 1}
          onComplete={index === stars.length - 1 ? handleStarsConverged : undefined}
        />
      ))}
      <CenterGlow color={color} />
      <LightBeams color={color} />

      {showExplosion && <ExplosionBurst color={color} onComplete={onComplete} />}
    </View>
  )
}

const LightBeams = ({ color }: { color: string }) => {
  const opacity = useSharedValue(0)
  const rotation = useSharedValue(0)

  useEffect(() => {
    opacity.value = withDelay(
      2000,
      withSequence(
        withTiming(0.4, { duration: 1000, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 800 }),
      ),
    )
    rotation.value = withDelay(2000, withTiming(360, { duration: 4000, easing: Easing.linear }))
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 600,
          height: 600,
          marginLeft: -300,
          marginTop: -300,
        },
      ]}
    >
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = i * 30 * (Math.PI / 180)
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 300,
              height: 2,
              backgroundColor: color,
              opacity: 0.3,
              transform: [{ translateX: -150 }, { translateY: -1 }, { rotate: `${i * 30}deg` }],
              shadowColor: color,
              shadowRadius: 20,
              shadowOpacity: 0.8,
            }}
          />
        )
      })}
    </Animated.View>
  )
}

const SingleShootingStar = ({
  startX,
  startY,
  endX,
  endY,
  delay,
  duration,
  size,
  rotation,
  color,
  isLast,
  onComplete,
}: any) => {
  const translateX = useSharedValue(startX)
  const translateY = useSharedValue(startY)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0)
  const glow = useSharedValue(0)

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }))
    scale.value = withDelay(delay, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }))

    glow.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    )

    translateX.value = withDelay(
      delay,
      withTiming(endX, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    )

    translateY.value = withDelay(
      delay,
      withTiming(
        endY,
        {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
        (finished) => {
          if (finished && isLast && onComplete) {
            opacity.value = withDelay(
              800,
              withTiming(0, { duration: 1000, easing: Easing.out(Easing.cubic) }, (done) => {
                if (done) {
                  runOnJS(onComplete)()
                }
              }),
            )
          }
        },
      ),
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value * size },
      { rotate: rotation },
    ],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glow.value }],
  }))

  const trailParticles = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        delay: i * 20,
        offset: i * 12,
        size: 4 - i * 0.08,
        opacity: 1 - i * 0.028,
      })),
    [],
  )

  return (
    <Animated.View style={[animatedStyle, { position: "absolute" }]}>
      {/* Main star head with enhanced glow */}
      <View className="items-center justify-center">
        <Animated.View style={glowStyle}>
          <View
            className="absolute w-40 h-40 rounded-full"
            style={{
              backgroundColor: color,
              opacity: 0.12,
              shadowColor: color,
              shadowRadius: 60,
              shadowOpacity: 1,
            }}
          />
        </Animated.View>
        <View
          className="absolute w-28 h-28 rounded-full"
          style={{
            backgroundColor: color,
            opacity: 0.25,
            shadowColor: color,
            shadowRadius: 40,
            shadowOpacity: 1,
          }}
        />
        <View
          className="absolute w-16 h-16 rounded-full"
          style={{
            backgroundColor: color,
            opacity: 0.4,
            shadowColor: color,
            shadowRadius: 25,
            shadowOpacity: 1,
          }}
        />

        <Animated.View style={glowStyle}>
          <Star size={48} color={color} fill={color} style={{ opacity: 0.9 }} />
        </Animated.View>
        <View className="absolute">
          <Star size={48} color="#ffffff" fill="#ffffff" style={{ opacity: 0.7 }} />
        </View>

        <View
          className="absolute w-4 h-4 rounded-full bg-white"
          style={{
            shadowColor: "#ffffff",
            shadowRadius: 20,
            shadowOpacity: 1,
          }}
        />
      </View>

      <View className="absolute -z-10" style={{ right: 24, top: 18 }}>
        {trailParticles.map((particle, i) => (
          <TwinklingTrailParticle
            key={i}
            color={color}
            offset={particle.offset}
            size={particle.size}
            opacity={particle.opacity}
            delay={delay + i * 30}
          />
        ))}

        <View
          className="absolute h-3 rounded-full"
          style={{
            width: 350,
            right: 0,
            backgroundColor: color,
            opacity: 0.35,
            shadowColor: color,
            shadowRadius: 20,
            shadowOpacity: 0.9,
          }}
        />

        <View
          className="absolute h-5 rounded-full"
          style={{
            width: 400,
            right: -25,
            top: -1,
            backgroundColor: color,
            opacity: 0.15,
            shadowColor: color,
            shadowRadius: 30,
            shadowOpacity: 0.6,
          }}
        />
      </View>

      {Array.from({ length: 12 }).map((_, i) => {
        const angle = i * 30 * (Math.PI / 180)
        const distance = 35
        return (
          <AnimatedSparkle
            key={i}
            color={color}
            x={Math.cos(angle) * distance}
            y={Math.sin(angle) * distance}
            delay={delay + i * 80}
          />
        )
      })}
    </Animated.View>
  )
}

const TwinklingTrailParticle = ({ color, offset, size, opacity: baseOpacity, delay }: any) => {
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(baseOpacity, { duration: 200, easing: Easing.inOut(Easing.ease) }),
          withTiming(baseOpacity * 0.3, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(baseOpacity, { duration: 200, easing: Easing.inOut(Easing.ease) }),
          withTiming(baseOpacity * 0.5, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          right: offset,
          width: size * 5,
          height: size * 5,
          borderRadius: (size * 5) / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowRadius: 12,
          shadowOpacity: 0.8,
        },
      ]}
    />
  )
}

const AnimatedSparkle = ({ color, x, y, delay }: any) => {
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0)

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    )
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.8, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x }, { translateY: y }, { scale: scale.value }],
  }))

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: color,
          shadowColor: color,
          shadowRadius: 8,
          shadowOpacity: 1,
        },
      ]}
    />
  )
}

const CenterGlow = ({ color }: { color: string }) => {
  const scale = useSharedValue(0)
  const opacity = useSharedValue(0)
  const pulse = useSharedValue(1)

  useEffect(() => {
    scale.value = withDelay(
      1500,
      withSequence(
        withTiming(2, { duration: 1500, easing: Easing.out(Easing.cubic) }),
        withTiming(2.5, { duration: 800, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 600 }),
      ),
    )
    opacity.value = withDelay(
      1500,
      withSequence(
        withTiming(0.6, { duration: 1500, easing: Easing.out(Easing.cubic) }),
        withTiming(0.9, { duration: 800 }),
        withTiming(0, { duration: 600 }),
      ),
    )

    pulse.value = withDelay(
      1500,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        ),
        4,
        true,
      ),
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value * pulse.value }],
  }))

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          top: "50%",
          left: "50%",
          marginLeft: -200,
          marginTop: -200,
        },
      ]}
    >
      <View
        className="w-[400px] h-[400px] rounded-full absolute"
        style={{
          backgroundColor: color,
          opacity: 0.15,
          shadowColor: color,
          shadowRadius: 150,
          shadowOpacity: 1,
        }}
      />
      <View
        className="w-[400px] h-[400px] rounded-full"
        style={{
          backgroundColor: color,
          opacity: 0.25,
          shadowColor: color,
          shadowRadius: 100,
          shadowOpacity: 1,
        }}
      />
    </Animated.View>
  )
}

const FloatingSparkle = ({ color, delay, duration, size, startX, startY }) => {
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
        },
      ]}
    />
  )
}

const RevealItem = ({ item, onNext }: { item: any; onNext: () => void }) => {
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.8)
  const silhouetteOpacity = useSharedValue(1)
  const pulse = useSharedValue(1)
  const colors = RARITY_GLOW_COLORS[item.rarity]
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`

  useEffect(() => {
    opacity.value = 0
    scale.value = 0.8
    silhouetteOpacity.value = 1

    opacity.value = withTiming(1, { duration: 300 })
    scale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) })
    silhouetteOpacity.value = withDelay(500, withTiming(0, { duration: 400 }))

    if (item.rarity === RARITY.LEGENDARY) {
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
    if (item.rarity < RARITY.RARE) return []
    const count = item.rarity === RARITY.RARE ? 15 : 30
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
        <View className="w-72 h-72">
          <Image source={{ uri: imageUrl }} className="w-full h-full" />
          <Animated.Image
            source={{ uri: imageUrl }}
            className="absolute w-full h-full"
            style={[{ tintColor: "#020617" }, { opacity: silhouetteOpacity }]}
          />
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

export default function GachaAnimation({ results, onFinish }: { results: any; onFinish: () => void }) {
  const [stage, setStage] = useState("star")
  const [currentIndex, setCurrentIndex] = useState(0)

  const highestRarity = useMemo(() => {
    const rarities = results.map((r: any) => r.rarity)
    if (rarities.includes(RARITY.LEGENDARY)) return RARITY.LEGENDARY
    if (rarities.includes(RARITY.RARE)) return RARITY.RARE
    return RARITY.COMMON
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
      case "star":
        return <ShootingStar highestRarity={highestRarity as number} onComplete={() => setStage("reveal")} />
      case "reveal":
        return <RevealItem item={results[currentIndex]} onNext={handleNextItem} />
      case "summary":
        return (
          <Animated.View entering={FadeIn} className="absolute inset-0 bg-slate-900/95 justify-center p-4">
            <Text className="text-3xl font-bold text-white text-center mb-6">Kết quả Cầu nguyện</Text>
            <View className="flex-row flex-wrap justify-center gap-2">
              {results.map((item: any, index: number) => (
                <View
                  key={index}
                  className="items-center p-2 bg-slate-800 rounded-lg border"
                  style={{ borderColor: RARITY_GLOW_COLORS[item.rarity] }}
                >
                  <Image
                    source={{
                      uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`,
                    }}
                    className="w-16 h-16"
                  />
                  <Text className="text-white text-xs font-bold">{item.name}</Text>
                  <View className="flex-row">
                    {Array.from({ length: item.rarity }).map((_, i) => (
                      <Star key={i} size={8} color={RARITY_GLOW_COLORS[item.rarity]} />
                    ))}
                  </View>
                </View>
              ))}
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
