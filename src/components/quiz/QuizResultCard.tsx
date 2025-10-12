import { QuizResult } from '@models/quiz/quiz.common';
import React, { useState } from 'react';
import { ScrollView, Text, View, ViewStyle } from 'react-native';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { PokemonRewardModal } from './PokemonRewardModal';

interface QuizResultCardProps {
  result: QuizResult;
  onRetakeQuiz?: () => void;
  onViewDetails?: () => void;
  onContinue?: () => void;
  style?: ViewStyle;
}

export const QuizResultCard: React.FC<QuizResultCardProps> = ({
  result,
  onRetakeQuiz,
  onViewDetails,
  onContinue,
  style,
}) => {
  const [showPokemonModal, setShowPokemonModal] = useState(false);
  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#059669'; // green
    if (score >= 80) return '#0891b2'; // blue
    if (score >= 70) return '#ca8a04'; // yellow
    if (score >= 60) return '#ea580c'; // orange
    return '#dc2626'; // red
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 90) return 'Xuất sắc! 🌟';
    if (score >= 80) return 'Tốt lắm! 👍';
    if (score >= 70) return 'Khá tốt! 👌';
    if (score >= 60) return 'Cần cải thiện 📚';
    return 'Hãy cố gắng hơn! 💪';
  };

  const getScoreEmoji = (score: number): string => {
    if (score >= 90) return '🎉';
    if (score >= 80) return '🎊';
    if (score >= 70) return '😊';
    if (score >= 60) return '😐';
    return '😔';
  };

  return (
    <Card style={[styles.container, style]}>
      <CardHeader>
        <CardTitle style={styles.title}>Kết quả Quiz</CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Score Section */}
          <View style={styles.scoreSection}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreEmoji}>{getScoreEmoji(result.score)}</Text>
              <Text style={[styles.scoreText, { color: getScoreColor(result.score) }]}>
                {result.score}%
              </Text>
            </View>
            <Text style={styles.scoreMessage}>{getScoreMessage(result.score)}</Text>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Progress 
                value={result.score} 
                style={[styles.progressBar, { backgroundColor: getScoreColor(result.score) }]} 
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
                  <Text style={styles.pokemonName}>{result.pokemonReward.name}</Text>
                  <View style={[
                    styles.rarityBadge,
                    { backgroundColor: getRarityColor(result.pokemonReward.rarity) }
                  ]}>
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
              <Text style={styles.achievementsTitle}>🏆 Thành tích đạt được</Text>
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
                {new Date(result.completedAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {onRetakeQuiz && (
              <Button
                variant="outline"
                onPress={onRetakeQuiz}
                style={styles.actionButton}
              >
                Làm lại
              </Button>
            )}
            {onViewDetails && (
              <Button
                variant="secondary"
                onPress={onViewDetails}
                style={styles.actionButton}
              >
                Xem chi tiết
              </Button>
            )}
            {onContinue && (
              <Button
                onPress={onContinue}
                style={styles.actionButton}
              >
                Tiếp tục
              </Button>
            )}
          </View>
        </ScrollView>
      </CardContent>

      {/* Pokemon Reward Modal */}
      {result.pokemonReward && (
        <PokemonRewardModal
          visible={showPokemonModal}
          pokemon={result.pokemonReward}
          onClose={() => setShowPokemonModal(false)}
          onClaim={() => {
            // Handle claiming Pokemon reward
            console.log('Pokemon claimed:', result.pokemonReward);
          }}
        />
      )}
    </Card>
  );
};

const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'LEGENDARY': return '#fbbf24';
    case 'EPIC': return '#a855f7';
    case 'RARE': return '#3b82f6';
    case 'UNCOMMON': return '#10b981';
    case 'COMMON': return '#6b7280';
    default: return '#6b7280';
  }
};

const getRarityText = (rarity: string): string => {
  switch (rarity) {
    case 'LEGENDARY': return 'HUYỀN THOẠI';
    case 'EPIC': return 'EPIC';
    case 'RARE': return 'HIẾM';
    case 'UNCOMMON': return 'KHÔNG PHỔ BIẾN';
    case 'COMMON': return 'PHỔ BIẾN';
    default: return 'PHỔ BIẾN';
  }
};

const styles = {
  container: {
    margin: 16,
    maxHeight: '90%',
  },
  title: {
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  scoreSection: {
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  scoreContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 8,
  },
  scoreEmoji: {
    fontSize: 32,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '700' as const,
  },
  scoreMessage: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 24,
    gap: 12,
  },
  statItem: {
    alignItems: 'center' as const,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    minWidth: '45%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center' as const,
  },
  rewardSection: {
    marginBottom: 24,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  pokemonCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dbeafe',
  },
  pokemonImageContainer: {
    marginRight: 12,
  },
  pokemonImagePlaceholder: {
    fontSize: 40,
  },
  pokemonInfo: {
    flex: 1,
  },
  pokemonName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 8,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 12,
  },
  achievementItem: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  achievementText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500' as const,
  },
  quizInfo: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  quizInfoLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 12,
  },
  quizInfoRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  quizInfoKey: {
    fontSize: 14,
    color: '#6b7280',
  },
  quizInfoValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#111827',
  },
  actionButtons: {
    flexDirection: 'row' as const,
    gap: 12,
    justifyContent: 'center' as const,
  },
  actionButton: {
    flex: 1,
  },
  viewPokemonButton: {
    marginTop: 12,
    alignSelf: 'center',
  },
};
