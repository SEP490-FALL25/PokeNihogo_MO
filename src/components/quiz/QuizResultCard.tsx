import { QuizResult } from "@models/quiz/quiz.common";
import React, { useState } from "react";
import { Text, View, ViewStyle } from "react-native";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Progress } from "../ui/Progress";
import { PokemonRewardModal } from "./PokemonRewardModal";

interface QuizResultCardProps {
  result: QuizResult;
  onRetakeQuiz?: () => void;
  onTryDifferentQuiz?: () => void;
  onViewHistory?: () => void;
  onGoHome?: () => void;
  style?: ViewStyle;
}

export const QuizResultCard: React.FC<QuizResultCardProps> = ({
  result,
  onRetakeQuiz,
  onTryDifferentQuiz,
  onViewHistory,
  onGoHome,
  style,
}) => {
  const [showPokemonModal, setShowPokemonModal] = useState(false);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "#059669"; // green
    if (score >= 80) return "#0891b2"; // blue
    if (score >= 70) return "#ca8a04"; // yellow
    if (score >= 60) return "#ea580c"; // orange
    return "#dc2626"; // red
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 90) return "Xuất sắc! 🌟";
    if (score >= 80) return "Tốt lắm! 👍";
    if (score >= 70) return "Khá tốt! 👌";
    if (score >= 60) return "Cần cải thiện 📚";
    return "Hãy cố gắng hơn! 💪";
  };

  const getScoreEmoji = (score: number): string => {
    if (score >= 90) return "🎉";
    if (score >= 80) return "🎊";
    if (score >= 70) return "😊";
    if (score >= 60) return "😐";
    return "😔";
  };

  return (
    <>
      <Card style={[styles.container, style]}>
        <CardHeader>
          <CardTitle style={styles.title}>Kết quả Quiz</CardTitle>
        </CardHeader>

        <CardContent>
          <View>
            {/* Score Section */}
            <View style={styles.scoreSection}>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreEmoji}>
                  {getScoreEmoji(result.score)}
                </Text>
                <Text
                  style={[
                    styles.scoreText,
                    { color: getScoreColor(result.score) },
                  ]}
                >
                  {result.score}%
                </Text>
              </View>
              <Text style={styles.scoreMessage}>
                {getScoreMessage(result.score)}
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Progress
                  value={result.score}
                  style={[
                    styles.progressBar,
                    { backgroundColor: getScoreColor(result.score) },
                  ]}
                />
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{result.correctAnswers}</Text>
                <Text style={styles.statLabel}>Câu đúng</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{result.totalQuestions}</Text>
                <Text style={styles.statLabel}>Tổng câu hỏi</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{result.earnedPoints}</Text>
                <Text style={styles.statLabel}>Điểm kiếm được</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{result.timeSpent}m</Text>
                <Text style={styles.statLabel}>Thời gian</Text>
              </View>
            </View>

            {/* Pokemon Reward */}
            {result.pokemonReward && (
              <View style={styles.rewardSection}>
                <Text style={styles.rewardTitle}>🎁 Phần thưởng Pokemon!</Text>
                <View style={styles.pokemonCard}>
                  <View style={styles.pokemonImageContainer}>
                    <Text style={styles.pokemonImagePlaceholder}>🦄</Text>
                  </View>
                  <View style={styles.pokemonInfo}>
                    <Text style={styles.pokemonName}>
                      {result.pokemonReward.name}
                    </Text>
                    <View
                      style={[
                        styles.rarityBadge,
                        {
                          backgroundColor: getRarityColor(
                            result.pokemonReward.rarity
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.rarityText}>
                        {getRarityText(result.pokemonReward.rarity)}
                      </Text>
                    </View>
                  </View>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setShowPokemonModal(true)}
                    style={styles.viewPokemonButton}
                  >
                    Xem chi tiết
                  </Button>
                </View>
              </View>
            )}

            {/* Achievements */}
            {result.achievements && result.achievements.length > 0 && (
              <View style={styles.achievementsSection}>
                <Text style={styles.achievementsTitle}>
                  🏆 Thành tích đạt được
                </Text>
                {result.achievements.map((achievement, index) => (
                  <View key={index} style={styles.achievementItem}>
                    <Text style={styles.achievementText}>{achievement}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Quiz Info */}
            <View style={styles.quizInfo}>
              <Text style={styles.quizInfoLabel}>Thông tin Quiz</Text>
              <View style={styles.quizInfoRow}>
                <Text style={styles.quizInfoKey}>Chủ đề:</Text>
                <Text style={styles.quizInfoValue}>{result.category}</Text>
              </View>
              <View style={styles.quizInfoRow}>
                <Text style={styles.quizInfoKey}>Trình độ:</Text>
                <Text style={styles.quizInfoValue}>{result.level}</Text>
              </View>
              <View style={styles.quizInfoRow}>
                <Text style={styles.quizInfoKey}>Hoàn thành:</Text>
                <Text style={styles.quizInfoValue}>
                  {new Date(result.completedAt).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {onRetakeQuiz && (
                <Button
                  onPress={onRetakeQuiz}
                  style={styles.primaryActionButton}
                >
                  Làm lại Quiz
                </Button>
              )}
              
              <View style={styles.secondaryButtons}>
                {onTryDifferentQuiz && (
                  <Button
                    variant="outline"
                    onPress={onTryDifferentQuiz}
                    style={styles.secondaryButton}
                  >
                    Quiz khác
                  </Button>
                )}
                {onViewHistory && (
                  <Button
                    variant="outline"
                    onPress={onViewHistory}
                    style={styles.secondaryButton}
                  >
                    Lịch sử
                  </Button>
                )}
              </View>
              
              {onGoHome && (
                <Button 
                  variant="ghost" 
                  onPress={onGoHome} 
                  style={styles.homeButton}
                >
                  Về trang chủ
                </Button>
              )}
            </View>
          </View>
        </CardContent>

        {/* Pokemon Reward Modal */}
        {result.pokemonReward && (
          <PokemonRewardModal
            visible={showPokemonModal}
            pokemon={result.pokemonReward}
            onClose={() => setShowPokemonModal(false)}
            onClaim={() => {
              // Handle claiming Pokemon reward
              console.log("Pokemon claimed:", result.pokemonReward);
            }}
          />
        )}
      </Card>
    </>
  );
};

const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case "LEGENDARY":
      return "#fbbf24";
    case "EPIC":
      return "#a855f7";
    case "RARE":
      return "#3b82f6";
    case "UNCOMMON":
      return "#10b981";
    case "COMMON":
      return "#6b7280";
    default:
      return "#6b7280";
  }
};

const getRarityText = (rarity: string): string => {
  switch (rarity) {
    case "LEGENDARY":
      return "HUYỀN THOẠI";
    case "EPIC":
      return "EPIC";
    case "RARE":
      return "HIẾM";
    case "UNCOMMON":
      return "KHÔNG PHỔ BIẾN";
    case "COMMON":
      return "PHỔ BIẾN";
    default:
      return "PHỔ BIẾN";
  }
};

const styles = {
  container: {
    margin: 16,
    borderRadius: 12,
    overflow: "hidden" as const,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    textAlign: "center" as const,
    marginBottom: 8,
    fontSize: 24,
    fontWeight: "600" as const,
    color: "#111827",
  },
  scoreSection: {
    alignItems: "center" as const,
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  scoreContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 16,
    marginBottom: 12,
  },
  scoreEmoji: {
    fontSize: 40,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: "#3b82f6",
  },
  scoreMessage: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 16,
    textAlign: "center" as const,
  },
  progressContainer: {
    width: "90%" as const,
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
  },
  statsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "space-between" as const,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 16,
    borderRadius: 12,
    width: "47%" as const,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#3b82f6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center" as const,
    fontWeight: "500" as const,
  },
  rewardSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 16,
    textAlign: "center" as const,
  },
  pokemonCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pokemonImageContainer: {
    marginRight: 12,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ffffff",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pokemonImagePlaceholder: {
    fontSize: 24,
  },
  pokemonInfo: {
    flex: 1,
  },
  pokemonName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 8,
  },
  rarityBadge: {
    alignSelf: "flex-start" as const,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#ffffff",
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
  },
  achievementsSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 16,
    textAlign: "center" as const,
  },
  achievementItem: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  achievementText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500" as const,
  },
  quizInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quizInfoLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 12,
    textAlign: "center" as const,
  },
  quizInfoRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
    paddingVertical: 2,
  },
  quizInfoKey: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500" as const,
  },
  quizInfoValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
  },
  actionButtons: {
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 32,
  },
  primaryActionButton: {
    height: 48,
  },
  secondaryButtons: {
    flexDirection: "row" as const,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 44,
  },
  homeButton: {
    alignSelf: "center" as const,
    marginTop: 8,
  },
  viewPokemonButton: {
    marginTop: 12,
    alignSelf: "center" as const,
  },
};
