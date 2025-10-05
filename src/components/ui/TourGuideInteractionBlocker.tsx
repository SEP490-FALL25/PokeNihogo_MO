import React from 'react';
import { StyleSheet, View } from 'react-native';

interface TourGuideInteractionBlockerProps {
  active: boolean;
  onPress?: () => void;
}

export default function TourGuideInteractionBlocker({ 
  active, 
  onPress 
}: TourGuideInteractionBlockerProps) {
  if (!active) return null;

  return (
    <View 
      style={styles.blocker}
      onTouchEnd={onPress}
    />
  );
}

const styles = StyleSheet.create({
  blocker: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000, // Higher than ScrollView and all content
    backgroundColor: 'transparent',
    // This will block all touches to underlying content including scroll
  },
});
