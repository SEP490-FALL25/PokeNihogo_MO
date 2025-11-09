import BackScreen from '@components/molecules/Back';
import { Skeleton } from '@components/ui/Skeleton';
import { useExerciseHistory } from '@hooks/useUserExerciseAttempt';
import { IExerciseHistoryItem } from '@models/user-exercise-attempt/user-exercise-attempt.response';
import { ROUTES } from '@routes/routes';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BookOpen, Clock, Target, Trophy } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
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

// Helper function to format time
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) return `${minutes}ph`;
  return `${minutes}ph ${remainingSeconds}s`;
};

// Helper function to get JLPT level text
const getJlptLevel = (levelJlpt: number): string => {
  return `N${levelJlpt}`;
};

// Helper function to get skill type display name
const getSkillTypeName = (exerciseType: string, t: (key: string) => string): string => {
  const typeMap: Record<string, string> = {
    reading: t('exercise_history.skill_types.reading'),
    listening: t('exercise_history.skill_types.listening'),
    speaking: t('exercise_history.skill_types.speaking'),
    vocabulary: t('exercise_history.skill_types.vocabulary'),
    grammar: t('exercise_history.skill_types.grammar'),
    kanji: t('exercise_history.skill_types.kanji'),
  };
  return typeMap[exerciseType.toLowerCase()] || exerciseType;
};

// Helper function to get score color
const getScoreColor = (score: number): string => {
  if (score >= 80) return '#10b981'; // green
  if (score >= 60) return '#f59e0b'; // yellow
  return '#ef4444'; // red
};

// Exercise Card Component
interface ExerciseCardProps {
  item: IExerciseHistoryItem;
  onPress: () => void;
  t: (key: string) => string;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ item, onPress, t }) => {
  const scoreColor = getScoreColor(item.score);
  const jlptLevel = getJlptLevel(item.levelJlpt);
  const skillTypeName = getSkillTypeName(item.exerciseType, t);

  return (
    <Pressable onPress={onPress} className="mb-4">
      <LinearGradient
        colors={['#ffffff', '#fafbfc']}
        style={styles.card}
        className="rounded-3xl p-5 overflow-hidden shadow-lg"
      >
        {/* Card Header */}
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1">
            <Text className="text-lg font-extrabold text-slate-800 mb-1 tracking-tight" numberOfLines={2}>
              {item.exerciseName || item.lesson?.titleJp || t('exercise_history.unknown_exercise')}
            </Text>
            <Text className="text-sm font-semibold text-slate-500 tracking-wide">
              {formatDate(item.completedAt, t)}
            </Text>
          </View>
          
          {/* Score Badge */}
          <View
            style={[styles.scoreBadge, { backgroundColor: `${scoreColor}15` }]}
            className="px-3 py-1.5 rounded-2xl"
          >
            <Text style={{ color: scoreColor }} className="text-lg font-extrabold">
              {item.score}%
            </Text>
          </View>
        </View>

        {/* Card Body - Info Grid */}
        <View className="flex-row flex-wrap gap-3 mb-4">
          {/* JLPT Level */}
          <View className="flex-row items-center bg-blue-50 px-3 py-2 rounded-xl">
            <Target size={16} color="#3b82f6" strokeWidth={2.5} />
            <Text className="ml-2 text-sm font-bold text-blue-600">
              {jlptLevel}
            </Text>
          </View>

          {/* Skill Type */}
          <View className="flex-row items-center bg-purple-50 px-3 py-2 rounded-xl">
            <BookOpen size={16} color="#a855f7" strokeWidth={2.5} />
            <Text className="ml-2 text-sm font-bold text-purple-600">
              {skillTypeName}
            </Text>
          </View>

          {/* Time */}
          <View className="flex-row items-center bg-orange-50 px-3 py-2 rounded-xl">
            <Clock size={16} color="#f97316" strokeWidth={2.5} />
            <Text className="ml-2 text-sm font-bold text-orange-600">
              {formatTime(item.time)}
            </Text>
          </View>
        </View>

        {/* Card Footer - Stats */}
        <View className="pt-4 border-t border-slate-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Trophy size={18} color="#f59e0b" strokeWidth={2.5} />
              <Text className="ml-2 text-sm font-semibold text-slate-600">
                {item.answeredCorrect}/{item.totalQuestions} {t('exercise_history.correct')}
              </Text>
            </View>
            <View
              style={[styles.statusBadge, {
                backgroundColor: item.status === 'COMPLETED' ? '#d1fae5' : '#fef3c7',
              }]}
              className="px-3 py-1 rounded-xl"
            >
              <Text
                style={{
                  color: item.status === 'COMPLETED' ? '#059669' : '#d97706',
                }}
                className="text-xs font-bold uppercase tracking-wide"
              >
                {item.status === 'COMPLETED' ? t('exercise_history.completed') : item.status}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
};

export default function ExerciseHistoryScreen() {
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useExerciseHistory({
    limit: 20,
    levelJlpt: selectedLevel,
    exerciseType: selectedType,
  });

  const exerciseHistory = useMemo(() => {
    return data?.pages.flatMap((page: any) => {
      // Axios wraps response in { data: ... }
      // Service returns { statusCode, message, data: { results, ... } }
      // So page.data = { statusCode, message, data: { results, ... } }
      const response = page.data as { data?: { results?: IExerciseHistoryItem[] } };
      return response?.data?.results ?? [];
    }) ?? [];
  }, [data]);

  const handleExercisePress = (item: IExerciseHistoryItem) => {
    // Navigate to review screen if available
    router.push({
      pathname: ROUTES.QUIZ.REVIEW,
      params: { sessionId: item.exerciseAttemptId.toString() },
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <BackScreen onPress={() => router.back()} color="black" title={t('exercise_history.title')} />

      {/* Filter Section */}
      <View className="px-4 pt-2 pb-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {/* Level Filter */}
          <Pressable
            className={`px-4 py-2 rounded-2xl mr-2 ${
              selectedLevel === undefined ? 'bg-teal-500' : 'bg-white'
            }`}
            onPress={() => setSelectedLevel(undefined)}
            style={styles.filterButton}
          >
            <Text
              className={`text-sm font-bold ${
                selectedLevel === undefined ? 'text-white' : 'text-slate-700'
              }`}
            >
              {t('exercise_history.filters.all_levels')}
            </Text>
          </Pressable>
          {[5, 4, 3].map((level) => (
            <Pressable
              key={level}
              className={`px-4 py-2 rounded-2xl mr-2 ${
                selectedLevel === level ? 'bg-teal-500' : 'bg-white'
              }`}
              onPress={() => setSelectedLevel(level)}
              style={styles.filterButton}
            >
              <Text
                className={`text-sm font-bold ${
                  selectedLevel === level ? 'text-white' : 'text-slate-700'
                }`}
              >
                N{level}
              </Text>
            </Pressable>
          ))}

          {/* Type Filter */}
          <Pressable
            className={`px-4 py-2 rounded-2xl mr-2 ${
              selectedType === undefined ? 'bg-teal-500' : 'bg-white'
            }`}
            onPress={() => setSelectedType(undefined)}
            style={styles.filterButton}
          >
            <Text
              className={`text-sm font-bold ${
                selectedType === undefined ? 'text-white' : 'text-slate-700'
              }`}
            >
              {t('exercise_history.filters.all_types')}
            </Text>
          </Pressable>
        </ScrollView>
      </View>

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
        ) : exerciseHistory.length === 0 ? (
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
            data={exerciseHistory}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ExerciseCard
                item={item}
                onPress={() => handleExercisePress(item)}
                t={t}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                colors={['#6FAFB2']}
              />
            }
            ListFooterComponent={
              isFetchingNextPage ? (
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

