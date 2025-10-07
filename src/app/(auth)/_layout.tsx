import SplashScreen from '@app/splash';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@routes/routes';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return <SplashScreen />;
    }

    if (isAuthenticated && user?.data?.level !== null) {
        return <Redirect href={ROUTES.TABS.HOME} />;
    } else if (isAuthenticated && user?.data?.level === null) {
        return <Redirect href={ROUTES.STARTER.SELECT_LEVEL} />;
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