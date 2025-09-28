import SplashScreen from '@app/splash';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@routes/routes';
import { Redirect } from 'expo-router';

type Props = {
    loaded: boolean;
};

export default function RootNavigation({ loaded }: Props) {
    const { isLoggedIn, isLoading: isAuthLoading } = useAuth();

    console.log('isLoggedIn', isLoggedIn);

    if (!loaded || isAuthLoading) {
        return <SplashScreen />;
    }

    if (isLoggedIn) {
        return <Redirect href={ROUTES.TABS.ROOT} />;
    }

    return <Redirect href={ROUTES.AUTH.WELCOME} />;
}
