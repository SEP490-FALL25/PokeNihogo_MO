import useAuth from '@hooks/useAuth';
import { ROUTES } from '@routes/routes';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function StarterLayout() {
    const { user } = useAuth();

    if (user?.data?.level !== null) {
        return <Redirect href={ROUTES.TABS.HOME} />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="choose-starter" />
            <Stack.Screen name="select-level" />
            <Stack.Screen name="placement-test" />
            <Stack.Screen name="congrats" />
        </Stack>
    );
}