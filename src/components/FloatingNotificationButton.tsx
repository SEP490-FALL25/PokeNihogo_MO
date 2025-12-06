import { ThemedText } from "@components/ThemedText";
import { useNotification } from "@hooks/useNotification";
import { ROUTES } from "@routes/routes";
import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const FloatingNotificationButton = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotification();

  const handlePress = () => {
    router.push(ROUTES.APP.NOTIFICATIONS);
  };

  return (
    <View style={[styles.container, { bottom: Platform.OS === 'ios' ? 100 : 80 }]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.button}
      >
        <Bell
          size={24}
          color={unreadCount > 0 ? "#2563eb" : "#4b5563"}
          strokeWidth={2.5}
        />
        
        {unreadCount > 0 && (
          <Animated.View 
            entering={ZoomIn.springify()}
            style={styles.badge}
          >
            <ThemedText style={styles.badgeText}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </ThemedText>
          </Animated.View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    zIndex: 100,
    // Bottom is handled dynamically
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff",
    backdropFilter: "blur(10px)", // Works on some versions, ignored on others
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 14,
  },
});

