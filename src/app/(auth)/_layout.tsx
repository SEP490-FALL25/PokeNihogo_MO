import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
    console.log('AuthLayout');
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="welcome" />
            {/* <Stack.Screen name="login" /> */}
        </Stack>
    );
}