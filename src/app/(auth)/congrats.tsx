import { HelloWave } from "@components/HelloWave";
import BackScreen from "@components/mocules/Back";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import BounceButton from "@components/ui/BounceButton";
import { ROUTES } from "@routes/routes";
import { router } from "expo-router";
import React from "react";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CongratsScreen() {
  const handleGoHome = () => {
    router.replace(ROUTES.AUTH.WELCOME);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{ flex: 1, paddingHorizontal: 20, paddingTop: 4 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <BackScreen noWrapper />
        </View>

        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              paddingVertical: 8,
              paddingHorizontal: 14,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <ThemedText>Hurray!!</ThemedText>
          </View>

          <Image
            source={{
              uri: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
            }}
            style={{ width: 220, height: 220, marginBottom: 20 }}
          />
          <ThemedText
            type="title"
            style={{ textAlign: "center", marginBottom: 8 }}
          >
            Welcome <HelloWave />
          </ThemedText>
          <ThemedText style={{ textAlign: "center", color: "#6b7280" }}>
            Your profile has been created successfully.
          </ThemedText>
        </View>

        <View style={{ paddingBottom: 16 }}>
          <BounceButton
            size="full"
            variant="solid"
            withHaptics
            onPress={handleGoHome}
          >
            CONTINUE TO HOME
          </BounceButton>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
