enum AUTH {
    WELCOME = '/(auth)/welcome',
    EMAIL = '/(auth)/email',
    REGISTER = '/(auth)/register',
    FORGOT_PASSWORD = '/(auth)/forgot-password',
    RESET_PASSWORD = '/(auth)/reset-password',
    OTP = '/(auth)/otp',
}

enum TABS {
    ROOT = '/(tabs)',
    HOME = '/(tabs)/index',
    EXPLORE = '/(tabs)/explore',
    DEMO = '/(tabs)/demo',
}


export const ROUTES = {
    AUTH,
    TABS,
};