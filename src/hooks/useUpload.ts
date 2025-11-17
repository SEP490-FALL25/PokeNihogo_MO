import uploadService, {
  IUploadImagePayload,
  IUploadImageResponse,
} from "@services/upload";
import { useMutation } from "@tanstack/react-query";

export const useUploadImage = () => {
  return useMutation<IUploadImageResponse, Error, IUploadImagePayload>({
    mutationFn: (payload) => uploadService.uploadImage(payload),
  });
};

export type { IUploadImagePayload, IUploadImageResponse };

