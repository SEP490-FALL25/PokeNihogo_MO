import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="welcome" />
            <Stack.Screen name="email" />
            <Stack.Screen name="otp" />
            <Stack.Screen name="create-account" />
        </Stack>
    );
}