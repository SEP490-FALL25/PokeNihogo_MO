import { axiosPrivate } from "@configs/axios";

const leaderboardService = {
    getLeaderboardByRankName: async (rankName: string) => {
        return await axiosPrivate.get('/leaderboard-season/rank-list?rankName=N5');
    }
}

export default leaderboardService;