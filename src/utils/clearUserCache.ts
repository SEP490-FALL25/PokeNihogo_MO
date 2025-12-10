import { queryClient } from "@libs/@tanstack/react-query";

/**
 * Clear all user-related queries from React Query cache
 * This should be called when user logs out to prevent data leakage between accounts
 */
export const clearUserCache = () => {
    try {
        // List of all user-related query keys that should be cleared on logout
        const userQueryKeys = [
            // User profile and auth
            'user-profile',
            // Wallet
            'wallet-user',
            // Subscription
            'subscription-marketplace-packages',
            'user-subscription',
            'user-subscription-features',
            'user-subscription-infinite',
            // User tests and abilities
            'user-tests',
            // User pokemon
            'user-pokemon-stats',
            'user-pokemons-infinite',
            'user-pokemon-evolution-chain',
            'owned-pokemons',
            'list-user-pokemon-round',
            // Attendance
            'attendance-summary',
            // Achievements
            'user-achievements',
            // Flashcards
            'flashcard-decks',
            'flashcard-deck',
            'flashcard-deck-words',
            'flashcard-deck-cards',
            // Dictionary favorites
            'dictionary-favorites',
            // Quiz
            'quiz-session',
            'quiz-questions',
            'quiz-stats',
            'quiz-history',
            'quiz-review',
            // Rewards
            'reward-history',
            // Notifications
            'notification',
            // Conversations
            'conversation-rooms',
            // SRS Review
            'user-srs-review',
            // Exercise attempts
            'user-exercise-attempt-latest',
            'user-exercise-questions',
            // Lessons
            'user-lessons-infinite',
            // Battle
            'user-matching-history',
            'user-stats-season',
            'match-tracking',
            'battle-tracking',
            'list-match-round',
            // Invoice
            'invoice',
            // Answer logs
            'user-answer-log',
        ];

        // Remove all queries that start with any of the user query keys
        userQueryKeys.forEach((key) => {
            queryClient.removeQueries({ queryKey: [key] });
        });

        console.log('User cache cleared successfully');
    } catch (error) {
        console.error('Error clearing user cache:', error);
        // Fallback: clear all cache if selective clearing fails
        try {
            queryClient.clear();
        } catch (clearError) {
            console.error('Error clearing all cache:', clearError);
        }
    }
};
