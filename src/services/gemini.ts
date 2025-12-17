import { axiosPrivate } from "@configs/axios";

const geminiService = {
    /**
     * Get SRS review suggestions (Vocabulary/Grammar/Kanji)
     * @param limit - Number of suggestions to receive (default: 10)
     * @param useServiceAccount - Enable/disable Service Account. "true" = use Service Account, "false" = use API Key (default: false)
     */
    getSRSRecommendations: async (limit: number = 10, useServiceAccount: boolean = false) => {
        const formData = new FormData();
        formData.append('limit', limit.toString());
        formData.append('useServiceAccount', useServiceAccount.toString());

        return await axiosPrivate.post(`/gemini/recommendations/srs`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default geminiService;

