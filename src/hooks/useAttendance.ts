import attendanceService, {
  IAttendanceCheckInResponse,
  IAttendanceSummary,
} from "@services/attendance";
import { useAuth } from "@hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to fetch attendance summary
 */
export const useAttendanceSummary = () => {
  const { user } = useAuth();

  return useQuery<IAttendanceSummary>({
    queryKey: ["attendance-summary", user?.data?.id],
    queryFn: attendanceService.getAttendanceSummary,
    enabled: !!user?.data?.id,
  });
};

/**
 * Hook to check in for attendance
 */
export const useCheckIn = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<IAttendanceCheckInResponse, Error, void>({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendance-summary", user?.data?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["wallet-user"] });
    },
  });
};

