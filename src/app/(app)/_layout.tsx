import SplashScreen from '@app/splash';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@routes/routes';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <SplashScreen />;
    }

    if (!isAuthenticated) {
        return <Redirect href={ROUTES.AUTH.WELCOME} />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(me)" />
            <Stack.Screen name="(starter)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(battle)" />
            <Stack.Screen name="lesson-details" />
            <Stack.Screen name="lessons-list" />
            <Stack.Screen name="reading-details" />
            <Stack.Screen name="quiz" />
            <Stack.Screen name="gacha" />
            <Stack.Screen name="conversation" />
            <Stack.Screen name="subscription" />
            <Stack.Screen name="bottom" />
            <Stack.Screen name="lesson-demo" />
            <Stack.Screen name="ai-conversation" />
        </Stack>
    );
}