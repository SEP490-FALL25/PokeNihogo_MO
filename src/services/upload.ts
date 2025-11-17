import { axiosPrivate } from "@configs/axios";

export interface IUploadImagePayload {
  uri: string;
  name: string;
  type: string;
  folderName: string;
}

export interface IUploadImageResponse {
  statusCode: number;
  message: string;
  data?: {
    url?: string;
    publicId?: string;
  };
}

const uploadService = {
  uploadImage: async ({
    uri,
    name,
    type,
    folderName,
  }: IUploadImagePayload): Promise<IUploadImageResponse> => {
    const formData = new FormData();
    formData.append("image", {
      uri,
      name,
      type,
    } as any);
    formData.append("folderName", folderName);

    const response = await axiosPrivate.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default uploadService;

