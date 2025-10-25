import { useLanguage } from "@hooks/useLanguage";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LanguageSwitcherProps {
  showTitle?: boolean;
  compact?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  showTitle = true,
  compact = false,
}) => {
  const { changeLanguage, isEnglish, isVietnamese, isJapanese } = useLanguage();
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleLanguageChange = async (language: "en" | "vi" | "ja") => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    changeLanguage(language);
  };

  if (compact) {
    return (
      <Animated.View style={[styles.compactContainer, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.compactBackground}>
          <TouchableOpacity
            style={[
              styles.compactButton,
              isEnglish && styles.activeCompactButton,
            ]}
            onPress={() => handleLanguageChange("en")}
            activeOpacity={0.7}
          >
            <View style={styles.compactFlagContainer}>
              <Text style={styles.compactFlag}>🇺🇸</Text>
            </View>
            <Text
              style={[
                styles.compactButtonText,
                isEnglish && styles.activeCompactButtonText,
              ]}
            >
              EN
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.compactButton,
              isVietnamese && styles.activeCompactButton,
            ]}
            onPress={() => handleLanguageChange("vi")}
            activeOpacity={0.7}
          >
            <View style={styles.compactFlagContainer}>
              <Text style={styles.compactFlag}>🇻🇳</Text>
            </View>
            <Text
              style={[
                styles.compactButtonText,
                isVietnamese && styles.activeCompactButtonText,
              ]}
            >
              VI
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.compactButton,
              isJapanese && styles.activeCompactButton,
            ]}
            onPress={() => handleLanguageChange("ja")}
            activeOpacity={0.7}
          >
            <View style={styles.compactFlagContainer}>
              <Text style={styles.compactFlag}>🇯🇵</Text>
            </View>
            <Text
              style={[
                styles.compactButtonText,
                isJapanese && styles.activeCompactButtonText,
              ]}
            >
              JA
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      {showTitle && (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🌐 {t("settings.language")}</Text>
          <Text style={styles.subtitle}>{t("settings.language_subtitle")}</Text>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isEnglish && styles.activeButton]}
          onPress={() => handleLanguageChange("en")}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <View style={[styles.flagContainer, isEnglish && styles.activeFlagContainer]}>
              <Text style={styles.flag}>🇺🇸</Text>
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[styles.buttonText, isEnglish && styles.activeButtonText]}
              >
                English
              </Text>
              <Text
                style={[styles.subText, isEnglish && styles.activeSubText]}
              >
                United States
              </Text>
            </View>
          </View>
          {isEnglish && (
            <View style={styles.activeIndicator}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isVietnamese && styles.activeButton]}
          onPress={() => handleLanguageChange("vi")}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <View style={[styles.flagContainer, isVietnamese && styles.activeFlagContainer]}>
              <Text style={styles.flag}>🇻🇳</Text>
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[styles.buttonText, isVietnamese && styles.activeButtonText]}
              >
                Tiếng Việt
              </Text>
              <Text
                style={[styles.subText, isVietnamese && styles.activeSubText]}
              >
                Vietnam
              </Text>
            </View>
          </View>
          {isVietnamese && (
            <View style={styles.activeIndicator}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isJapanese && styles.activeButton]}
          onPress={() => handleLanguageChange("ja")}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <View style={[styles.flagContainer, isJapanese && styles.activeFlagContainer]}>
              <Text style={styles.flag}>🇯🇵</Text>
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[styles.buttonText, isJapanese && styles.activeButtonText]}
              >
                日本語
              </Text>
              <Text
                style={[styles.subText, isJapanese && styles.activeSubText]}
              >
                Japan
              </Text>
            </View>
          </View>
          {isJapanese && (
            <View style={styles.activeIndicator}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6b7280",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "column",
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative",
    overflow: "hidden",
  },
  activeButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  activeFlagContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  flag: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  activeButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  subText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "400",
  },
  activeSubText: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  activeIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  // Compact styles
  compactContainer: {
    alignItems: "center",
  },
  compactBackground: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  compactButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "transparent",
    minWidth: 60,
    alignItems: "center",
    flexDirection: "column",
  },
  activeCompactButton: {
    backgroundColor: "#007AFF",
  },
  compactFlagContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  compactFlag: {
    fontSize: 16,
  },
  compactButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeCompactButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});

export default LanguageSwitcher;
