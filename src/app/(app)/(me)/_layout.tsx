import { Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="profile" />
            <Stack.Screen name="pokemon-collection" />
            <Stack.Screen name="achievements" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="dictionary" />
            <Stack.Screen name="reward-history" />
        </Stack>
    );
}