import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { UserProfileDataV2 } from './UserProfileHeaderV2';
import UserProfileHeaderExpandable from './UserProfileHeader';

// Sample user data for demonstration
const sampleUsers: UserProfileDataV2[] = [
  {
    name: 'Ash Ketchum',
    level: 5,
    currentExp: 750,
    expToNextLevel: 1000,
  },
  {
    name: 'Misty Waterflower',
    level: 12,
    currentExp: 200,
    expToNextLevel: 500,
  },
  {
    name: 'Brock Harrison',
    level: 1,
    currentExp: 0,
    expToNextLevel: 100,
  },
  {
    name: 'Gary Oak',
    level: 25,
    currentExp: 999,
    expToNextLevel: 1000,
  },
];

export function UserProfileHeaderDemo() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleContainer}>
        <UserProfileHeaderExpandable
          user={sampleUsers[0]}
        />
      </View>
      
      <View style={styles.examplesContainer}>
        {sampleUsers.map((user, index) => (
          <UserProfileHeaderExpandable
            key={index}
            user={user}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  titleContainer: {
    alignItems: 'center',
  },
  header: {
    width: '100%',
    maxWidth: 400,
  },
  examplesContainer: {
    gap: 12,
  },
  exampleHeader: {
    width: '100%',
  },
});

