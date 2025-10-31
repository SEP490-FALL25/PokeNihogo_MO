import { Button } from '@components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { ROUTES } from '@routes/routes';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function QuizDemoScreen() {
  const [isCreating, setIsCreating] = useState(false);

  const handleStartQuiz = async (category: string, level: string, difficulty: string) => {
    try {
      setIsCreating(true);
      // Create quiz session directly and navigate to quiz
      const { quizService } = await import('@services/quiz');
      const response = await quizService.createQuizSession({
        category,
        level: level as 'N5' | 'N4' | 'N3',
        difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
        questionCount: 5 // Demo with 5 questions
      });

      if (response.statusCode === 201 && response.data?.session) {
        router.push({
          pathname: ROUTES.QUIZ.SESSION,
          params: { exerciseAttemptId: response.data.session.id }
        });
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const quizCategories = [
    {
      id: 'vocabulary',
      title: 'Từ vựng',
      description: 'Kiểm tra vốn từ vựng tiếng Nhật',
      icon: '📚',
      color: '#4CAF50',
      level: 'N5',
      difficulty: 'beginner',
    },
    {
      id: 'grammar',
      title: 'Ngữ pháp',
      description: 'Ôn tập các điểm ngữ pháp cơ bản',
      icon: '📝',
      color: '#2196F3',
      level: 'N5',
      difficulty: 'beginner',
    },
    {
      id: 'kanji',
      title: 'Kanji',
      description: 'Luyện tập nhận biết và viết Kanji',
      icon: '🈴',
      color: '#FF9800',
      level: 'N5',
      difficulty: 'intermediate',
    },
    {
      id: 'listening',
      title: 'Nghe hiểu',
      description: 'Rèn luyện kỹ năng nghe tiếng Nhật',
      icon: '🎧',
      color: '#9C27B0',
      level: 'N5',
      difficulty: 'intermediate',
    },
    {
      id: 'reading',
      title: 'Đọc hiểu',
      description: 'Nâng cao khả năng đọc hiểu',
      icon: '📖',
      color: '#F44336',
      level: 'N4',
      difficulty: 'intermediate',
    },
    {
      id: 'mixed',
      title: 'Tổng hợp',
      description: 'Quiz tổng hợp tất cả các kỹ năng',
      icon: '🎯',
      color: '#607D8B',
      level: 'N5',
      difficulty: 'advanced',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Quiz Demo</Text>
          <Text style={styles.subtitle}>
            Chọn loại quiz để bắt đầu kiểm tra kiến thức tiếng Nhật của bạn
          </Text>
        </View>

        <View style={styles.categoriesContainer}>
          {quizCategories.map((category) => (
            <Card key={category.id} style={[styles.categoryCard, { borderLeftColor: category.color }]}>
              <CardHeader style={styles.categoryHeader}>
                <View style={styles.categoryTitleRow}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <View style={styles.categoryTitleContainer}>
                    <CardTitle style={styles.categoryTitle}>{category.title}</CardTitle>
                    <Text style={styles.categoryLevel}>{category.level} • {category.difficulty}</Text>
                  </View>
                </View>
              </CardHeader>
              
              <CardContent style={styles.categoryContent}>
                <Text style={styles.categoryDescription}>{category.description}</Text>
                
                <View style={styles.categoryActions}>
                  <Button
                    onPress={() => handleStartQuiz(category.id, category.level, category.difficulty)}
                    loading={isCreating}
                    style={[styles.startButton, { backgroundColor: category.color }]}
                  >
                    Bắt đầu Quiz
                  </Button>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Thao tác nhanh</Text>
          
          <View style={styles.quickActionsGrid}>
            <Button
              variant="outline"
              onPress={() => handleStartQuiz('mixed', 'N5', 'beginner')}
              style={styles.quickActionButton}
            >
              Quiz Nhanh
            </Button>
            
            <Button
              variant="outline"
              onPress={() => router.push(ROUTES.QUIZ.HISTORY as any)}
              style={styles.quickActionButton}
            >
              Lịch sử Quiz
            </Button>
            
            {/* <Button
              variant="outline"
              onPress={() => router.push(ROUTES.QUIZ.STATS)}
              style={styles.quickActionButton}
            >
              Thống kê
            </Button> */}
          </View>
        </View>

        {/* Features Info */}
        <Card style={styles.featuresCard}>
          <CardHeader>
            <CardTitle style={styles.featuresTitle}>Tính năng Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✅</Text>
                <Text style={styles.featureText}>Câu hỏi đa dạng: trắc nghiệm, nhiều đáp án, điền từ</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎧</Text>
                <Text style={styles.featureText}>Hỗ trợ câu hỏi âm thanh và hình ảnh</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🏆</Text>
                <Text style={styles.featureText}>Hệ thống điểm và thành tích</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎁</Text>
                <Text style={styles.featureText}>Phần thưởng Pokemon sau khi hoàn thành</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <Text style={styles.featureText}>Thống kê chi tiết tiến độ học tập</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  categoriesContainer: {
    padding: 16,
    gap: 16,
  },
  categoryCard: {
    borderLeftWidth: 4,
  },
  categoryHeader: {
    paddingBottom: 8,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryLevel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryContent: {
    paddingTop: 0,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  categoryActions: {
    alignItems: 'flex-end',
  },
  startButton: {
    minWidth: 120,
  },
  quickActions: {
    padding: 16,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: 120,
  },
  featuresCard: {
    margin: 16,
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 18,
    marginBottom: 0,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
});
