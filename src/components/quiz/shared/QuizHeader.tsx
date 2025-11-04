import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QuizHeaderProps {
  title: string;
  onBackPress: () => void;
  onSubmitPress?: () => void;
  submitDisabled?: boolean;
  submitIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export function QuizHeader({
  title,
  onBackPress,
  onSubmitPress,
  submitDisabled = false,
  submitIcon = "notebook-check",
}: QuizHeaderProps) {
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
      {onSubmitPress ? (
        <TouchableOpacity
          onPress={onSubmitPress}
          activeOpacity={0.8}
          style={styles.submitIconButton}
          disabled={submitDisabled}
        >
          <MaterialCommunityIcons name={submitIcon} size={26} color="#0ea5e9" />
        </TouchableOpacity>
      ) : (
        <View style={styles.submitIconButton}>
          <MaterialCommunityIcons name="eye" size={22} color="#0ea5e9" />
        </View>
      )}
    </View>
  );
}

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
  submitIconButton: {
    backgroundColor: "#e0f2fe",
    padding: 8,
    borderRadius: 16,
  },
});
