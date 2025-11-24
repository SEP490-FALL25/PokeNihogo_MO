/**
 * Color constants for reward history components
 */
export const REWARD_HISTORY_COLORS = {
  PRIMARY: "#22C55E",
  EXP_REWARD_BG: "#fef3c7",
  EXP_REWARD_TEXT: "#f59e0b",
  COIN_REWARD_BG: "#dbeafe",
  COIN_REWARD_TEXT: "#3b82f6",
  EXERCISE_BG: "#dcfce7",
  LESSON_BG: "#dbeafe",
  OTHER_BG: "#fef3c7",
  ERROR: "#ef4444",
  SLATE_500: "#64748b",
  SLATE_400: "#94a3b8",
} as const;

/**
 * Shadow styles for reward history components
 */
export const REWARD_HISTORY_SHADOW_STYLES = {
  card: {
    shadowColor: REWARD_HISTORY_COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statsCard: {
    shadowColor: REWARD_HISTORY_COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
} as const;

