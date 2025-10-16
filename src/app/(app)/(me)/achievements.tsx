// src/app/(app)/achievements.tsx
import BackScreen from '@components/molecules/Back';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CheckCircle2, Sparkles } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React from 'react';
import { SectionList, StatusBar, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';

cssInterop(LinearGradient, { className: 'style' });
const TWLinearGradient = LinearGradient as unknown as React.ComponentType<React.ComponentProps<typeof LinearGradient> & { className?: string }>;

// --- Dữ liệu thành tích đã được cấu trúc lại ---
const achievementsData = [
    {
        group: 'Chào Mừng & Khởi Đầu',
        data: [
            { id: 'wh-1', name: 'Nhà Thám Hiểm Tập Sự', icon: '🗺️', colors: ['#a5f3fc', '#22d3ee'], unlocked: true, progress: 1, description: 'Hoàn thành bài học đầu tiên.' },
            { id: 'wh-2', name: 'Người Bạn Đồng Hành', icon: '🤝', colors: ['#a5f3fc', '#22d3ee'], unlocked: true, progress: 1, description: 'Chọn Pokémon khởi đầu.' },
            { id: 'wh-3', name: 'Vạch Ra Lộ Trình', icon: '🧭', colors: ['#a5f3fc', '#22d3ee'], unlocked: false, progress: 0, description: 'Hoàn thành bài kiểm tra trình độ.' },
        ],
    },
    {
        group: 'Chuyên Cần & Bền Bỉ',
        data: [
            { id: 'dp-1', name: 'Ngọn Lửa Nhỏ', icon: '🔥', colors: ['#fed7aa', '#fb923c'], unlocked: true, progress: 1, description: 'Chuỗi 3 ngày học.' },
            { id: 'dp-2', name: 'Lửa Bùng Cháy', icon: '🔥', colors: ['#fca5a5', '#ef4444'], unlocked: true, progress: 1, description: 'Chuỗi 7 ngày học.' },
            { id: 'dp-3', name: 'Lửa Vĩnh Cửu', icon: '🔥', colors: ['#fde047', '#facc15'], unlocked: false, progress: 0.5, description: 'Chuỗi 30 ngày học.' },
            { id: 'dp-4', name: 'Huyền Thoại', icon: '🔥', colors: ['#ddd6fe', '#a78bfa'], unlocked: false, progress: 0.1, description: 'Chuỗi 100 ngày học.' },
        ],
    },
    {
        group: 'Nhà Sưu Tầm Pokémon',
        data: [
            { id: 'pc-1', name: 'Bộ Sưu Tập Đầu Tiên', icon: '🐾', colors: ['#d1d5db', '#9ca3af'], unlocked: true, progress: 1, description: 'Sở hữu 10 Pokémon.' },
            { id: 'pc-2', name: 'Hoàn Thành Pokédex Kanto', icon: '👑', colors: ['#fde047', '#facc15'], unlocked: false, progress: 0.35, description: 'Sở hữu 151 Pokémon Gen 1.' },
            { id: 'pc-3', name: 'Thợ Săn Huyền Thoại', icon: '✨', colors: ['#ddd6fe', '#a78bfa'], unlocked: false, progress: 0, description: 'Sở hữu một Pokémon Huyền thoại.' },
        ],
    },
    {
        group: 'Chuyên Gia Theo Hệ',
        data: [
            { id: 'te-1', name: 'Chuyên Gia Hệ Cỏ', icon: '🌿', colors: ['#86efac', '#22c55e'], unlocked: true, progress: 1, description: 'Thu phục tất cả Pokémon hệ Cỏ.' },
            { id: 'te-2', name: 'Bậc Thầy Hệ Lửa', icon: '🔥', colors: ['#fca5a5', '#ef4444'], unlocked: false, progress: 0.8, description: 'Thu phục tất cả Pokémon hệ Lửa.' },
            { id: 'te-3', name: 'Thủy Sư Đô Đốc', icon: '💧', colors: ['#93c5fd', '#3b82f6'], unlocked: false, progress: 0.4, description: 'Thu phục tất cả Pokémon hệ Nước.' },
        ],
    },
    {
        group: 'Bậc Thầy Tiến Hóa',
        data: [
            { id: 'em-1', name: 'Sức Mạnh Bão Tố', icon: '🐲', colors: ['#fb923c', '#f97316'], unlocked: true, progress: 1, description: 'Tiến hóa Charizard.' },
            { id: 'em-2', name: 'Pháo Đài Thủy Lực', icon: '🐢', colors: ['#60a5fa', '#2563eb'], unlocked: false, progress: 0.6, description: 'Tiến hóa Blastoise.' },
            { id: 'em-3', name: 'Thái Dương Hoa', icon: '🌸', colors: ['#a7f3d0', '#34d399'], unlocked: false, progress: 0.2, description: 'Tiến hóa Venusaur.' },
        ],
    },
];


// Component con cho mỗi thẻ thành tích
const AchievementCard = ({ item }: { item: any }) => (
    <View className="flex-1 my-2">
        <TWLinearGradient
            colors={item.unlocked ? ['#1e293b', '#334155'] : ['#374151', '#4b5563']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            className="rounded-2xl p-4 shadow-black/40 shadow-lg flex-row items-center gap-4"
        >
            {/* Huy hiệu */}
            <TWLinearGradient
                colors={item.colors}
                className={`w-20 h-20 rounded-2xl items-center justify-center shadow-lg ${!item.unlocked && 'opacity-60'}`}
                style={{ shadowColor: item.unlocked ? item.colors[1] : '#000' }}
            >
                <Text className="text-4xl">{item.icon}</Text>
                {item.unlocked && (
                    <View className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full items-center justify-center border-2 border-slate-800">
                        <CheckCircle2 size={14} color="white" />
                    </View>
                )}
            </TWLinearGradient>

            {/* Thông tin */}
            <View className="flex-1">
                <Text className={`text-base font-extrabold ${item.unlocked ? 'text-white' : 'text-slate-500'}`}>{item.name}</Text>
                <Text className="text-xs text-slate-400 mt-1" numberOfLines={2}>{item.description}</Text>
                <View className="mt-2">
                    <Progress.Bar
                        progress={item.progress}
                        width={null}
                        height={6}
                        color={item.unlocked ? '#10b981' : item.colors[1]}
                        borderWidth={0}
                        borderRadius={3}
                    />
                    <Text className="text-right text-xs font-semibold text-slate-500 mt-1">
                        {Math.round(item.progress * 100)}%
                    </Text>
                </View>
            </View>
        </TWLinearGradient>
    </View>
);

export default function AchievementsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <StatusBar barStyle="light-content" />
            <BackScreen onPress={() => router.back()} color='white' title='Sổ tay Thành tích' />
            <SectionList
                sections={achievementsData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <AchievementCard item={item} />}
                renderSectionHeader={({ section: { group } }) => (
                    <View className="flex-row items-center gap-3 px-4 pt-6 pb-2">
                        <TWLinearGradient colors={['#6FAFB2', '#7EC5C8']} className="w-8 h-8 rounded-lg items-center justify-center">
                            <Sparkles size={16} color="white" />
                        </TWLinearGradient>
                        <Text className="text-xl font-bold text-white">{group}</Text>
                    </View>
                )}
                contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
            />
        </SafeAreaView>
    );
}