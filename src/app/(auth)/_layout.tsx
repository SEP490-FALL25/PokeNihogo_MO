import SplashScreen from '@app/splash';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@routes/routes';
import { useAuthStore } from '@stores/auth/auth.config';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const isTokenLoading = useAuthStore((state) => state.isLoading);
    console.log('isAuthenticated: ', isAuthenticated);

    if (isTokenLoading || isLoading) {
        return <SplashScreen />;
    }

    if (isAuthenticated) {
        return <Redirect href={ROUTES.TABS.HOME} />;
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