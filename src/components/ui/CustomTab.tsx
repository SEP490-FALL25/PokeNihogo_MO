"use client";

import { ROUTES } from "@routes/routes";
import { usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BookOpen,
  Home,
  MessageSquare,
  Sword,
  Trophy,
} from "lucide-react-native";

interface Tab {
  name: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  route: string;
  color: string;
}

interface TabButtonProps {
  tab: Tab;
  active: boolean;
  onPress: () => void;
}

const getTabConfig = (t: (key: string) => string): Tab[] => [
  {
    name: "learn",
    icon: BookOpen,
    label: t("tabs.learn"),
    route: ROUTES.TABS.LEARN,
    color: "#06b6d4",
  },
  {
    name: "abilities",
    icon: Trophy,
    label: t("tabs.abilities"),
    route: ROUTES.TABS.ABILITIES,
    color: "#f59e0b",
  },
  {
    name: "home",
    icon: Home,
    label: t("tabs.home"),
    route: ROUTES.TABS.HOME,
    color: "#3b82f6",
  },
  {
    name: "ai-speaking",
    icon: MessageSquare,
    label: t("tabs.ai_speaking"),
    route: ROUTES.APP.AI_CONVERSATIONS_LIST,
    color: "#8b5cf6",
  },
  {
    name: "battle",
    icon: Sword,
    label: t("tabs.battle"),
    route: ROUTES.TABS.BATTLE,
    color: "#ef4444",
  },
];

const CustomTab = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  // const insets = useSafeAreaInsets();

  const isActive = useCallback(
    (route: string) => {
      const cleanRoute = route.replace(ROUTES.TABS.ROOT, "");
      const cleanPathname = pathname.replace(ROUTES.TABS.ROOT, "");
      return cleanPathname === cleanRoute || pathname === route;
    },
    [pathname]
  );

  const handleTabPress = useCallback(
    (tab: Tab) => {
      router.push(tab.route as any);
    },
    [router]
  );

  const tabConfig = getTabConfig(t);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.tabBar,
          Platform.select({
            android: {
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: "#eeeeee",
            },
          }),
          // { paddingBottom: Math.max(12, insets.bottom) },
        ]}
      >
        {tabConfig.map((tab) => (
            <TabButton
              key={tab.name}
              tab={tab}
              active={isActive(tab.route)}
              onPress={() => handleTabPress(tab)}
            />
        ))}
      </View>
    </View>
  );
};

const TabButton = ({ tab, active, onPress }: TabButtonProps) => {
  const Icon = tab.icon;
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
            Platform.OS === "android" && { zIndex: active ? 2 : 1 },
          ]}
        >
          <View
            style={[
              styles.iconBackground,
              Platform.select({
                ios: [
                  active && {
                    backgroundColor: tab.color,},
                ],
                android: {
                  // Only show solid background when active; keep inactive transparent
                  backgroundColor: active ? tab.color : "transparent",
                },
              }),
            ]}
          >
            <Icon
              size={24}
              color={active ? COLORS.WHITE : COLORS.GRAY_LIGHT}
              strokeWidth={2.4}
            />
          </View>
        </Animated.View>

        <Text
          style={[
            styles.label,
            active && { color: tab.color },
            Platform.OS === "ios" && active ? { fontWeight: "600" } : null,
            Platform.OS === "android" ? { marginTop: 40 } : null,
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
  BOUNCE_HEIGHT: 30,
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
    width: "100%",
  },
  notificationBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  notificationDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#ef4444",
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
    borderWidth: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.GRAY_LIGHT,
    marginTop: 35,
  },
});

export default CustomTab;
