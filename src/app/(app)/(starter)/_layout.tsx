import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="choose-starter" />
            <Stack.Screen name="select-level" />
            <Stack.Screen name="placement-test" />
            <Stack.Screen name="congrats" />
        </Stack>
    );
}