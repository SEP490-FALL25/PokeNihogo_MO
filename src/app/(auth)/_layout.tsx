import SplashScreen from '@app/splash';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@routes/routes';
import { Stack, router } from 'expo-router';
import React, { useEffect } from 'react';

export default function AuthLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.replace(ROUTES.TABS.HOME);
            }
        }
    }, [isLoading, isAuthenticated]);

    if (isLoading || isAuthenticated) {
        return <SplashScreen />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="welcome" />
            <Stack.Screen name="email" />
            <Stack.Screen name="otp" />
            <Stack.Screen name="create-account" />
            <Stack.Screen name="password" />
        </Stack>
    );
}