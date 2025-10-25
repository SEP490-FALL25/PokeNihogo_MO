// Shared utilities for lesson-related components

export const getJLPTLevelColor = (slug: string): string => {
  const colorMap: Record<string, string> = {
    "jlpt-n5": "#10b981",
    "jlpt-n4": "#3b82f6", 
    "jlpt-n3": "#8b5cf6",
    "jlpt-n2": "#f59e0b",
    "jlpt-n1": "#ef4444",
  };
  return colorMap[slug] || "#6b7280";
};

export const getSkillCategoryColor = (slug: string): string => {
  const colorMap: Record<string, string> = {
    reading: "#f59e0b",
    speaking: "#ef4444",
    listening: "#8b5cf6",
    grammar: "#3b82f6",
    vocabulary: "#10b981",
    writing: "#06b6d4",
    kanji: "#84cc16",
    conversation: "#f97316",
  };
  return colorMap[slug] || "#6b7280";
};

export const getSkillCategoryIcon = (slug: string): string => {
  const iconMap: Record<string, string> = {
    reading: "book.fill",
    speaking: "mic.fill",
    listening: "headphones",
    grammar: "doc.text.fill",
    vocabulary: "textformat.abc",
    writing: "pencil",
    kanji: "character",
    conversation: "bubble.left.and.bubble.right.fill",
  };
  return iconMap[slug] || "star.fill";
};

export const getDifficultyColor = (difficulty: string): string => {
  const colorMap: Record<string, string> = {
    beginner: "#10b981",
    intermediate: "#f59e0b",
    advanced: "#ef4444",
  };
  return colorMap[difficulty] || "#6b7280";
};

export const getTypeIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    vocabulary: "textformat.abc",
    grammar: "textformat.123",
    reading: "book.fill",
    listening: "headphones",
    kanji: "character",
  };
  return iconMap[type] || "doc.text";
};

export const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    vocabulary: "#10b981",
    grammar: "#f59e0b",
    reading: "#3b82f6",
    listening: "#8b5cf6",
    kanji: "#ef4444",
  };
  return colorMap[type] || "#6b7280";
};

export const getRarityColor = (rarity: string): string => {
  const colorMap: Record<string, string> = {
    COMMON: "#6b7280",
    UNCOMMON: "#3b82f6",
    RARE: "#8b5cf6",
    EPIC: "#a855f7",
    LEGENDARY: "#eab308",
  };
  return colorMap[rarity] || "#6b7280";
};

export const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  const iconMap: Record<string, string> = {
    "n5": "1.circle.fill",
    "n4": "2.circle.fill", 
    "n3": "3.circle.fill",
    "n2": "4.circle.fill",
    "n1": "5.circle.fill",
    vocabulary: "textformat.abc",
    grammar: "textformat.123",
    reading: "book.fill",
    listening: "headphones",
    speaking: "mic.fill",
    kanji: "character",
    conversation: "bubble.left.and.bubble.right.fill",
    writing: "pencil.and.outline",
  };
  return iconMap[name] || "folder.fill";
};
