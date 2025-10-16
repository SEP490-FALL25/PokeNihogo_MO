import BackScreen from '@components/molecules/Back';
import useAuth from '@hooks/useAuth';
import { useListPokemons } from '@hooks/usePokemonData';
import { IPokemon } from '@models/pokemon/pokemon.common';
import { ROUTES } from '@routes/routes';
import { formatDateToMMYYYY } from '@utils/date';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Calendar,
  ChevronRight,
  Cog,
  Flame,
  Shield,
  Sparkles,
  Star,
  Trophy
} from 'lucide-react-native';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Properly typed interfaces
interface LevelData {
  name: string;
  progress: number;
}

interface StatsData {
  learningPoints: number;
  streak: number;
  league: string;
}

interface Achievement {
  name: string;
  icon: string;
  colors: [string, string];
}

interface CollectionItem {
  id: number;
}

interface UserData {
  name: string;
  joinDate: string;
  avatarUrl: string;
  level: LevelData;
  stats: StatsData;
  achievements: Achievement[];
  collectionPreview: CollectionItem[];
}

const mockUserData: UserData = {
  name: 'Satoshi',
  joinDate: '10/2025',
  avatarUrl: 'https://cdn-icons-png.flaticon.com/512/219/219969.png',
  level: {
    name: 'Sơ cấp N5',
    progress: 0.75,
  },
  stats: {
    learningPoints: 12580,
    streak: 12,
    league: 'Bạc',
  },
  achievements: [
    { name: 'Tuần Hoàn Hảo', icon: '🎯', colors: ['#fbbf24', '#f59e0b'] },
    { name: 'Học Giả', icon: '🧠', colors: ['#e0e7ff', '#c7d2fe'] },
    { name: 'Lửa Nhiệt Huyết', icon: '🔥', colors: ['#fecaca', '#ef4444'] },
    { name: 'Thông Thái', icon: '🦉', colors: ['#ddd6fe', '#a78bfa'] },
    { name: 'Chăm Chỉ', icon: '✍️', colors: ['#d1fae5', '#34d399'] },
  ],
  collectionPreview: [{ id: 4 }, { id: 7 }, { id: 1 }]
};

// Properly typed StatItem component
interface StatItemProps {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  value: string | number;
  label: string;
  color: string;
  accentColor: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon: Icon, value, label, color, accentColor }) => (
  <View className="flex-1">
    <LinearGradient
      colors={['#ffffff', '#fafbfc']}
      style={[styles.statCard, {
        shadowColor: color,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 8,
      }]}
      className="items-center py-5 px-3 rounded-3xl bg-white"
    >
      {/* Icon Container with Gradient */}
      <LinearGradient
        colors={[`${color}20`, `${color}10`]}
        style={styles.iconContainer}
        className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
      >
        <Icon size={26} color={color} strokeWidth={2.8} />
      </LinearGradient>

      {/* Value */}
      <Text className="text-2xl font-extrabold text-slate-800 mb-1 tracking-tight">{value}</Text>

      {/* Label */}
      <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</Text>

      {/* Accent Line */}
      <View style={[styles.accentLine, { backgroundColor: accentColor }]} className="w-8 h-1 rounded-sm mt-3" />
    </LinearGradient>
  </View>
);

// Properly typed AchievementBadge component
interface AchievementBadgeProps {
  name: string;
  icon: string;
  colors: [string, string];
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ name, icon, colors }) => (
  <View className="items-center w-22">
    <View
      style={[styles.achievementBadgeShadow, {
        shadowColor: colors[1],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 12,
      }]}
      className="w-21 h-21 rounded-full mb-3"
    >
      <LinearGradient
        colors={colors}
        style={styles.achievementBadge}
        className="w-21 h-21 rounded-full items-center justify-center"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Inner Glow Effect */}
        <View className="w-18 h-18 bg-white/25 rounded-full items-center justify-center">
          <Text className="text-4xl">{icon}</Text>
        </View>
      </LinearGradient>
    </View>
    <Text className="text-xs font-extrabold text-slate-700 text-center tracking-wide" numberOfLines={2}>
      {name}
    </Text>
  </View>
);

export default function ProfileScreen() {
  const { user } = useAuth();
  const userProfile = user?.data;

  const { data: pokemonsData, isLoading: isLoadingPokemons, isError: isErrorPokemons } = useListPokemons({
    pageSize: 3,
    currentPage: 1,
    sortBy: 'id',
    sortOrder: 'asc' as 'asc' | 'desc',
  });
  //------------------------End------------------------//

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Enhanced Hero Section */}
        <LinearGradient
          colors={['#4A9FA2', '#5FA8AB', '#6FAFB2', '#7EC5C8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
          className="pb-25 relative overflow-hidden"
        >
          {/* Decorative Background Circles */}
          <View style={[styles.decorativeCircle, styles.decorativeCircle1]} className="absolute bg-white/6 rounded-full" />
          <View style={[styles.decorativeCircle, styles.decorativeCircle2]} className="absolute bg-white/6 rounded-full" />
          <View style={[styles.decorativeCircle, styles.decorativeCircle3]} className="absolute bg-white/6 rounded-full" />

          {/* Header */}
          <BackScreen
            onPress={() => router.back()}
            color='white'
            title='Hồ sơ'
            className='mb-6'
          >
            <TouchableOpacity
              onPress={() => router.push(ROUTES.ME.SETTINGS)}
              className="w-11 h-11 bg-white/25 rounded-2xl items-center justify-center shadow-sm"
              activeOpacity={0.8}
            >
              <Cog size={22} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
          </BackScreen>

          {/* Avatar Section */}
          <View className="items-center pt-2">
            {/* Progress Ring with Enhanced Glow */}
            <View className="w-38 h-38 items-center justify-center mb-5 relative">
              <View style={styles.progressGlow} />
              <Progress.Circle
                size={152}
                progress={mockUserData?.level?.progress}
                thickness={11}
                color={'#10b981'}
                unfilledColor={'rgba(255,255,255,0.25)'}
                borderWidth={0}
                strokeCap="round"
              />

              {/* Avatar with White Border */}
              <View className="absolute w-34 h-34 rounded-full bg-white items-center justify-center shadow-lg">
                <Image
                  source={{ uri: userProfile?.avatar }}
                  className="w-32 h-32 rounded-full"
                />
              </View>

              {/* Level Badge */}
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.levelBadge}
                className="absolute -bottom-2 flex-row items-center px-3.5 py-1.5 rounded-2xl gap-1 shadow-lg"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text className="text-sm font-extrabold text-white tracking-wide">
                  {Math.round(mockUserData?.level?.progress * 100)}
                </Text>
              </LinearGradient>
            </View>

            {/* User Info */}
            <Text className="text-4xl font-extrabold text-white mb-3 tracking-tight">{userProfile?.name}</Text>

            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
              style={styles.levelTag}
              className="flex-row items-center px-4.5 py-2.5 rounded-2xl gap-1.5 mb-3"
            >
              <Trophy size={16} color="white" strokeWidth={2.5} />
              <Text className="text-base font-bold text-white tracking-wide">{mockUserData?.level?.name}</Text>
            </LinearGradient>

            <View className="flex-row items-center gap-1.5">
              <Calendar size={15} color="rgba(255,255,255,0.95)" strokeWidth={2.5} />
              <Text className="text-sm font-semibold text-white/95 tracking-wide">Tham gia {formatDateToMMYYYY(userProfile?.createdAt)}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <View className="px-5 -mt-20">
          {/* Stats Grid */}
          <View className="flex-row gap-3 mb-6">
            <StatItem
              icon={Star}
              value={mockUserData?.stats?.learningPoints?.toLocaleString()}
              label="Điểm"
              color="#f59e0b"
              accentColor="#fbbf24"
            />
            <StatItem
              icon={Flame}
              value={mockUserData?.stats?.streak}
              label="Streak"
              color="#ef4444"
              accentColor="#f87171"
            />
            <StatItem
              icon={Shield}
              value={mockUserData?.stats?.league}
              label="Giải đấu"
              color="#6FAFB2"
              accentColor="#7EC5C8"
            />
          </View>

          {/* Pokemon Collection Card */}
          <TouchableOpacity
            onPress={() => router.push(ROUTES.ME.POKEMON_COLLECTION)}
            activeOpacity={0.7}
            className="mb-6"
          >
            <LinearGradient
              colors={['#ffffff', '#fefefe']}
              style={styles.collectionCard}
              className="p-6 rounded-3xl overflow-hidden shadow-lg"
            >
              {/* Decorative Element */}
              <View className="absolute -top-10 -right-10 w-35 h-35 rounded-full bg-teal-50 opacity-40" />

              {/* Header */}
              <View className="flex-row items-center mb-5">
                <LinearGradient
                  colors={['#14b8a6', '#0d9488']}
                  style={styles.collectionIconContainer}
                  className="w-13 h-13 rounded-2xl items-center justify-center mr-3.5 shadow-lg"
                >
                  <Sparkles size={24} color="white" strokeWidth={2.5} />
                </LinearGradient>

                <View className="flex-1">
                  <Text className="text-2xl font-extrabold text-slate-800 mb-1 tracking-tight">Bộ sưu tập</Text>
                  <Text className="text-sm font-semibold text-slate-500 tracking-wide">
                    Xem toàn bộ Pokédex của bạn
                  </Text>
                </View>

                <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center">
                  <ChevronRight size={20} color="#64748b" strokeWidth={2.8} />
                </View>
              </View>

              {/* Pokemon Preview */}
              <View className="flex-row justify-center gap-2.5 pt-5 border-t border-slate-100">
                {pokemonsData?.data?.results?.map((p: IPokemon) => (
                  <Image
                    source={{ uri: p?.imageUrl }}
                    className="w-24 h-24 rounded-2xl"
                    resizeMode="contain"
                  />
                ))}
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Achievements Section */}
          <LinearGradient
            colors={['#ffffff', '#fefefe']}
            style={styles.achievementsCard}
            className="p-6 rounded-3xl mb-6 shadow-lg"
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-2xl font-extrabold text-slate-800 mb-1 tracking-tight">Thành tích</Text>
                <Text className="text-sm font-semibold text-slate-500 tracking-wide">
                  {mockUserData.achievements.length} huy hiệu đã đạt được
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push(ROUTES.ME.ACHIEVEMENTS)}
                className="bg-blue-50 px-4.5 py-2.5 rounded-2xl"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-extrabold text-blue-600 tracking-wide">Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {/* Achievements List */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsList}
              className="py-2.5 px-1"
            >
              {mockUserData.achievements.map((ach, index) => (
                <AchievementBadge
                  key={index}
                  name={ach.name}
                  icon={ach.icon}
                  colors={ach.colors}
                />
              ))}
            </ScrollView>
          </LinearGradient>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Hero Section - Complex styles that can't be replaced
  heroSection: {
    paddingBottom: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 9999,
  },
  decorativeCircle1: {
    width: 280,
    height: 280,
    top: -140,
    right: -140,
  },
  decorativeCircle2: {
    width: 200,
    height: 200,
    bottom: -100,
    left: -100,
  },
  decorativeCircle3: {
    width: 120,
    height: 120,
    top: 100,
    left: -60,
  },

  // Avatar Section - Complex styles with shadows and positioning
  progressGlow: {
    position: 'absolute',
    width: 152,
    height: 152,
    borderRadius: 76,
    backgroundColor: '#10b981',
    opacity: 0.3,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  levelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },

  // Stat Cards - Complex shadow styles
  statCard: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 24,
    backgroundColor: '#ffffff',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  accentLine: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginTop: 12,
  },

  // Collection Card - Complex shadow styles
  collectionCard: {
    padding: 24,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#6FAFB2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  collectionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  pokemonCard: {
    width: 84,
    height: 84,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  // Achievements - Complex shadow styles
  achievementsCard: {
    padding: 24,
    borderRadius: 28,
    marginBottom: 24,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  achievementsList: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 24,
  },
  achievementBadgeShadow: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 12,
  },
  achievementBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
});