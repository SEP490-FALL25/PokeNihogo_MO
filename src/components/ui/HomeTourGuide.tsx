import React from "react";
import { View } from "react-native";

interface HomeTourGuideProps {
  children: React.ReactNode;
}

/**
 * HomeTourGuide Component
 * 
 * Wraps the home screen elements with CopilotStep for tour guide functionality.
 * This component provides step-by-step guidance for:
 * - User profile header
 * - DraggableOverlay (Pokemon partner)
 * - Store icon
 * - Quest icon  
 * - Gacha icon
 * - Main navigation
 */
export default function HomeTourGuide({ children }: HomeTourGuideProps) {
  // Now a simple wrapper – steps are attached to real elements where they are defined
  return <View style={{ flex: 1 }}>{children}</View>;
}
