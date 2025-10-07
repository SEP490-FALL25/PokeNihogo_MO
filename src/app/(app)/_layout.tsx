import SplashScreen from '@app/splash';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@routes/routes';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return <SplashScreen />;
    }

    if (!isAuthenticated) {
        return <Redirect href={ROUTES.AUTH.WELCOME} />;
    } else if (isAuthenticated && user?.data?.level === null) {
        return <Redirect href={ROUTES.STARTER.SELECT_LEVEL} />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="me" />
        </Stack>
    );
}