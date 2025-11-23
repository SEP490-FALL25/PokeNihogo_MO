import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TestHeaderProps {
  title: string;
  icon: string;
  iconColor: string;
  onBackPress: () => void;
  onSubmitPress: () => void;
}

export const TestHeader: React.FC<TestHeaderProps> = ({
  title,
  icon,
  iconColor,
  onBackPress,
  onSubmitPress,
}) => {
  return (
    <View style={styles.topHeader}>
      <TouchableOpacity
        onPress={onBackPress}
        activeOpacity={0.8}
        style={styles.backButton}
      >
        <ChevronLeft size={22} color="#111827" />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.submitIconButton}>
        <MaterialCommunityIcons
          name={icon as any}
          size={26}
          color={iconColor}
          onPress={onSubmitPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2ff",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 8,
  },
  submitIconButton: { backgroundColor: "#e0f2fe", padding: 8, borderRadius: 16 },
});
