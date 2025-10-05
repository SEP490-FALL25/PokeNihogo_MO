import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function CustomTabBarBackground() {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        tint="systemChromeMaterial"
        intensity={100}
        style={styles.blurContainer}
      />
    );
  }

  // For Android, use a regular View with background
  return <View style={styles.androidContainer} />;
}

const styles = StyleSheet.create({
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  androidContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
});
