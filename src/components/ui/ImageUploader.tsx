import { useToast } from "@components/ui/Toast";
import { useUploadImage } from "@hooks/useUpload";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface ImageUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  folderName: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function ImageUploader({
  value = "",
  onChange,
  folderName,
  label,
  placeholder = "URL sẽ tự động điền sau khi upload, hoặc nhập URL thủ công",
  disabled = false,
}: ImageUploaderProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const uploadImageMutation = useUploadImage();

  const handleSelectImage = useCallback(async () => {
    try {
      // Check if already uploading
      if (uploadImageMutation.isPending || disabled) return;

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        toast({
          title: t("flashcard_detail.image_permission_denied_title", "Không có quyền"),
          description: t(
            "flashcard_detail.image_permission_denied_desc",
            "Ứng dụng cần quyền truy cập thư viện ảnh để tải hình."
          ),
          variant: "destructive",
        });
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"] as unknown as ImagePicker.MediaTypeOptions,
        quality: 0.9,
        allowsMultipleSelection: false,
      });

      if (pickerResult.canceled || !pickerResult.assets?.length) return;

      const asset = pickerResult.assets[0];
      const fileName =
        asset.fileName ||
        asset.uri?.split("/").pop() ||
        `image-${Date.now()}.jpg`;
      const fileType =
        asset.mimeType ||
        (fileName?.includes(".")
          ? `image/${fileName.split(".").pop()}`
          : "image/jpeg");

      // Upload image to get URL from server
      uploadImageMutation.mutate(
        {
          uri: asset.uri,
          name: fileName,
          type: fileType || "image/jpeg",
          folderName,
        },
        {
          onSuccess: (response) => {
            // Only update imageUrl after successful upload with server URL
            // Response structure: { statusCode: 201, message: "...", data: { url: "...", publicId: "..." } }
            const imageUrl = response?.data?.url;
            if (imageUrl) {
              onChange?.(imageUrl);
              toast({
                title: t(
                  "flashcard_detail.upload_success_title",
                  "Tải ảnh thành công"
                ),
                description: t(
                  "flashcard_detail.upload_success_desc",
                  "Ảnh đã được tải lên và hiển thị."
                ),
              });
            } else {
              console.warn("Upload response missing URL:", response);
              toast({
                title: t(
                  "flashcard_detail.upload_error_title",
                  "Không thể tải ảnh"
                ),
                description: t(
                  "flashcard_detail.upload_error_desc",
                  "Phản hồi từ server thiếu URL."
                ),
                variant: "destructive",
              });
            }
          },
          onError: (error: any) => {
            console.warn("Image upload error:", error);
            toast({
              title: t(
                "flashcard_detail.upload_error_title",
                "Không thể tải ảnh"
              ),
              description: error?.message || t(
                "flashcard_detail.upload_error_desc",
                "Vui lòng thử lại sau."
              ),
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.warn("Image upload error", error);
      toast({
        title: t("flashcard_detail.upload_error_title", "Không thể tải ảnh"),
        description: t(
          "flashcard_detail.upload_error_desc",
          "Vui lòng thử lại sau."
        ),
        variant: "destructive",
      });
    }
  }, [uploadImageMutation, folderName, onChange, toast, t, disabled]);

  const handleRemoveImage = useCallback(() => {
    onChange?.("");
  }, [onChange]);

  return (
    <View>
      {label && (
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#1f2937", marginBottom: 8 }}>
          {label}
        </Text>
      )}
      
      <View className="border border-slate-200 rounded-2xl bg-white mb-3">
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          style={{ padding: 16, fontSize: 15, color: "#0f172a" }}
          editable={!disabled}
        />
      </View>

      {/* Image preview - only show URL from server after upload success */}
      {value ? (
        <View className="mb-3">
          <Image
            source={{ uri: value }}
            style={{ width: "100%", height: 200, borderRadius: 12, backgroundColor: "#e2e8f0", marginBottom: 12 }}
            contentFit="cover"
          />
          <TouchableOpacity
            className="px-3 py-2 rounded-xl bg-slate-200 self-start"
            onPress={handleRemoveImage}
            disabled={disabled}
          >
            <Text style={{ color: "#475569", fontWeight: "600", fontSize: 13 }}>
              {t("flashcard_detail.image_remove", "Xóa ảnh")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Upload button */}
      <TouchableOpacity
        className="px-4 py-3 rounded-2xl bg-sky-100 border border-dashed border-sky-300 flex-row items-center justify-center gap-2"
        onPress={handleSelectImage}
        disabled={uploadImageMutation.isPending || disabled}
      >
        {uploadImageMutation.isPending ? (
          <>
            <ActivityIndicator size="small" color="#0284c7" />
            <Text style={{ color: "#0284c7", fontWeight: "600", fontSize: 14 }}>
              {t("flashcard_detail.uploading_image", "Đang tải ảnh lên server...")}
            </Text>
          </>
        ) : (
          <Text style={{ color: "#0284c7", fontWeight: "600", fontSize: 14 }}>
            {t("flashcard_detail.image_upload_button", "Chọn ảnh từ thư viện")}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

