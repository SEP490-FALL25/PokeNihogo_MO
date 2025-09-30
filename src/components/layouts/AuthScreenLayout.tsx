import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthScreenLayoutProps {
    children: React.ReactNode;
}

export default function AuthScreenLayout({ children }: AuthScreenLayoutProps) {
    return (
        <LinearGradient
            colors={['#79B4C4', '#85C3C3', '#9BC7B9']}
            style={{ flex: 1 }}
        >
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }}>
                {children}
            </SafeAreaView>
        </LinearGradient>
    );
}