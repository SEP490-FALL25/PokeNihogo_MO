import { QuizResultCard } from '@components/quiz/QuizResultCard';
import { Button } from '@components/ui/Button';
import { QuizResult } from '@models/quiz/quiz.common';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function QuizResultScreen() {
  const { resultId } = useLocalSearchParams<{ resultId: string }>();
  
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadQuizResult = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // In a real app, you would fetch the result by ID
      // For now, we'll create a mock result for demo purposes
      const mockResult: QuizResult = {
        sessionId: resultId || 'mock-session',
        userId: 'current-user',
        category: 'vocabulary',
        level: 'N5',
        totalQuestions: 5,
        correctAnswers: 4,
        score: 80,
        totalPoints: 50,
        earnedPoints: 40,
        timeSpent: 8,
        completedAt: new Date().toISOString(),
        pokemonReward: {
          id: 'eevee',
          name: 'Eevee',
          image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png',
          rarity: 'UNCOMMON',
        },
        achievements: ['Quiz Master', 'Knowledge Seeker'],
      };

      setResult(mockResult);
    } catch (error) {
      console.error('Error loading quiz result:', error);
      Alert.alert('Lỗi', 'Không thể tải kết quả quiz. Vui lòng thử lại.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [resultId]);

  useEffect(() => {
    loadQuizResult();
  }, [resultId, loadQuizResult]);

  const handleRetakeQuiz = () => {
    // Navigate to create new quiz
    router.replace('/quiz/create');
  };

  const handleViewDetails = () => {
    // Navigate to detailed results view
    Alert.alert('Thông báo', 'Tính năng xem chi tiết sẽ được phát triển trong phiên bản tiếp theo.');
  };

  const handleContinue = () => {
    // Navigate back to lessons or home
    router.replace('/(app)/(tabs)/home');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải kết quả...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy kết quả quiz</Text>
          <Button onPress={() => router.back()}>Quay lại</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <QuizResultCard
        result={result}
        onRetakeQuiz={handleRetakeQuiz}
        onViewDetails={handleViewDetails}
        onContinue={handleContinue}
        style={styles.resultCard}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc2626',
    marginBottom: 20,
  },
  resultCard: {
    flex: 1,
  },
});
