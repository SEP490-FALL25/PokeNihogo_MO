import { axiosPrivate } from "@configs/axios";

const userService = {
    // Example: Get user profile with language support
    getProfile: async () => {
        // This request will automatically include Accept-Language header
        // based on current language setting in the app
        const response = await axiosPrivate.get('/user/profile');
        return response.data;
    },

    // Example: Update user settings with language support
    updateSettings: async (settings: any) => {
        // This request will also include Accept-Language header
        const response = await axiosPrivate.put('/user/settings', settings);
        return response.data;
    },

    // Update user JLPT level
    updateLevelJLPT: async (level: 'N5' | 'N4' | 'N3') => {
        // Convert level string to number: N5 -> 5, N4 -> 4, N3 -> 3
        const levelNumber = parseInt(level.replace('N', ''));
        const response = await axiosPrivate.put('/user/levelJLPT', {
            levelJLPT: levelNumber
        });
        return response.data;
    }
}

export default userService