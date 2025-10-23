"use client";

import { Ionicons } from "@expo/vector-icons";
import { ROUTES } from "@routes/routes";
import { usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Tab {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  color: string;
}

interface TabButtonProps {
  tab: Tab;
  active: boolean;
  onPress: () => void;
}

const TAB_CONFIG: Tab[] = [
  // {
  //   name: "learn",
  //   icon: "book",
  //   label: "Learn",
  //   route: ROUTES.TABS.LEARN,
  //   color: "#10b981",
  // },
  {
    name: "demo quiz",
    icon: "game-controller",
    label: "Demo Quiz",
    route: "/quiz-demo",
    color: "#ef4444",
  },
  {
    name: "learn",
    icon: "library",
    label: "Learn",
    route: ROUTES.TABS.LEARN,
    color: "#06b6d4",
  },
  {
    name: "reading",
    icon: "text",
    label: "Reading",
    route: ROUTES.TABS.READING,
    color: "#f59e0b",
  },
  {
    name: "home",
    icon: "home",
    label: "Home",
    route: ROUTES.TABS.HOME,
    color: "#3b82f6",
  },
  {
    name: "listening",
    icon: "volume-high",
    label: "Listening",
    route: ROUTES.TABS.LISTENING,
    color: "#8b5cf6",
  },
  {
    name: "battle",
    icon: "game-controller",
    label: "Battle",
    route: ROUTES.TABS.BATTLE,
    color: "#ef4444",
  },
];

const CustomTab = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = useCallback(
    (route: string) => {
      const cleanRoute = route.replace(ROUTES.TABS.ROOT, "");
      const cleanPathname = pathname.replace(ROUTES.TABS.ROOT, "");
      return cleanPathname === cleanRoute || pathname === route;
    },
    [pathname]
  );

  const handleTabPress = useCallback(
    (route: string) => {
      router.push(route as any);
    },
    [router]
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {TAB_CONFIG.map((tab) => (
          <TabButton
            key={tab.name}
            tab={tab}
            active={isActive(tab.route)}
            onPress={() => handleTabPress(tab.route)}
          />
        ))}
      </View>
    </View>
  );
};

const TabButton = ({ tab, active, onPress }: TabButtonProps) => {
  const bounceAnim = useRef(new Animated.Value(active ? 1 : 0)).current;
  const scaleAnim = useRef(
    new Animated.Value(
      active ? DIMENSIONS.SCALE_ACTIVE : DIMENSIONS.SCALE_INACTIVE
    )
  ).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bounceAnim, {
        toValue: active ? 1 : 0,
        ...ANIMATION_CONFIG.SPRING,
      }),
      Animated.spring(scaleAnim, {
        toValue: active ? DIMENSIONS.SCALE_ACTIVE : DIMENSIONS.SCALE_INACTIVE,
        ...ANIMATION_CONFIG.SPRING,
      }),
      // Chỉ rotate khi active, với sequence animation
      ...(active
        ? [
            Animated.sequence([
              Animated.timing(rotateAnim, {
                toValue: 1,
                ...ANIMATION_CONFIG.ROTATE_TIMING,
              }),
              Animated.timing(rotateAnim, {
                toValue: 0,
                ...ANIMATION_CONFIG.ROTATE_TIMING,
              }),
            ]),
          ]
        : []),
    ]).start();
  }, [active, bounceAnim, scaleAnim, rotateAnim]);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -DIMENSIONS.BOUNCE_HEIGHT],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "10deg"],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.buttonWrapper}
    >
      <View style={styles.buttonContainer}>
        <Animated.View
          style={[
            styles.floatingIconContainer,
            {
              transform: [{ translateY }, { scale: scaleAnim }, { rotate }],
            },
          ]}
        >
          <View
            style={[
              styles.iconBackground,
              active && { backgroundColor: tab.color, shadowColor: tab.color },
            ]}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={active ? COLORS.WHITE : COLORS.GRAY_LIGHT}
            />
          </View>
        </Animated.View>

        <Text
          style={[
            styles.label,
            active && { color: tab.color, fontWeight: "600" },
          ]}
        >
          {tab.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Constants for styling
const COLORS = {
  WHITE: "#ffffff",
  GRAY_LIGHT: "#d1d5db",
  SHADOW: "#000",
} as const;

const DIMENSIONS = {
  ICON_SIZE: 48,
  ICON_RADIUS: 16,
  BOUNCE_HEIGHT: 35,
  SCALE_ACTIVE: 1.2,
  SCALE_INACTIVE: 1,
} as const;

const ANIMATION_CONFIG = {
  SPRING: { tension: 50, friction: 7, useNativeDriver: true },
  TIMING: { duration: 250, useNativeDriver: true },
  ROTATE_TIMING: { duration: 200, useNativeDriver: true },
} as const;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginHorizontal: 0,
    marginBottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 20,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    width: "100%",
  },
  buttonWrapper: {
    flex: 1,
    alignItems: "center",
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: 60,
  },
  floatingIconContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBackground: {
    width: DIMENSIONS.ICON_SIZE,
    height: DIMENSIONS.ICON_SIZE,
    borderRadius: DIMENSIONS.ICON_RADIUS,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.GRAY_LIGHT,
    marginTop: 35,
  },
});

export default CustomTab;
