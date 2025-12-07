import {
    deleteConversationRoom,
    getConversationRooms,
    GetConversationRoomsResponse,
} from "@services/conversation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

/**
 * Hook to delete a conversation room
 */
export const useDeleteConversationRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => deleteConversationRoom(conversationId),
    onSuccess: () => {
      // Invalidate and refetch conversation rooms
      queryClient.invalidateQueries({ queryKey: ["conversation-rooms"] });
    },
  });
};

