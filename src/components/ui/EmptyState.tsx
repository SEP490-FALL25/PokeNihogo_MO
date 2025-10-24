import { ThemedText } from "@components/ThemedText";
import { IconSymbol } from "@components/ui/IconSymbol";
import React from "react";
import { StyleSheet, View } from "react-native";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  pokemonTheme?: boolean;
  style?: any;
  titleStyle?: any;
  descriptionStyle?: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Không có dữ liệu",
  description = "Hiện tại chưa có dữ liệu để hiển thị",
  icon = "tray",
  iconSize = 48,
  iconColor = "#9ca3af",
  pokemonTheme = true,
  style,
  titleStyle,
  descriptionStyle,
}) => {
  return (
    <View style={[styles.container, pokemonTheme && styles.pokemonContainer, style]}>
      <View style={[styles.iconContainer, pokemonTheme && styles.pokemonIconContainer]}>
        <IconSymbol
          name={icon as any}
          size={iconSize}
          color={iconColor}
        />
        {pokemonTheme && (
          <View style={styles.sparkleContainer}>
            <IconSymbol name="sparkles" size={16} color="#fbbf24" />
          </View>
        )}
      </View>
      
      <ThemedText 
        type="subtitle" 
        style={[styles.title, pokemonTheme && styles.pokemonTitle, titleStyle]}
      >
        {title}
      </ThemedText>
      
      <ThemedText 
        style={[styles.description, pokemonTheme && styles.pokemonDescription, descriptionStyle]}
      >
        {description}
      </ThemedText>

      {pokemonTheme && (
        <View style={styles.pokemonFooter}>
          <ThemedText style={styles.pokemonFooterText}>
            🎮 Hãy tiếp tục hành trình học tập của bạn!
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
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  pokemonContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fbbf24",
    shadowColor: "#fbbf24",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 12,
  },
  iconContainer: {
    marginBottom: 16,
    position: "relative",
  },
  pokemonIconContainer: {
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderRadius: 50,
    padding: 20,
    borderWidth: 2,
    borderColor: "#fbbf24",
  },
  sparkleContainer: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#fbbf24",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "center",
  },
  pokemonTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    textShadowColor: "rgba(251, 191, 36, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
  },
  pokemonDescription: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
    fontWeight: "500",
  },
  pokemonFooter: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  pokemonFooterText: {
    fontSize: 14,
    color: "#92400e",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default EmptyState;
