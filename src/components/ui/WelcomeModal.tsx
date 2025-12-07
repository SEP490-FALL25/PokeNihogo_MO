import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useCopilot } from "react-native-copilot";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { IconSymbol } from "./IconSymbol";

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
  username: string;
  pokemonName: string;
}

export default function WelcomeModal({
  visible,
  onClose,
  username,
  pokemonName,
}: WelcomeModalProps) {
  const { t } = useTranslation();
  const { start } = useCopilot();

  const handleBegin = useCallback(() => {
    onClose();
    // Delay to ensure modal close animation finishes before tour starts
    setTimeout(() => {
      start?.();
    }, 300);
  }, [onClose, start]);
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <Pressable style={styles.overlay}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <ThemedView style={styles.modalContainer}>
          <LinearGradient
            colors={["#3b82f6", "#1d4ed8", "#1e40af"]}
            style={styles.gradientBackground}
          >
            <View style={styles.content}>

              {/* Welcome Icon */}
              <View style={styles.iconContainer}>
                <IconSymbol name="party.popper" size={48} color="#ffffff" />
              </View>

              {/* Welcome Message */}
              <ThemedText style={styles.welcomeTitle}>
                {t("welcome_modal.title", { username })}
              </ThemedText>

              <ThemedText style={styles.welcomeMessage}>
                {t("welcome_modal.message", { pokemonName })}
              </ThemedText>

              {/* Action Button */}
              <Pressable style={styles.actionButton} onPress={handleBegin}>
                <ThemedText style={styles.actionButtonText}>
                  {t("welcome_modal.lets_begin")}
                </ThemedText>
              </Pressable>
            </View>
          </LinearGradient>
        </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    overflow: "hidden",},
  gradientBackground: {
    padding: 24,
  },
  content: {
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  welcomeMessage: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,},
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e40af",
    textAlign: "center",
  },
});
