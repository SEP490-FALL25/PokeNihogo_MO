import {
    getConversationRooms,
    GetConversationRoomsResponse,
} from "@services/conversation";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch conversation rooms list
 */
export const useConversationRooms = (params?: {
  currentPage?: number;
  pageSize?: number;
}) => {
  const { data, isLoading, isError, refetch } = useQuery<GetConversationRoomsResponse>({
    queryKey: ["conversation-rooms", params],
    queryFn: () => getConversationRooms(params),
    staleTime: 30000, // Cache for 30 seconds
  });

  return {
    data: data?.data,
    isLoading,
    isError,
    refetch,
  };
};

