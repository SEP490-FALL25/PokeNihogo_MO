import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TestSetContentProps {
  content: string;
  sectionIndex: number;
}

export const TestSetContent: React.FC<TestSetContentProps> = ({
  content,
  sectionIndex,
}) => {
  return (
    <View style={styles.contentCard}>
      <Text style={styles.sectionBadge}>Đoạn {sectionIndex + 1}</Text>
      <Text style={styles.contentText}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 10,
  },
  sectionBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    fontWeight: "700",
  },
  contentText: { fontSize: 16, color: "#111827", lineHeight: 24 },
});
