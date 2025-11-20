import { IUpdateProfileRequest } from '@models/user/user.request';
import authService from '@services/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IUpdateProfileRequest) => authService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};

export default useUpdateProfile;

