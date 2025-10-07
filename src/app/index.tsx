import SplashScreen from '@app/splash';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@routes/routes';
import { Redirect } from 'expo-router';
import React from 'react';
import '../../global.css';

export default function IndexScreen() {

    const { isAuthenticated, isLoading: isUserLoading } = useAuth();

    if (isUserLoading) {
        return <SplashScreen />;
    }

    const href = isAuthenticated ? ROUTES.TABS.HOME : ROUTES.AUTH.WELCOME;

    return <Redirect href={href} />;
}