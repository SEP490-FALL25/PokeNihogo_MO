import BackScreen from '@components/molecules/Back';
import { router } from 'expo-router';
import React from 'react';
import { StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" />
            <BackScreen onPress={() => router.back()} color='black'>
                <Text className="text-2xl font-bold text-slate-800">Cài đặt</Text>
            </BackScreen>

            <View className="p-4">
                <Text className="text-lg text-slate-600 text-center mt-8">
                    Cài đặt sẽ được cập nhật trong phiên bản tiếp theo
                </Text>
            </View>
        </SafeAreaView>
    );
}
