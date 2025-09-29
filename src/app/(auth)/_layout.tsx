import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
    return (
        <LinearGradient
            colors={['#79B4C4', '#85C3C3', '#9BC7B9']}
            style={{ flex: 1 }}
        >
            <Stack screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' }
            }}
            >
                <Stack.Screen name="welcome" />
                {/* <Stack.Screen name="login" /> */}
            </Stack>
        </LinearGradient>
    );
}