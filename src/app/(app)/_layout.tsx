import SplashScreen from '@app/splash';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@routes/routes';
import { useAuthStore } from '@stores/auth/auth.config';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const isTokenLoading = useAuthStore((state) => state.isLoading);

    if (isTokenLoading || isLoading) {
        return <SplashScreen />;
    }

    if (!isAuthenticated) {
        return <Redirect href={ROUTES.AUTH.WELCOME} />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="me" />
        </Stack>
    );
}