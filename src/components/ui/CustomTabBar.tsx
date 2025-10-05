import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { IconSymbol } from "./IconSymbol";

const CustomTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      name: "learn",
      icon: "book.fill",
      label: "Learn",
      route: "/(tabs)/learn" as const,
      color: "#10b981",
    },
    {
      name: "reading",
      icon: "textformat.abc",
      label: "Reading",
      route: "/(tabs)/reading" as const,
      color: "#f59e0b",
    },
    {
      name: "home",
      icon: "house.fill",
      label: "Home",
      route: "/(tabs)/home" as const,
      color: "#3b82f6",
      isCenter: true,
    },
    {
      name: "listening",
      icon: "speaker.wave.2.fill",
      label: "Listening",
      route: "/(tabs)/listening" as const,
      color: "#8b5cf6",
    },
    {
      name: "battle",
      icon: "gamecontroller.fill",
      label: "Battle",
      route: "/(tabs)/battle" as const,
      color: "#ef4444",
    },
  ];

  const isActive = (route: string) => pathname === route;

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const active = isActive(tab.route);

          if (tab.isCenter) {
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.centerButton}
                onPress={() => router.push(tab.route)}
                activeOpacity={0.7}
              >
                <View style={styles.centerButtonContent}>
                  <IconSymbol size={28} name={tab.icon as any} color="white" />
                </View>
                <ThemedText style={styles.centerLabel}>{tab.label}</ThemedText>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabButton}
              onPress={() => router.push(tab.route)}
              activeOpacity={0.7}
            >
              <IconSymbol
                size={active ? 26 : 22}
                name={tab.icon as any}
                color={active ? tab.color : "#6b7280"}
              />
              <ThemedText
                style={[
                  styles.tabLabel,
                  {
                    color: active ? tab.color : "#6b7280",
                    fontSize: active ? 12 : 11,
                  },
                ]}
              >
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

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
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  centerLabel: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "center",
  },
});

export default CustomTabBar;
