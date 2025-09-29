import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, PressableProps } from 'react-native';

interface HapticPressableProps extends PressableProps {
  hapticType?: 'light' | 'medium' | 'heavy';
  children: React.ReactNode;
}

export function HapticPressable({ 
  hapticType = 'medium', 
  onPressIn, 
  children, 
  ...props 
}: HapticPressableProps) {
  
  const getHapticStyle = () => {
    switch (hapticType) {
      case 'light':
        return Haptics.ImpactFeedbackStyle.Light;
      case 'heavy':
        return Haptics.ImpactFeedbackStyle.Heavy;
      default:
        return Haptics.ImpactFeedbackStyle.Medium;
    }
  };

  const handlePressIn = (event: any) => {
    // Add haptic feedback
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(getHapticStyle());
    }
    
    // Call original onPressIn if provided
    onPressIn?.(event);
  };

  return (
    <Pressable
      {...props}
      onPressIn={handlePressIn}
    >
      {children}
    </Pressable>
  );
}
