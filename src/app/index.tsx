// File: app/index.tsx

import useAuth from '@hooks/useAuth';
import { ROUTES } from '@routes/routes';
import { Redirect } from 'expo-router';
import React from 'react';
import '../../global.css';
import SplashScreen from './splash';

export default function IndexScreen() {
    const { isLoggedIn, isLoading: isAuthLoading } = useAuth();

    if (isAuthLoading) {
        return <SplashScreen />;
    }

    const href = isLoggedIn ? ROUTES.TABS.ROOT : ROUTES.AUTH.WELCOME;

    return <Redirect href={href} />;
}