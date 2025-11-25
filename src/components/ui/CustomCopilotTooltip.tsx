import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCopilot } from "react-native-copilot";
import { useTranslation } from "react-i18next";

/**
 * Custom tooltip component for react-native-copilot
 * Uses i18n for translated button labels
 */
export default function CustomCopilotTooltip() {
  const { t } = useTranslation();
  const {
    isFirstStep,
    isLastStep,
    goToNext,
    goToPrev,
    stop,
    currentStep,
  } = useCopilot();

  return (
    <View style={styles.tooltip}>
      <Text style={styles.tooltipText}>{currentStep?.text}</Text>
      <View style={styles.buttonContainer}>
        {!isFirstStep && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={goToPrev}
            >
              <Text style={styles.buttonTextSecondary}>
                {t("tour.previous", "Trước")}
              </Text>
            </TouchableOpacity>
            <View style={styles.buttonSpacer} />
          </>
        )}
        {isLastStep ? (
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={stop}
          >
            <Text style={styles.buttonTextPrimary}>
              {t("tour.finish", "Kết thúc")}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={goToNext}
            >
              <Text style={styles.buttonTextPrimary}>
                {t("tour.next", "Tiếp theo")}
              </Text>
            </TouchableOpacity>
            <View style={styles.buttonSpacer} />
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={stop}
            >
              <Text style={styles.buttonTextSecondary}>
                {t("tour.skip", "Bỏ qua")}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    minWidth: 280,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipText: {
    fontSize: 15,
    color: "#111827",
    lineHeight: 22,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#3b82f6",
  },
  buttonSecondary: {
    backgroundColor: "transparent",
  },
  buttonTextPrimary: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonSpacer: {
    width: 8,
  },
});

