import { Tabs } from "expo-router";
import React from "react";

import CustomTabBar from "@components/ui/CustomTabBar";
import CustomTab  from "@components/ui/CustomTab";

export default function TabLayout() {

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
    </>
  );
}
