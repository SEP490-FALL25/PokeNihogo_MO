"use client";

import { SubscriptionFeatureKey } from "@constants/subscription.enum";
import { Ionicons } from "@expo/vector-icons";
import { useCheckFeature } from "@hooks/useSubscriptionFeatures";
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

interface Tab {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  color: string;
  featureKey?: SubscriptionFeatureKey; // Optional feature key to check for lock
}

interface TabButtonProps {
  tab: Tab;
  active: boolean;
  isLocked: boolean;
  onPress: () => void;
}

const getTabConfig = (t: (key: string) => string): Tab[] => [
  {
    name: "learn",
    icon: "library",
    label: t("tabs.learn"),
    route: ROUTES.TABS.LEARN,
    color: "#06b6d4",
  },
  {
    name: "abilities",
    icon: "trophy",
    label: t("tabs.abilities"),
    route: ROUTES.TABS.ABILITIES,
    color: "#f59e0b",
  },
  {
    name: "home",
    icon: "home",
    label: t("tabs.home"),
    route: ROUTES.TABS.HOME,
    color: "#3b82f6",
  },
  {
    name: "ai-speaking",
    icon: "chatbox",
    label: t("tabs.ai_speaking"),
    route: ROUTES.TABS.AI_CONVERSATION,
    color: "#8b5cf6",
    featureKey: SubscriptionFeatureKey.AI_KAIWA, // Lock this tab if user doesn't have AI_KAIWA feature
  },
  {
    name: "battle",
    icon: "game-controller",
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

  // Check AI feature
  const hasAIKaiwa = useCheckFeature(SubscriptionFeatureKey.AI_KAIWA);

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
      // If tab is locked, redirect to subscription page
      if (tab.featureKey && !hasAIKaiwa) {
        router.push(ROUTES.APP.SUBSCRIPTION as any);
        return;
      }
      router.push(tab.route as any);
    },
    [router, hasAIKaiwa]
  );

  const tabConfig = getTabConfig(t);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.tabBar,
          Platform.select({
            ios: {
              shadowColor: COLORS.SHADOW,
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: 12,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: "#eeeeee",
            },
          }),
          // { paddingBottom: Math.max(12, insets.bottom) },
        ]}
      >
        {tabConfig.map((tab) => {
          const isLocked = tab.featureKey ? !hasAIKaiwa : false;
          return (
            <TabButton
              key={tab.name}
              tab={tab}
              active={isActive(tab.route)}
              isLocked={isLocked}
              onPress={() => handleTabPress(tab)}
            />
          );
        })}
      </View>
    </View>
  );
};

const TabButton = ({ tab, active, isLocked, onPress }: TabButtonProps) => {
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
      style={[styles.buttonWrapper, isLocked && styles.buttonWrapperLocked]}
      disabled={false} // Allow press to redirect to subscription
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
              isLocked && styles.iconBackgroundLocked,
              Platform.select({
                ios: [
                  active && !isLocked && {
                    backgroundColor: tab.color,
                    shadowColor: tab.color,
                  },
                ],
                android: {
                  // Only show solid background when active; keep inactive transparent
                  backgroundColor: active && !isLocked ? tab.color : "transparent",
                  elevation: active && !isLocked ? 10 : 0,
                },
              }),
            ]}
          >
            {isLocked ? (
              <View style={styles.lockIconContainer}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={COLORS.GRAY_LIGHT}
                />
              </View>
            ) : (
              <Ionicons
                name={tab.icon}
                size={24}
                color={active ? COLORS.WHITE : COLORS.GRAY_LIGHT}
              />
            )}
          </View>
        </Animated.View>

        <Text
          style={[
            styles.label,
            active && !isLocked && { color: tab.color },
            isLocked && styles.labelLocked,
            Platform.OS === "ios" && active && !isLocked ? { fontWeight: "600" } : null,
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
    borderWidth: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.GRAY_LIGHT,
    marginTop: 35,
  },
  labelLocked: {
    opacity: 0.5,
  },
  buttonWrapperLocked: {
    opacity: 0.6,
  },
  iconBackgroundLocked: {
    opacity: 0.5,
  },
  lockIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CustomTab;
