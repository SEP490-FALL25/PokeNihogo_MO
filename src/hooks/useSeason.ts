import seasonService from "@services/season";
import { useQuery } from "@tanstack/react-query";

/**
 * Get user stats season data
 * @returns User stats season data
 */
export const useUserStatsSeason = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['user-stats-season'],
        queryFn: () => seasonService.getCurrentSeason(),
    });
    console.log(data);
    return { data: data?.data.data, isLoading, isError };
};
//--------------------------------End--------------------------------/