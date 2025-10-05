"use client"

import { Ionicons } from "@expo/vector-icons"
import { usePathname, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const CustomTabBar = () => {
  const router = useRouter()
  const pathname = usePathname()

  const tabs = [
    {
      name: "learn",
      icon: "book" as keyof typeof Ionicons.glyphMap,
      label: "Learn",
      route: "/(app)/(tabs)/learn",
      color: "#10b981",
    },
    {
      name: "reading",
      icon: "text" as keyof typeof Ionicons.glyphMap,
      label: "Reading",
      route: "/(app)/(tabs)/reading",
      color: "#f59e0b",
    },
    {
      name: "home",
      icon: "home" as keyof typeof Ionicons.glyphMap,
      label: "Home",
      route: "/(app)/(tabs)/home",
      color: "#3b82f6",
      isCenter: true,
    },
    {
      name: "listening",
      icon: "volume-high" as keyof typeof Ionicons.glyphMap,
      label: "Listening",
      route: "/(app)/(tabs)/listening",
      color: "#8b5cf6",
    },
    {
      name: "battle",
      icon: "game-controller" as keyof typeof Ionicons.glyphMap,
      label: "Battle",
      route: "/(app)/(tabs)/battle",
      color: "#ef4444",
    },
  ]

  const isActive = (route: string) => pathname === route

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = isActive(tab.route)

          if (tab.isCenter) {
            return <CenterButton key={tab.name} tab={tab} active={active} onPress={() => router.push(tab.route as any)} />
          }

          return <RegularButton key={tab.name} tab={tab} active={active} onPress={() => router.push(tab.route as any)} />
        })}
      </View>
    </View>
  )
}

const CenterButton = ({ tab, active, onPress }: any) => {
  const [bounceAnim] = useState(new Animated.Value(0))
  const [scaleAnim] = useState(new Animated.Value(1))

  useEffect(() => {
    if (active) {
      Animated.parallel([
        Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [active])

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  })

  return (
    <TouchableOpacity style={styles.centerButton} onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.centerButtonContent,
          { backgroundColor: tab.color },
          {
            transform: [{ translateY }, { scale: scaleAnim }],
          },
        ]}
      >
        <Ionicons size={28} name={tab.icon} color="white" />
      </Animated.View>
      <Text style={[styles.centerLabel, { color: tab.color }]}>{tab.label}</Text>
    </TouchableOpacity>
  )
}

const RegularButton = ({ tab, active, onPress }: any) => {
  const [bounceAnim] = useState(new Animated.Value(0))
  const [scaleAnim] = useState(new Animated.Value(1))

  useEffect(() => {
    if (active) {
      Animated.parallel([
        Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.08,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [active])

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  })

  return (
    <TouchableOpacity style={styles.tabButton} onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={{
          transform: [{ translateY }, { scale: scaleAnim }],
        }}
      >
        <Ionicons size={active ? 26 : 22} name={tab.icon} color={active ? tab.color : "#6b7280"} />
      </Animated.View>
      <Text
        style={[
          styles.tabLabel,
          {
            color: active ? tab.color : "#6b7280",
            fontSize: active ? 12 : 11,
            fontWeight: active ? "600" : "500",
          },
        ]}
      >
        {tab.label}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: Platform.select({
      ios: 30,
      default: 20,
    }),
    height: Platform.select({
      ios: 90,
      default: 80,
    }),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 5,
  },
  centerButton: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 15,
    marginBottom: 20,
  },
  centerButtonContent: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  centerLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
})

export default CustomTabBar
