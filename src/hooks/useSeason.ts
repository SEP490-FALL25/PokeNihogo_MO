import seasonService from "@services/season";
import { useQuery } from "@tanstack/react-query";

/**
 * Season response type detection
 * - ACTIVE: Season is active, returns leaderboardSeason, rank, stats
 * - ENDED: Season ended, returns user season history with rewards
 * - NULL: First time user, no season history
 * - UNKNOWN: Unexpected response
 */
export type SeasonResponseType = 'ACTIVE' | 'ENDED' | 'NULL' | 'UNKNOWN';

/**
 * Get user stats season data
 * @returns User stats season data with response type
 */
export const useUserStatsSeason = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['user-stats-season'],
        queryFn: () => seasonService.getCurrentSeason(),
    });

    const responseData = data?.data?.data;

    // Detect response type based on structure
    const getResponseType = (): SeasonResponseType => {
        if (!responseData) return 'NULL';

        // Case 1: Active season - has leaderboardSeason and rank
        if (responseData.leaderboardSeason && responseData.rank) {
            return 'ACTIVE';
        }

        // Case 2: Ended season - has season, finalRank, finalElo, rewards
        if (responseData.season && (responseData.finalRank !== undefined || responseData.finalElo !== undefined)) {
            return 'ENDED';
        }

        // Case 3: Null - data is null
        if (responseData === null) {
            return 'NULL';
        }

        return 'UNKNOWN';
    };

    const responseType = getResponseType();

    return {
        data: responseData,
        responseType,
        isLoading,
        isError
    };
};
//--------------------------------End--------------------------------/