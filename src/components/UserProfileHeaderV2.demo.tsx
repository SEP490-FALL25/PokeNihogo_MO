import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { UserProfileDataV2, UserProfileHeaderV2 } from "./UserProfileHeaderV2";

// Sample user data for demonstration
const sampleUsers: UserProfileDataV2[] = [
  {
    name: "Ash Ketchum",
    level: 5,
    currentExp: 750,
    expToNextLevel: 1000,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
];

export function UserProfileHeaderV2Demo() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleContainer}>
        <UserProfileHeaderV2 user={sampleUsers[0]} style={styles.header} />
      </View>

      <View style={styles.examplesContainer}>
        {sampleUsers.map((user, index) => (
          <UserProfileHeaderV2
            key={index}
            user={user}
            style={styles.exampleHeader}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  titleContainer: {
    alignItems: "center",
  },
  header: {
    width: "100%",
    maxWidth: 400,
  },
  examplesContainer: {
    gap: 12,
  },
  exampleHeader: {
    width: "100%",
  },
});
