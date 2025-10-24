import { StyleSheet } from "react-native";

// Common styles for lesson-related components
export const lessonStyles = StyleSheet.create({
  // Card styles
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  cardLarge: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },

  // Header styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },

  // Progress styles
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  
  progressText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },

  // Stats styles
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  
  progressStatItem: {
    alignItems: "center",
  },
  
  progressStatNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 4,
  },
  
  progressStatLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },

  // Icon styles
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  
  iconContainerLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  // Text styles
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  
  description: {
    fontSize: 14,
    color: "#6b7280",
  },

  // Status styles
  statusCompleted: {
    fontSize: 12,
    fontWeight: "500",
    color: "#059669",
  },
  
  statusInProgress: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2563eb",
  },
  
  statusNotStarted: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },

  // Section styles
  section: {
    marginBottom: 20,
  },
  
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },

  // Spacing
  bottomSpacing: {
    height: 80,
  },
});
