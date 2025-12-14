import { ThemedText } from "@components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: string;
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  retryText?: string;
  pokemonTheme?: boolean;
  style?: any;
  titleStyle?: any;
  descriptionStyle?: any;
  errorStyle?: any;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  error,
  icon = "warning",
  iconSize = 48,
  iconColor = "#ef4444",
  showRetry = true,
  onRetry,
  retryText,
  pokemonTheme = true,
  style,
  titleStyle,
  descriptionStyle,
  errorStyle,
}) => {
  const { t } = useTranslation();
  
  const defaultTitle = title || t("error_state.default_title");
  const defaultDescription = description || t("error_state.default_description");
  const defaultRetryText = retryText || t("error_state.default_retry");
  return (
    <View style={[styles.container, pokemonTheme && styles.pokemonContainer, style]}>
      <View style={[styles.iconContainer, pokemonTheme && styles.pokemonIconContainer]}>
        <MaterialIcons
          name={icon as any}
          size={iconSize}
          color={iconColor}
        />
        {pokemonTheme && (
          <View style={styles.warningContainer}>
            <MaterialIcons name="error" size={16} color="#fbbf24" />
          </View>
        )}
      </View>
      
      <ThemedText 
        type="subtitle" 
        style={[styles.title, pokemonTheme && styles.pokemonTitle, titleStyle]}
      >
        {defaultTitle}
      </ThemedText>
      
      <ThemedText 
        style={[styles.description, pokemonTheme && styles.pokemonDescription, descriptionStyle]}
      >
        {defaultDescription}
      </ThemedText>

      {error && (
        <View style={[styles.errorContainer, pokemonTheme && styles.pokemonErrorContainer]}>
          <ThemedText style={[styles.errorText, pokemonTheme && styles.pokemonErrorText, errorStyle]}>
            {error}
          </ThemedText>
        </View>
      )}

      {showRetry && onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, pokemonTheme && styles.pokemonRetryButton]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <MaterialIcons name="refresh" size={16} color="#ffffff" />
          <ThemedText style={[styles.retryText, pokemonTheme && styles.pokemonRetryText]}>
            {defaultRetryText}
          </ThemedText>
        </TouchableOpacity>
      )}

      {pokemonTheme && (
        <View style={styles.pokemonFooter}>
          <ThemedText style={styles.pokemonFooterText}>
            {t("error_state.pokemon_footer")}
          </ThemedText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    marginVertical: 16,},
  pokemonContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ef4444",},
  iconContainer: {
    marginBottom: 16,
    position: "relative",
  },
  pokemonIconContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 50,
    padding: 20,
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  warningContainer: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 4,},
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 8,
    textAlign: "center",
  },
  pokemonTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#dc2626",
    marginBottom: 12,
    textShadowColor: "rgba(239, 68, 68, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  pokemonDescription: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
    fontWeight: "500",
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#ef4444",
  },
  pokemonErrorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    marginBottom: 20,
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    textAlign: "center",
    fontFamily: "monospace",
  },
  pokemonErrorText: {
    fontSize: 13,
    color: "#b91c1c",
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,},
  pokemonRetryButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,},
  retryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  pokemonRetryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  pokemonFooter: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  pokemonFooterText: {
    fontSize: 14,
    color: "#b91c1c",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ErrorState;
