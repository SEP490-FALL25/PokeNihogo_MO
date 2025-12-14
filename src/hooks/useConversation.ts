import {
    deleteConversationRoom,
    getAvailableVoices,
    getConversationRooms,
    GetConversationRoomsResponse,
    GetVoicesResponse,
    VoiceOption,
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

/**
 * Hook to fetch available voices for AI conversation
 */
export const useAvailableVoices = () => {
  const { data, isLoading, isError, refetch } = useQuery<GetVoicesResponse>({
    queryKey: ["ai-conversation-voices"],
    queryFn: () => getAvailableVoices(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    voices: (data?.data?.voices ?? []) as VoiceOption[],
    isLoading,
    isError,
    refetch,
  };
};

