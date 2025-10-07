import BackScreen from '@components/molecules/Back';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const allAchievements = [
    { id: 1, name: 'Tuần Hoàn Hảo', icon: '🎯', colors: ['#fbbf24', '#f59e0b'], unlocked: true, description: 'Hoàn thành bài học mỗi ngày trong 7 ngày liên tiếp.' },
    { id: 2, name: 'Học Giả', icon: '🧠', colors: ['#d1d5db', '#9ca3af'], unlocked: true, description: 'Đạt 1000 điểm kinh nghiệm.' },
    { id: 3, name: 'Lửa Nhiệt Huyết', icon: '🔥', colors: ['#fbbf24', '#f59e0b'], unlocked: true, description: 'Duy trì chuỗi 30 ngày học.' },
    { id: 4, name: 'Thông Thái', icon: '🦉', colors: ['#fca5a5', '#ef4444'], unlocked: true, description: 'Học sau 10 giờ tối.' },
    { id: 5, name: 'Chăm Chỉ', icon: '✍️', colors: ['#d1d5db', '#9ca3af'], unlocked: true, description: 'Hoàn thành 50 bài học.' },
    { id: 6, name: '???', icon: '👑', colors: ['#d1d5db', '#9ca3af'], unlocked: false, description: 'Trở thành nhà vô địch của Giải đấu Kim Cương.' },
    { id: 7, name: '???', icon: '🧐', colors: ['#d1d5db', '#9ca3af'], unlocked: false, description: 'Hoàn thành một bài học mà không mắc lỗi nào.' },
    { id: 8, name: '???', icon: '⚡️', colors: ['#d1d5db', '#9ca3af'], unlocked: false, description: 'Đạt 5000 điểm kinh nghiệm.' },
];

type FilterStatus = 'all' | 'unlocked' | 'locked';

const AchievementGridItem = ({ item }: { item: any }) => (
    <View className="flex-1 items-center m-2">
        <LinearGradient
            colors={item.unlocked ? item.colors : ['#475569', '#334155']}
            className={`w-24 h-24 rounded-full items-center justify-center mb-2 shadow-lg ${!item.unlocked && 'opacity-60'}`}
            style={{ shadowColor: item.unlocked ? item.colors[1] : '#000' }}
        >
            <Text className="text-5xl">{item.unlocked ? item.icon : '❓'}</Text>
        </LinearGradient>
        <Text className="text-base text-center text-slate-600 font-semibold" numberOfLines={2}>{item.name}</Text>
        <Text className="text-xs text-center text-slate-400 mt-1" numberOfLines={3}>{item.description}</Text>
    </View>
);

export default function AchievementsScreen() {
    const [filter, setFilter] = useState<FilterStatus>('all');

    const filteredAchievements = useMemo(() => {
        if (filter === 'unlocked') return allAchievements.filter(a => a.unlocked);
        if (filter === 'locked') return allAchievements.filter(a => !a.unlocked);
        return allAchievements;
    }, [filter]);

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" />
            <BackScreen onPress={() => router.back()} color='black' title='Thành tích' />

            {/* Tab filter */}
            <View className="flex-row justify-center gap-4 my-4">
                <TouchableOpacity onPress={() => setFilter('all')} className={`px-4 py-2 rounded-full ${filter === 'all' ? 'bg-blue-500' : 'bg-slate-200'}`}>
                    <Text className={`font-bold ${filter === 'all' ? 'text-white' : 'text-slate-600'}`}>Tất cả</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('unlocked')} className={`px-4 py-2 rounded-full ${filter === 'unlocked' ? 'bg-blue-500' : 'bg-slate-200'}`}>
                    <Text className={`font-bold ${filter === 'unlocked' ? 'text-white' : 'text-slate-600'}`}>Đã mở</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('locked')} className={`px-4 py-2 rounded-full ${filter === 'locked' ? 'bg-blue-500' : 'bg-slate-200'}`}>
                    <Text className={`font-bold ${filter === 'locked' ? 'text-white' : 'text-slate-600'}`}>Chưa mở</Text>
                </TouchableOpacity>
            </View>

            {/* Achievement grid */}
            <FlatList
                data={filteredAchievements}
                numColumns={3}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <AchievementGridItem item={item} />}
                contentContainerStyle={{ paddingHorizontal: 8 }}
            />
        </SafeAreaView>
    );
}