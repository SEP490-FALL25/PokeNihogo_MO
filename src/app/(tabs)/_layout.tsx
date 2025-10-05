import { Tabs } from "expo-router";
import React from "react";

import CustomTab from "@components/ui/CustomTab";
import TourGuideInteractionBlocker from "@components/ui/TourGuideInteractionBlocker";
import { useUserStore } from "@stores/user/user.config";

export default function TabLayout() {
  const { isFirstTimeLogin, showWelcomeModal, isTourGuideActive } = useUserStore();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="learn" options={{ title: "Learn" }} />
        <Tabs.Screen name="reading" options={{ title: "Reading" }} />
        <Tabs.Screen name="home" options={{ title: "Home" }} />
        <Tabs.Screen name="listening" options={{ title: "Listening" }} />
        <Tabs.Screen name="battle" options={{ title: "Battle" }} />
      </Tabs>
      {/* <CustomTabBar /> */}
      <CustomTab />
      
      {/* Global Tour Guide Interaction Blocker - Blocks everything including bottom tabs */}
      <TourGuideInteractionBlocker 
        active={isFirstTimeLogin === true && !showWelcomeModal && !isTourGuideActive}
      />
    </>
  );
}
