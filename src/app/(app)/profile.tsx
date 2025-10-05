import BackScreen from '@components/molecules/Back';
import { ROUTES } from '@routes/routes';
import { router } from 'expo-router';
import { Calendar, Cog, Flame, Shield, Star } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dữ liệu giả không thay đổi
const mockUserData = {
  name: 'Satoshi',
  username: 'satoshi_kun',
  joinDate: '10/2025',
  avatarUrl: 'https://cdn-icons-png.flaticon.com/512/219/219969.png',
  level: {
    name: 'Sơ cấp N5',
    progress: 0.75,
  },
  mainPokemon: {
    name: 'Pikachu',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
  },
  stats: {
    learningPoints: 12580,
    streak: 12,
    league: 'Bạc',
  },
  achievements: [
    { name: 'Tuần Hoàn Hảo', icon: '🎯' },
    { name: 'Học Giả', icon: '🧠' },
    { name: 'Lửa Nhiệt Huyết', icon: '🔥' },
    { name: 'Thông Thái', icon: '🦉' },
  ],
};

// --- Components con giữ nguyên logic, chỉ thay đổi màu sắc ---
const StatItem = ({ icon: Icon, value, label, color }: { icon: any, value: any, label: any, color: any }) => (
  <View className="items-center gap-1">
    <Icon size={28} color={color} />
    <Text className="text-xl font-bold text-slate-800">{value}</Text>
    <Text className="text-sm text-slate-500">{label}</Text>
  </View>
);

const AchievementBadge = ({ name, icon }: { name: any, icon: any }) => (
  <View className="items-center w-24">
    <View className="w-16 h-16 bg-slate-200 rounded-full items-center justify-center mb-1">
      <Text className="text-3xl">{icon}</Text>
    </View>
    <Text className="text-xs text-center text-slate-600 font-semibold" numberOfLines={2}>{name}</Text>
  </View>
);

export default function ProfileScreen() {
  return (
    // highlight-change
    <SafeAreaView className="flex-1 bg-slate-100">
      {/* Header */}
      <View className='flex-row py-3 bg-slate-100'>
        <BackScreen onPress={() => router.back()} color='black' />
        <TouchableOpacity onPress={() => router.push(ROUTES.APP.PROFILE)}>
          <Cog size={26} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* --- User Info Card --- */}
          <View className="p-5 bg-white rounded-2xl mb-4">
            <View className="items-center">
              <Image
                source={{ uri: mockUserData.avatarUrl }}
                className="w-24 h-24 rounded-full border-4 border-slate-200 mb-3"
              />
              {/* highlight-change */}
              <Text className="text-2xl font-bold text-slate-800">{mockUserData.name}</Text>
              <Text className="text-base text-slate-500 mb-3">@{mockUserData.username}</Text>
              <View className="flex-row items-center">
                {/* highlight-change */}
                <Calendar size={14} color="#94a3b8" />
                <Text className="text-sm text-slate-400 ml-1">Tham gia {mockUserData.joinDate}</Text>
              </View>
            </View>
            <View className="mt-5">
              {/* highlight-change */}
              <Text className="text-base font-bold text-slate-700 mb-2">Trình độ: {mockUserData.level.name}</Text>
              <Progress.Bar
                progress={mockUserData.level.progress}
                width={null}
                height={12}
                // highlight-change - Dùng màu primary
                color={'#22C55E'}
                unfilledColor={'#E2E8F0'} // slate-200
                borderWidth={0}
                borderRadius={10}
              />
            </View>
          </View>

          {/* --- Partner Pokémon Card --- */}
          {/* highlight-change - Phối màu theo theme secondary */}
          <View className="p-5 bg-white rounded-2xl mb-4">
            <Text className="text-xl font-bold text-slate-800 mb-4">Pokémon Đồng hành</Text>
            <View className="flex-row items-center bg-cyan-50 p-4 rounded-xl">
              <Image
                source={{ uri: mockUserData.mainPokemon.imageUrl }}
                className="w-28 h-28"
              />
              <View className="ml-4 flex-1">
                <Text className="text-2xl font-bold text-secondary-dark">{mockUserData.mainPokemon.name}</Text>
                <Text className="text-sm text-secondary">Người bạn đồng hành trên con đường chinh phục tiếng Nhật!</Text>
              </View>
            </View>
          </View>

          {/* --- Stats Card --- */}
          <View className="p-5 bg-white rounded-2xl mb-4">
            <Text className="text-xl font-bold text-slate-800 mb-4">Thống kê</Text>
            <View className="flex-row justify-around">
              {/* highlight-change - Giữ màu vàng cho điểm, cam cho streak, đổi màu giải đấu */}
              <StatItem icon={Star} value={mockUserData.stats.learningPoints} label="Điểm" color="#FFD700" />
              <StatItem icon={Flame} value={mockUserData.stats.streak} label="Streak" color="#FF6347" />
              <StatItem icon={Shield} value={mockUserData.stats.league} label="Giải đấu" color="#6FAFB2" />
            </View>
          </View>

          {/* --- Achievements Card --- */}
          <View className="p-5 bg-white rounded-2xl mb-4">
            <Text className="text-xl font-bold text-slate-800 mb-2">Thành tích</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-4 py-2">
                {mockUserData.achievements.map((ach, index) => (
                  <AchievementBadge key={index} name={ach.name} icon={ach.icon} />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* --- Friends Card --- */}
          <View className="p-5 bg-white rounded-2xl">
            <Text className="text-xl font-bold text-slate-800 mb-4">Bạn bè</Text>
            {/* highlight-change - Dùng màu primary cho nút chính */}
            <TouchableOpacity className="bg-primary py-3 rounded-xl">
              <Text className="text-white text-center font-bold">Tìm kiếm bạn bè</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}