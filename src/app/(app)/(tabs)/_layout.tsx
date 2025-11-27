import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import CustomTab from "@components/ui/CustomTab";

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen name="home" options={{ title: t("tabs.home") }} />
        <Tabs.Screen name="learn" options={{ title: t("tabs.learn") }} />
        <Tabs.Screen name="abilities" options={{ title: t("tabs.abilities") }} />
        {/* Old separate tabs - now combined in abilities screen */}
        <Tabs.Screen name="reading" options={{ title: t("tabs.reading"), href: null }} />
        <Tabs.Screen name="listening" options={{ title: t("tabs.listening"), href: null }} />
        <Tabs.Screen name="speaking" options={{ title: t("tabs.speaking"), href: null }} />
        <Tabs.Screen name="battle" options={{ title: t("tabs.battle") }} />
        <Tabs.Screen name="quiz-demo" options={{ title: t("tabs.quiz_demo") }} />
      </Tabs>
      <CustomTab />
    </>
  );
}
