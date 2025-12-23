import BackScreen from '@components/molecules/Back';
import { ConfirmModal } from '@components/ui/ConfirmModal';
import { Skeleton } from '@components/ui/Skeleton';
import { ExerciseAttemptStatus } from '@constants/exercise.enum';
import { useCheckReviewAccess } from '@hooks/useUserExerciseAttempt';
import { useHistoryExercises, useHistoryTests } from '@hooks/useUserHistory';
import { useCheckReviewAccessTest } from '@hooks/useUserTestAttempt';
import { IHistoryItem } from '@models/user-history/user-history.response';
import { useFocusEffect } from '@react-navigation/native';
import { ROUTES } from '@routes/routes';
import {
  getExerciseStatusBgColor,
  getExerciseStatusColor,
  getExerciseStatusText,
} from '@utils/exercise-status.utils';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BookOpen, Eye, FileText, Trophy } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

// ============================================================================
// CONSTANTS
// ============================================================================
type TabType = 'exercises' | 'tests';

const PAGE_SIZE = 10;
const MIN_REVIEW_SCORE = 80;
const SKELETON_COUNT = 3;
const END_REACHED_THRESHOLD = 0.4;

// Time constants (in seconds)
const ONE_MINUTE = 60;
const ONE_HOUR = 3600;
const ONE_DAY = 86400;
const ONE_WEEK = 604800;

// Score thresholds
const SCORE_EXCELLENT = 80;
const SCORE_GOOD = 60;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

const formatDate = (dateString: string, t: (key: string, options?: any) => string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < ONE_MINUTE) return t('exercise_history.just_now');
  if (diffInSeconds < ONE_HOUR) {
    const minutes = Math.floor(diffInSeconds / ONE_MINUTE);
    return t('exercise_history.minutes_ago', { minutes });
  }
  if (diffInSeconds < ONE_DAY) {
    const hours = Math.floor(diffInSeconds / ONE_HOUR);
    return t('exercise_history.hours_ago', { hours });
  }
  if (diffInSeconds < ONE_WEEK) {
    const days = Math.floor(diffInSeconds / ONE_DAY);
    return t('exercise_history.days_ago', { days });
  }
  
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getScoreColor = (score: number | null): string => {
  if (score === null) return '#94a3b8';
  if (score >= SCORE_EXCELLENT) return '#10b981';
  if (score >= SCORE_GOOD) return '#f59e0b';
  return '#ef4444';
};

// ============================================================================
// COMPONENTS
// ============================================================================
interface StatisticsCardProps {
  allTime: number;
  allAttempts: number;
  completedAttempts: number;
  failedAttempts: number;
  skippedAttempts: number;
  abandonedAttempts: number;
  t: (key: string, options?: any) => string;
  activeStatusFilter: ExerciseAttemptStatus | 'all';
  onStatusFilterChange: (status: ExerciseAttemptStatus | 'all') => void;
}

const StatisticsCard = React.memo<StatisticsCardProps>(({
  allTime,
  allAttempts,
  completedAttempts,
  failedAttempts,
  skippedAttempts,
  abandonedAttempts,
  t,
  activeStatusFilter,
  onStatusFilterChange,
}) => {
  const handleStatusToggle = useCallback((status: ExerciseAttemptStatus) => {
    onStatusFilterChange(activeStatusFilter === status ? 'all' : status);
  }, [activeStatusFilter, onStatusFilterChange]);

  return (
    <LinearGradient
      colors={['#ffffff', '#f8fafc']}
      style={styles.statsCard}
      className="rounded-3xl p-5 mb-4"
    >
      <Text className="text-lg font-extrabold text-slate-800 mb-4">
        {t('exercise_history.statistics')}
      </Text>
      
      {/* Main Stats Row */}
      <View className="flex-row mb-4">
        <View className="flex-1 items-center">
          <View className="bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl px-4 py-3 mb-2 w-full items-center" style={{ backgroundColor: '#14b8a6' }}>
            <Text className="text-3xl font-extrabold text-white">{allAttempts}</Text>
          </View>
          <Text className="text-xs font-bold text-slate-600 text-center">
            {t('exercise_history.total_attempts')}
          </Text>
        </View>
        
        <View className="flex-1 items-center mx-2">
          <View className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl px-4 py-3 mb-2 w-full items-center" style={{ backgroundColor: '#f59e0b' }}>
            <Text className="text-3xl font-extrabold text-white">{formatTime(allTime)}</Text>
          </View>
          <Text className="text-xs font-bold text-slate-600 text-center">
            {t('exercise_history.total_time')}
          </Text>
        </View>
      </View>

      {/* Status Stats Grid */}
      <View className="flex-row flex-wrap">
        <Pressable
          className="w-1/2 pr-1 mb-2"
          onPress={() => handleStatusToggle(ExerciseAttemptStatus.COMPLETED)}
        >
          <View
            style={[
              styles.statusTile,
              {
                backgroundColor: '#ecfdf5',
                borderColor:
                  activeStatusFilter === ExerciseAttemptStatus.COMPLETED
                    ? '#059669'
                    : '#bbf7d0',
              },
              activeStatusFilter === ExerciseAttemptStatus.COMPLETED && styles.statusTileActive,
            ]}
          >
            <Text className="text-2xl font-extrabold text-green-600">{completedAttempts}</Text>
            <Text className="text-xs font-semibold text-green-700 mt-0.5">
              {t('exercise_history.completed')}
            </Text>
          </View>
        </Pressable>
        
        <Pressable
          className="w-1/2 pl-1 mb-2"
          onPress={() => handleStatusToggle(ExerciseAttemptStatus.FAILED)}
        >
          <View
            style={[
              styles.statusTile,
              {
                backgroundColor: '#fef2f2',
                borderColor:
                  activeStatusFilter === ExerciseAttemptStatus.FAILED ? '#dc2626' : '#fecaca',
              },
              activeStatusFilter === ExerciseAttemptStatus.FAILED && styles.statusTileActive,
            ]}
          >
            <Text className="text-2xl font-extrabold text-red-600">{failedAttempts}</Text>
            <Text className="text-xs font-semibold text-red-700 mt-0.5">
              {t('exercise_history.failed')}
            </Text>
          </View>
        </Pressable>
        
        <Pressable
          className="w-1/2 pr-1"
          onPress={() => handleStatusToggle(ExerciseAttemptStatus.SKIPPED)}
        >
          <View
            style={[
              styles.statusTile,
              {
                backgroundColor: '#f8fafc',
                borderColor:
                  activeStatusFilter === ExerciseAttemptStatus.SKIPPED ? '#475569' : '#e2e8f0',
              },
              activeStatusFilter === ExerciseAttemptStatus.SKIPPED && styles.statusTileActive,
            ]}
          >
            <Text className="text-2xl font-extrabold text-slate-600">{skippedAttempts}</Text>
            <Text className="text-xs font-semibold text-slate-700 mt-0.5">
              {t('exercise_history.skipped')}
            </Text>
          </View>
        </Pressable>
        
        <Pressable
          className="w-1/2 pl-1"
          onPress={() => handleStatusToggle(ExerciseAttemptStatus.ABANDONED)}
        >
          <View
            style={[
              styles.statusTile,
              {
                backgroundColor: '#fff7ed',
                borderColor:
                  activeStatusFilter === ExerciseAttemptStatus.ABANDONED ? '#ea580c' : '#fed7aa',
              },
              activeStatusFilter === ExerciseAttemptStatus.ABANDONED && styles.statusTileActive,
            ]}
          >
            <Text className="text-2xl font-extrabold text-orange-600">{abandonedAttempts}</Text>
            <Text className="text-xs font-semibold text-orange-700 mt-0.5">
              {t('exercise_history.abandoned')}
            </Text>
          </View>
        </Pressable>
      </View>
    </LinearGradient>
  );
});

StatisticsCard.displayName = 'StatisticsCard';

interface HistoryCardProps {
  item: IHistoryItem;
  onPress: () => void;
  t: (key: string) => string;
  allHistoryItems: IHistoryItem[];
}

const HistoryCard = React.memo<HistoryCardProps>(({ item, onPress, t, allHistoryItems }) => {
  const isTest = !!item.testId;
  const isPlacementTest = useMemo(() => {
    if (!isTest || !item.testType) return false;
    return item.testType.toUpperCase().includes('PLACEMENT');
  }, [isTest, item.testType]);
  const itemName = useMemo(
    () => item.testName || item.exerciseName || t('exercise_history.unknown_item'),
    [item.testName, item.exerciseName, t]
  );
  const scoreColor = useMemo(() => getScoreColor(item.score), [item.score]);
  const hasScore = item.score !== null;
  const isSkipped = item.status === ExerciseAttemptStatus.SKIPPED;
  
  // Check if there's any previous attempt of the same exercise/test with score >= 80%
  const hasPreviousHighScore = useMemo(() => {
    if (isTest) {
      // For tests, check if there's another attempt with same testId and score >= 80%
      return allHistoryItems.some(
        (otherItem) =>
          otherItem.testId === item.testId &&
          otherItem.attemptId !== item.attemptId &&
          otherItem.score !== null &&
          otherItem.score >= MIN_REVIEW_SCORE
      );
    } else {
      // For exercises, check if there's another attempt with same exerciseId and score >= 80%
      return allHistoryItems.some(
        (otherItem) =>
          otherItem.exerciseId === item.exerciseId &&
          otherItem.attemptId !== item.attemptId &&
          otherItem.score !== null &&
          otherItem.score >= MIN_REVIEW_SCORE
      );
    }
  }, [allHistoryItems, item, isTest]);
  
  // Check if can review (current score >= 80% OR has previous high score)
  // For placement tests, always allow review regardless of score
  const canReview = useMemo(() => {
    if (isPlacementTest) return true; // Placement tests don't need 80% check
    if (item.score === null) return false;
    return item.score >= MIN_REVIEW_SCORE || hasPreviousHighScore;
  }, [item.score, hasPreviousHighScore, isPlacementTest]);

  return (
    <Pressable 
      onPress={onPress}
      disabled={isSkipped}
      className="mb-4"
    >
      <LinearGradient
        colors={['#ffffff', '#fafbfc']}
        style={[
          styles.card,
          isSkipped && { opacity: 0.6 },
        ]}
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
            {item.score !== null && (
              <>
                {canReview ? (
                  <View className="flex-row items-center">
                    <Eye size={14} color="#10b981" strokeWidth={2} />
                    <Text className="text-xs font-semibold text-green-600 ml-1.5">
                      {t('exercise_history.can_review')}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-xs font-semibold text-slate-400">
                    {t('exercise_history.review_requirement')}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
});

HistoryCard.displayName = 'HistoryCard';

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ExerciseHistoryScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('exercises');
  const [statusFilter, setStatusFilter] = useState<ExerciseAttemptStatus | 'all'>('all');
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });
  
  const { mutate: checkReviewAccess } = useCheckReviewAccess();
  const { mutate: checkReviewAccessTest } = useCheckReviewAccessTest();

  const {
    data: exercisesData,
    isLoading: isLoadingExercises,
    isError: isErrorExercises,
    fetchNextPage: fetchNextExercises,
    hasNextPage: hasNextExercises,
    isFetchingNextPage: isFetchingNextExercises,
    refetch: refetchExercises,
    isRefetching: isRefetchingExercises,
  } = useHistoryExercises({ pageSize: PAGE_SIZE });

  const {
    data: testsData,
    isLoading: isLoadingTests,
    isError: isErrorTests,
    fetchNextPage: fetchNextTests,
    hasNextPage: hasNextTests,
    isFetchingNextPage: isFetchingNextTests,
    refetch: refetchTests,
    isRefetching: isRefetchingTests,
  } = useHistoryTests({ pageSize: PAGE_SIZE });

  useEffect(() => {
    if (!isLoadingExercises && hasNextExercises && !isFetchingNextExercises) {
      fetchNextExercises();
    }
  }, [isLoadingExercises, hasNextExercises, isFetchingNextExercises, fetchNextExercises]);

  useEffect(() => {
    if (!isLoadingTests && hasNextTests && !isFetchingNextTests) {
      fetchNextTests();
    }
  }, [isLoadingTests, hasNextTests, isFetchingNextTests, fetchNextTests]);

  // Refetch data every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      // Refetch both exercises and tests when screen is focused
      refetchExercises();
      refetchTests();
    }, [refetchExercises, refetchTests])
  );

  // Sort function for history items
  const sortByDate = useCallback((a: IHistoryItem, b: IHistoryItem) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  }, []);

  // Get exercises list sorted by updatedAt (newest first)
  const exercisesList = useMemo(() => {
    const exercises = exercisesData?.pages.flatMap((page) => page.data?.results ?? []) ?? [];
    return exercises.sort(sortByDate);
  }, [exercisesData, sortByDate]);

  // Get tests list sorted by updatedAt (newest first)
  const testsList = useMemo(() => {
    const tests = testsData?.pages.flatMap((page) => page.data?.results ?? []) ?? [];
    return tests.sort(sortByDate);
  }, [testsData, sortByDate]);

  // Get statistics from the first page
  const exercisesStats = useMemo(() => {
    const firstPage = exercisesData?.pages[0]?.data;
    return {
      allTime: firstPage?.allTime ?? 0,
      allAttempts: firstPage?.allAttempts ?? 0,
      completedAttempts: firstPage?.completedAttempts ?? 0,
      failedAttempts: firstPage?.failedAttempts ?? 0,
      skippedAttempts: firstPage?.skippedAttempts ?? 0,
      abandonedAttempts: firstPage?.abandonedAttempts ?? 0,
    };
  }, [exercisesData]);

  const testsStats = useMemo(() => {
    const firstPage = testsData?.pages[0]?.data;
    return {
      allTime: firstPage?.allTime ?? 0,
      allAttempts: firstPage?.allAttempts ?? 0,
      completedAttempts: firstPage?.completedAttempts ?? 0,
      failedAttempts: firstPage?.failedAttempts ?? 0,
      skippedAttempts: firstPage?.skippedAttempts ?? 0,
      abandonedAttempts: firstPage?.abandonedAttempts ?? 0,
    };
  }, [testsData]);

  // Get current data based on active tab
  const currentData = activeTab === 'exercises' ? exercisesList : testsList;
  const currentStats = activeTab === 'exercises' ? exercisesStats : testsStats;
  const isLoading = activeTab === 'exercises' ? isLoadingExercises : isLoadingTests;
  const isError = activeTab === 'exercises' ? isErrorExercises : isErrorTests;
  const isRefetching = activeTab === 'exercises' ? isRefetchingExercises : isRefetchingTests;
  const isFetchingNext = activeTab === 'exercises' ? isFetchingNextExercises : isFetchingNextTests;
  const hasNextPage = activeTab === 'exercises' ? hasNextExercises : hasNextTests;

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') {
      return currentData;
    }
    return currentData.filter((item) => item.status === statusFilter);
  }, [currentData, statusFilter]);

  const handleItemPress = useCallback((item: IHistoryItem) => {
    if (item.status === ExerciseAttemptStatus.SKIPPED) {
      return;
    }

    const isAbandoned = item.status === ExerciseAttemptStatus.ABANDONED;
    const isInProgress = item.status === ExerciseAttemptStatus.IN_PROGRESS;
    const isPlacementTest = item.testId && item.testType && item.testType.toUpperCase().includes('PLACEMENT');
    
    // If in progress or abandoned, navigate to continue (no need to check review access)
    if (isInProgress || isAbandoned) {
      if (item.testId) {
        router.push({
          pathname: ROUTES.TEST.TEST,
          params: { testId: item.testId.toString() },
        });
      } else if (item.exerciseId) {
        router.push({
          pathname: ROUTES.QUIZ.QUIZ,
          params: {
            exerciseAttemptId: item.attemptId.toString(),
            lessonId: "",
          },
        });
      }
      return;
    }
    
    // For review cases, check access first
    if (item.testId) {
      // Placement tests don't need review access check
      if (isPlacementTest) {
        router.push({
          pathname: ROUTES.TEST.REVIEW,
          params: { 
            userTestAttemptId: item.attemptId.toString(),
            testType: item.testType || "",
          },
        });
        return;
      }
      
      // Check test review access
      checkReviewAccessTest(
        {
          userTestAttemptId: item.attemptId.toString(),
          testType: item.testType || "",
        },
        {
          onSuccess: (response: any) => {
            // Check statusCode in response (hooks already return res.data)
            // Response structure: { statusCode, message, data: {...} }
            if (response?.statusCode === 403) {
              const errorMsg = response?.message || t('exercise_history.no_review_access', 'Bạn không đủ điều kiện để xem đáp án');
              setErrorModal({ visible: true, message: errorMsg });
              return;
            }
            
            // If no 403, navigate to review
            router.push({
              pathname: ROUTES.TEST.REVIEW,
              params: { 
                userTestAttemptId: item.attemptId.toString(),
                testType: item.testType || "",
              },
            });
          },
          onError: (error: any) => {
            // Handle error response - check if it's 403 in error response
            // Error structure from axios: error.response.data = { statusCode, message, data: {...} }
            const errorData = error?.response?.data;
            if (errorData?.statusCode === 403) {
              const errorMsg = errorData?.message || t('exercise_history.no_review_access', 'Bạn không đủ điều kiện để xem đáp án');
              setErrorModal({ visible: true, message: errorMsg });
              return;
            }
            
            // Other errors
            const errorMsg = errorData?.message || error?.message || t('exercise_history.review_error', 'Không thể xem đáp án');
            setErrorModal({ visible: true, message: errorMsg });
          },
        }
      );
    } else if (item.exerciseId) {
      // Check exercise review access
      checkReviewAccess(item.attemptId.toString(), {
        onSuccess: (response: any) => {
          // Check statusCode in response (hooks already return res.data)
          // Response structure: { statusCode, message, data: {...} }
          if (response?.statusCode === 403) {
            const errorMsg = response?.message || t('exercise_history.no_review_access', 'Bạn không đủ điều kiện để xem đáp án');
            setErrorModal({ visible: true, message: errorMsg });
            return;
          }
          
          // If no 403, navigate to review
          router.push({
            pathname: ROUTES.QUIZ.REVIEW,
            params: { sessionId: item.attemptId.toString() },
          });
        },
        onError: (error: any) => {
          // Handle error response - check if it's 403 in error response
          // Error structure from axios: error.response.data = { statusCode, message, data: {...} }
          const errorData = error?.response?.data;
          if (errorData?.statusCode === 403) {
            const errorMsg = errorData?.message || t('exercise_history.no_review_access', 'Bạn không đủ điều kiện để xem đáp án');
            setErrorModal({ visible: true, message: errorMsg });
            return;
          }
          
          // Other errors
          const errorMsg = errorData?.message || error?.message || t('exercise_history.review_error', 'Không thể xem đáp án');
          setErrorModal({ visible: true, message: errorMsg });
        },
      });
    }
  }, [checkReviewAccess, checkReviewAccessTest, t]);

  const handleRefresh = useCallback(() => {
    if (activeTab === 'exercises') {
      refetchExercises();
    } else {
      refetchTests();
    }
  }, [activeTab, refetchExercises, refetchTests]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNext) {
      if (activeTab === 'exercises') {
        fetchNextExercises();
      } else {
        fetchNextTests();
      }
    }
  }, [activeTab, hasNextPage, isFetchingNext, fetchNextExercises, fetchNextTests]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setStatusFilter('all');
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <StatusBar barStyle="dark-content" />
      
      {/* Error Modal */}
      <ConfirmModal
        visible={errorModal.visible}
        title={t('common.error', 'Lỗi')}
        message={errorModal.message}
        buttons={[
          {
            label: t('common.ok', 'OK'),
            onPress: () => setErrorModal({ visible: false, message: '' }),
            variant: 'primary',
          },
        ]}
        onRequestClose={() => setErrorModal({ visible: false, message: '' })}
      />

      {/* Header */}
      <BackScreen onPress={() => router.back()} color="black" title={t('exercise_history.title')} />

      {/* Tab Selection */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row bg-white rounded-2xl p-1.5 shadow-sm">
          <Pressable
            onPress={() => handleTabChange('exercises')}
            className={`flex-1 py-3 rounded-xl ${
              activeTab === 'exercises' ? 'bg-purple-500' : 'bg-transparent'
            }`}
            style={activeTab === 'exercises' ? styles.activeTabShadow : undefined}
          >
            <View className="flex-row items-center justify-center">
              <BookOpen 
                size={18} 
                color={activeTab === 'exercises' ? '#ffffff' : '#94a3b8'} 
                strokeWidth={2.5}
              />
              <Text
                className={`ml-2 font-bold text-sm ${
                  activeTab === 'exercises' ? 'text-white' : 'text-slate-400'
                }`}
              >
                {t('exercise_history.exercises_tab')}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => handleTabChange('tests')}
            className={`flex-1 py-3 rounded-xl ${
              activeTab === 'tests' ? 'bg-blue-500' : 'bg-transparent'
            }`}
            style={activeTab === 'tests' ? styles.activeTabShadow : undefined}
          >
            <View className="flex-row items-center justify-center">
              <FileText 
                size={18} 
                color={activeTab === 'tests' ? '#ffffff' : '#94a3b8'} 
                strokeWidth={2.5}
              />
              <Text
                className={`ml-2 font-bold text-sm ${
                  activeTab === 'tests' ? 'text-white' : 'text-slate-400'
                }`}
              >
                {t('exercise_history.tests_tab')}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-4">
        {isLoading ? (
          <View className="flex-1">
            {/* Statistics Skeleton */}
            <View className="mb-4">
              <Skeleton style={styles.statsSkeleton} className="rounded-3xl" />
            </View>
            {/* Cards Skeleton */}
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
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
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => `${item.testId ? 'test' : 'exercise'}-${item.attemptId}`}
            renderItem={({ item }) => (
              <HistoryCard 
                item={item} 
                onPress={() => handleItemPress(item)} 
                t={t}
                allHistoryItems={filteredData}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              filteredData.length === 0 && { flexGrow: 1 },
            ]}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={END_REACHED_THRESHOLD}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                colors={['#6FAFB2']}
              />
            }
            ListHeaderComponent={
              <StatisticsCard
                allTime={currentStats.allTime}
                allAttempts={currentStats.allAttempts}
                completedAttempts={currentStats.completedAttempts}
                failedAttempts={currentStats.failedAttempts}
                skippedAttempts={currentStats.skippedAttempts}
                abandonedAttempts={currentStats.abandonedAttempts}
                t={t}
                activeStatusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-12">
                {activeTab === 'exercises' ? (
                  <BookOpen size={64} color="#94a3b8" strokeWidth={1.5} />
                ) : (
                  <FileText size={64} color="#94a3b8" strokeWidth={1.5} />
                )}
                <Text className="text-xl font-bold text-slate-600 mt-4 mb-2">
                  {activeTab === 'exercises'
                    ? t('exercise_history.empty_exercises_title')
                    : t('exercise_history.empty_tests_title')}
                </Text>
                <Text className="text-sm text-slate-500 text-center px-8">
                  {statusFilter === 'all'
                    ? activeTab === 'exercises'
                      ? t('exercise_history.empty_exercises_description')
                      : t('exercise_history.empty_tests_description')
                    : `${t('exercise_history.empty_exercises_description')} (${getExerciseStatusText(
                        statusFilter as ExerciseAttemptStatus,
                        t,
                      )})`}
                </Text>
                {statusFilter !== 'all' && (
                  <Text className="text-xs text-slate-400 mt-2">
                    {t('exercise_history.review_requirement')}
                  </Text>
                )}
              </View>
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
  card: {},
  statsCard: {},
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
  statsSkeleton: {
    width: '100%',
    height: 240,
    backgroundColor: '#f1f5f9',
  },
  cardSkeleton: {
    width: '100%',
    height: 180,
    backgroundColor: '#f1f5f9',
  },
  listContent: {
    paddingBottom: 20,
  },
  activeTabShadow: {},
  statusTile: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  statusTileActive: {},
});

