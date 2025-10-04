import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import { HapticTab } from "@components/HapticTab";
import { ThemedText } from "@components/ThemedText";
import CustomTabBarBackground from "@components/ui/CustomTabBarBackground";
import { IconSymbol } from "@components/ui/IconSymbol";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3b82f6", // Màu xanh cho tab active
        tabBarInactiveTintColor: "#6b7280", // Màu xám cho tab inactive
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: CustomTabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderTopWidth: 0,
            height: 90,
            paddingTop: 10,
            paddingBottom: 20,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          default: {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderTopWidth: 0,
            height: 70,
            paddingTop: 6,
            paddingBottom: 8,
            elevation: 8,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            overflow: "hidden",
          },
        }),
      }}
    >
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 30 : 26} 
              name={"book.fill" as any} 
              color={focused ? "#10b981" : color} 
            />
          ),
          tabBarLabel: ({ focused }) => (
            <ThemedText style={{
              color: focused ? "#10b981" : "#6b7280",
              fontSize: 12,
              fontWeight: "600",
              marginTop: 2,
            }}>
              Learn
            </ThemedText>
          ),
        }}
      />
      <Tabs.Screen
        name="reading"
        options={{
          title: "Reading",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 30 : 26} 
              name={"textformat.abc" as any} 
              color={focused ? "#f59e0b" : color} 
            />
          ),
          tabBarLabel: ({ focused }) => (
            <ThemedText style={{
              color: focused ? "#f59e0b" : "#6b7280",
              fontSize: 12,
              fontWeight: "600",
              marginTop: 2,
            }}>
              Reading
            </ThemedText>
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 30 : 26} 
              name={"house.fill" as any} 
              color={focused ? "#3b82f6" : color} 
            />
          ),
          tabBarLabel: ({ focused }) => (
            <ThemedText style={{
              color: focused ? "#3b82f6" : "#6b7280",
              fontSize: 12,
              fontWeight: "600",
              marginTop: 2,
            }}>
              Home
            </ThemedText>
          ),
        }}
      />
      <Tabs.Screen
        name="listening"
        options={{
          title: "Listening",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 30 : 26} 
              name={"speaker.wave.2.fill" as any} 
              color={focused ? "#8b5cf6" : color} 
            />
          ),
          tabBarLabel: ({ focused }) => (
            <ThemedText style={{
              color: focused ? "#8b5cf6" : "#6b7280",
              fontSize: 12,
              fontWeight: "600",
              marginTop: 2,
            }}>
              Listening
            </ThemedText>
          ),
        }}
      />
      <Tabs.Screen
        name="battle"
        options={{
          title: "Battle",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 30 : 26} 
              name={"gamecontroller.fill" as any} 
              color={focused ? "#ef4444" : color} 
            />
          ),
          tabBarLabel: ({ focused }) => (
            <ThemedText style={{
              color: focused ? "#ef4444" : "#6b7280",
              fontSize: 12,
              fontWeight: "600",
              marginTop: 2,
            }}>
              Battle
            </ThemedText>
          ),
        }}
      />
    </Tabs>
  );
}
