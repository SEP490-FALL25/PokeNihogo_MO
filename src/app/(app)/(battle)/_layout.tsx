import { Stack } from 'expo-router';
import React from 'react';

export default function BattleLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'none', // No transition for battle flows
            }}
        >
            <Stack.Screen name="draft" />
            <Stack.Screen name="arena" />
        </Stack>
    );
}

