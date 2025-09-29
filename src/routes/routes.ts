enum AUTH {
    WELCOME = '/(auth)/welcome',
    LOGIN = '/(auth)/login',
    REGISTER = '/(auth)/register',
    FORGOT_PASSWORD = '/(auth)/forgot-password',
    RESET_PASSWORD = '/(auth)/reset-password',
    OTP = '/(auth)/otp',
}

enum TABS {
    ROOT = '/(tabs)',
    HOME = '/(tabs)/index',
    EXPLORE = '/(tabs)/explore',
}


export const ROUTES = {
    AUTH,
    TABS,
};