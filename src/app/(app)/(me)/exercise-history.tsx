import BackScreen from '@components/molecules/Back';
import { Skeleton } from '@components/ui/Skeleton';
import { ExerciseAttemptStatus } from '@constants/exercise.enum';
import { useHistoryExercises, useHistoryTests } from '@hooks/useUserHistory';
import { IHistoryItem } from '@models/user-history/user-history.response';
import { ROUTES } from '@routes/routes';
import {
  getExerciseStatusBgColor,
  getExerciseStatusColor,
  getExerciseStatusText,
} from '@utils/exercise-status.utils';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BookOpen, FileText, Trophy } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

// Removed unused width variable

// Helper function to format date
const formatDate = (dateString: string, t: (key: string, options?: any) => string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return t('exercise_history.just_now');
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return t('exercise_history.minutes_ago', { minutes });
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return t('exercise_history.hours_ago', { hours });
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return t('exercise_history.days_ago', { days });
  }
  
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });
};


// Helper function to get score color
const getScoreColor = (score: number | null): string => {
  if (score === null) return '#94a3b8'; // gray for no score
  if (score >= 80) return '#10b981'; // green
  if (score >= 60) return '#f59e0b'; // yellow
  return '#ef4444'; // red
};

// History Card Component (for both exercises and tests)
interface HistoryCardProps {
  item: IHistoryItem;
  onPress: () => void;
  t: (key: string) => string;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ item, onPress, t }) => {
  const isTest = !!item.testId;
  const itemName = item.testName || item.exerciseName || t('exercise_history.unknown_item');
  const scoreColor = getScoreColor(item.score);
  const hasScore = item.score !== null;
  
  // Check if can review (score >= 80%)
  const canReview = item.score !== null && item.score >= 80;
  const isInProgress = item.status === ExerciseAttemptStatus.IN_PROGRESS;
  const canPress = canReview || isInProgress;

  return (
    <Pressable 
      onPress={canPress ? onPress : undefined} 
      disabled={!canPress}
      className="mb-4"
      style={{ opacity: canPress ? 1 : 0.6 }}
    >
      <LinearGradient
        colors={['#ffffff', '#fafbfc']}
        style={styles.card}
        className="rounded-3xl p-5 overflow-hidden shadow-lg"
      >
        {/* Card Header */}
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-2">
              {isTest ? (
                <FileText size={18} color="#3b82f6" strokeWidth={2.5} />
              ) : (
                <BookOpen size={18} color="#a855f7" strokeWidth={2.5} />
              )}
              <Text className="ml-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                {isTest ? t('exercise_history.test') : t('exercise_history.exercise')}
              </Text>
            </View>
            <Text className="text-lg font-extrabold text-slate-800 mb-1 tracking-tight" numberOfLines={2}>
              {itemName}
            </Text>
            <Text className="text-sm font-semibold text-slate-500 tracking-wide">
              {formatDate(item.updatedAt, t)}
            </Text>
          </View>
          
          {/* Score Badge */}
          {hasScore ? (
            <View
              style={[styles.scoreBadge, { backgroundColor: `${scoreColor}15` }]}
              className="px-3 py-1.5 rounded-2xl"
            >
              <Text style={{ color: scoreColor }} className="text-lg font-extrabold">
                {item.score}%
              </Text>
            </View>
          ) : (
            <View
              style={[styles.scoreBadge, { backgroundColor: '#f1f5f9' }]}
              className="px-3 py-1.5 rounded-2xl"
            >
              <Text style={{ color: '#94a3b8' }} className="text-sm font-bold">
                {getExerciseStatusText(item.status, t)}
              </Text>
            </View>
          )}
        </View>

        {/* Card Body - Stats */}
        <View className="pt-4 border-t border-slate-100">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Trophy size={18} color="#f59e0b" strokeWidth={2.5} />
              <Text className="ml-2 text-sm font-semibold text-slate-600">
                {item.correctAnswers}/{item.totalQuestions} {t('exercise_history.correct')}
              </Text>
            </View>
            {item.incorrectAnswers > 0 && (
              <Text className="text-sm font-semibold text-slate-500">
                {item.incorrectAnswers} {t('exercise_history.incorrect')}
              </Text>
            )}
          </View>
          
          {/* Status Badge */}
          <View className="flex-row items-center justify-between">
            <View
              style={[styles.statusBadge, {
                backgroundColor: getExerciseStatusBgColor(item.status),
              }]}
              className="px-3 py-1 rounded-xl"
            >
              <Text
                style={{
                  color: getExerciseStatusColor(item.status),
                }}
                className="text-xs font-bold uppercase tracking-wide"
              >
                {getExerciseStatusText(item.status, t)}
              </Text>
            </View>
            {item.score !== null && item.score < 80 && (
              <Text className="text-xs font-semibold text-slate-400">
                {t('exercise_history.review_requirement')}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
};

export default function ExerciseHistoryScreen() {
  const { t } = useTranslation();
  const pageSize = 10;

  const {
    data: exercisesData,
    isLoading: isLoadingExercises,
    isError: isErrorExercises,
    fetchNextPage: fetchNextExercises,
    hasNextPage: hasNextExercises,
    isFetchingNextPage: isFetchingNextExercises,
    refetch: refetchExercises,
    isRefetching: isRefetchingExercises,
  } = useHistoryExercises({
    pageSize,
  });

  const {
    data: testsData,
    isLoading: isLoadingTests,
    isError: isErrorTests,
    fetchNextPage: fetchNextTests,
    hasNextPage: hasNextTests,
    isFetchingNextPage: isFetchingNextTests,
    refetch: refetchTests,
    isRefetching: isRefetchingTests,
  } = useHistoryTests({
    pageSize,
  });

  // Combine and sort history items by updatedAt (newest first)
  const combinedHistory = useMemo(() => {
    const exercises = exercisesData?.pages.flatMap((page) => page.data?.results ?? []) ?? [];
    const tests = testsData?.pages.flatMap((page) => page.data?.results ?? []) ?? [];
    
    const all = [...exercises, ...tests];
    
    // Sort by updatedAt descending (newest first)
    return all.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });
  }, [exercisesData, testsData]);

  const isLoading = isLoadingExercises || isLoadingTests;
  const isError = isErrorExercises || isErrorTests;
  const isRefetching = isRefetchingExercises || isRefetchingTests;
  const isFetchingNext = isFetchingNextExercises || isFetchingNextTests;
  const hasNextPage = hasNextExercises || hasNextTests;

  const handleItemPress = (item: IHistoryItem) => {
    // Only allow review if score >= 80%
    const canReview = item.score !== null && item.score >= 80;
    
    if (canReview) {
      if (item.testId) {
        // Navigate to test review
        router.push({
          pathname: ROUTES.TEST.REVIEW,
          params: { userTestAttemptId: item.attemptId.toString() },
        });
      } else if (item.exerciseId) {
        // Navigate to exercise review
        router.push({
          pathname: ROUTES.QUIZ.REVIEW,
          params: { sessionId: item.attemptId.toString() },
        });
      }
    } else if (item.status === ExerciseAttemptStatus.IN_PROGRESS) {
      // Navigate to continue if in progress
      if (item.testId) {
        router.push({
          pathname: ROUTES.TEST.TEST,
          params: { testId: item.testId.toString() },
        });
      }
    }
    // If score < 80%, do nothing (can't review)
  };

  const handleRefresh = () => {
    refetchExercises();
    refetchTests();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNext) {
      fetchNextExercises();
      fetchNextTests();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <BackScreen onPress={() => router.back()} color="black" title={t('exercise_history.title')} />

      {/* Content */}
      <View className="flex-1 px-4">
        {isLoading ? (
          <View className="flex-1">
            {Array.from({ length: 5 }, (_, i) => (
              <View key={i} className="mb-4">
                <Skeleton style={styles.cardSkeleton} className="rounded-3xl" />
              </View>
            ))}
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-slate-500 font-semibold mb-4">
              {t('exercise_history.load_error')}
            </Text>
            <Pressable
              onPress={handleRefresh}
              className="bg-teal-500 px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-bold">{t('exercise_history.retry')}</Text>
            </Pressable>
          </View>
        ) : combinedHistory.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <BookOpen size={64} color="#94a3b8" strokeWidth={1.5} />
            <Text className="text-xl font-bold text-slate-600 mt-4 mb-2">
              {t('exercise_history.empty_title')}
            </Text>
            <Text className="text-sm text-slate-500 text-center px-8">
              {t('exercise_history.empty_description')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={combinedHistory}
            keyExtractor={(item) => `${item.testId ? 'test' : 'exercise'}-${item.attemptId}`}
            renderItem={({ item }) => (
              <HistoryCard
                item={item}
                onPress={() => handleItemPress(item)}
                t={t}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                colors={['#6FAFB2']}
              />
            }
            ListFooterComponent={
              isFetchingNext ? (
                <View className="py-4">
                  <ActivityIndicator size="large" color="#6FAFB2" />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#6FAFB2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  scoreBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  filterContainer: {
    paddingVertical: 8,
  },
  filterButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSkeleton: {
    width: '100%',
    height: 180,
    backgroundColor: '#f1f5f9',
  },
  listContent: {
    paddingBottom: 20,
  },
});


