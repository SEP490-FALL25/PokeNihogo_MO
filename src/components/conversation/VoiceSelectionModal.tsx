import { ThemedText } from "@components/ThemedText";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@components/ui/BottomSheet";
import { ChevronDown, Play } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface VoiceOption {
  name: string; // Voice name (e.g., "ja-JP-Wavenet-A")
  ssmlGender?: "MALE" | "FEMALE" | "NEUTRAL";
  languageCode?: string;
  // For display purposes
  description?: string;
  sampleAudioUrl?: string;
}

interface VoiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: VoiceOption[];
  selectedVoiceName?: string | null;
  onSelectVoice: (voiceName: string) => void;
  isLoading?: boolean;
  onPreviewVoice?: (voiceName: string, sampleText: string) => Promise<void>;
}

export const VoiceSelectionModal: React.FC<VoiceSelectionModalProps> = ({
  isOpen,
  onClose,
  voices,
  selectedVoiceName,
  onSelectVoice,
  isLoading = false,
  onPreviewVoice,
}) => {
  const { t } = useTranslation();
  const snapPoints = useMemo(() => [0.], []);
  const [sampleText, setSampleText] = useState("こんにちは。今日はいい天気ですね。");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
        setIsSelectOpen(false);
      }
    },
    [onClose]
  );

  const handleSelectVoice = useCallback(
    (voiceName: string) => {
      onSelectVoice(voiceName);
      setIsSelectOpen(false);
    },
    [onSelectVoice]
  );

  const handlePreview = useCallback(
    async () => {
      if (!onPreviewVoice || !sampleText.trim() || !selectedVoiceName) return;
      setIsPreviewing(true);
      try {
        await onPreviewVoice(selectedVoiceName, sampleText.trim());
      } catch (error) {
        console.error("Error previewing voice:", error);
      } finally {
        setIsPreviewing(false);
      }
    },
    [onPreviewVoice, sampleText, selectedVoiceName]
  );

  const selectedVoice = useMemo(() => {
    return voices.find((v) => v.name === selectedVoiceName);
  }, [voices, selectedVoiceName]);

  const getVoiceDisplayName = useCallback((voice: VoiceOption) => {
    const genderLabel =
      voice.ssmlGender === "MALE"
        ? t("home.ai.conversation.voice_male", "Male")
        : voice.ssmlGender === "FEMALE"
          ? t("home.ai.conversation.voice_female", "Female")
          : voice.ssmlGender === "NEUTRAL"
            ? t("home.ai.conversation.voice_neutral", "Neutral")
            : "";
    return genderLabel ? `${voice.name} (${genderLabel})` : voice.name;
  }, [t]);

  return (
    <BottomSheet open={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheetContent
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropOpacity={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <BottomSheetHeader style={styles.sheetHeader}>
          <BottomSheetTitle>
            {t(
              "home.ai.conversation.select_voice_title",
              "Choose AI Voice"
            )}
          </BottomSheetTitle>
          <ThemedText style={styles.subtitle}>
            {t(
              "home.ai.conversation.select_voice_subtitle",
              "Select a voice for your AI conversation and preview it with sample text."
            )}
          </ThemedText>
        </BottomSheetHeader>

        <View style={styles.formContainer}>
          {/* Voice Select */}
          <View style={styles.formGroup}>
            <ThemedText style={styles.formLabel}>
              {t("home.ai.conversation.voice_label", "Voice")}
            </ThemedText>
            <Pressable
              style={[
                styles.selectTrigger,
                isSelectOpen && styles.selectTriggerOpen,
              ]}
              onPress={() => setIsSelectOpen(true)}
            >
              <ThemedText
                style={[
                  styles.selectTriggerText,
                  !selectedVoice && styles.selectPlaceholder,
                ]}
                numberOfLines={1}
              >
                {selectedVoice
                  ? getVoiceDisplayName(selectedVoice)
                  : t("home.ai.conversation.select_voice_placeholder", "Select a voice...")}
              </ThemedText>
              <ChevronDown
                size={20}
                color="#6b7280"
                style={[
                  styles.selectArrow,
                  isSelectOpen && styles.selectArrowOpen,
                ]}
              />
            </Pressable>
          </View>

          {/* Sample Text Input */}
          {onPreviewVoice && (
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>
                {t("home.ai.conversation.sample_text", "Sample Text")}
              </ThemedText>
              <View style={styles.sampleTextInputContainer}>
                <TextInput
                  style={styles.sampleTextInput}
                  value={sampleText}
                  onChangeText={setSampleText}
                  placeholder={t(
                    "home.ai.conversation.sample_text_placeholder",
                    "Enter text to preview..."
                  )}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          )}

          {/* Preview Button */}
          {onPreviewVoice && selectedVoiceName && (
            <TouchableOpacity
              style={[
                styles.previewButton,
                isPreviewing && styles.previewButtonDisabled,
              ]}
              onPress={handlePreview}
              disabled={isPreviewing || !sampleText.trim()}
              activeOpacity={0.8}
            >
              {isPreviewing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Play size={18} color="#ffffff" />
                  <ThemedText style={styles.previewButtonText}>
                    {t("home.ai.conversation.preview_voice", "Preview Voice")}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Confirm Button - Chỉ xác nhận chọn voice, không tạo room */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selectedVoiceName && styles.confirmButtonDisabled,
            ]}
            onPress={() => {
              if (selectedVoiceName) {
                onSelectVoice(selectedVoiceName);
              }
            }}
            disabled={!selectedVoiceName}
            activeOpacity={0.8}
          >
            <ThemedText
              style={[
                styles.confirmButtonText,
                !selectedVoiceName && styles.confirmButtonTextDisabled,
              ]}
            >
              {t("home.ai.conversation.confirm_voice", "Confirm Voice Selection")}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#007AFF" />
            <ThemedText style={styles.loadingText}>
              {t("home.ai.conversation.loading_voices", "Loading voices...")}
            </ThemedText>
          </View>
        ) : voices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              {t(
                "home.ai.conversation.no_voices_available",
                "No voices available"
              )}
            </ThemedText>
          </View>
        ) : null}

        {/* Voice Select Modal */}
        <Modal
          visible={isSelectOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsSelectOpen(false)}
        >
          <Pressable
            style={styles.selectModalOverlay}
            onPress={() => setIsSelectOpen(false)}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.selectModalContent}>
                <View style={styles.selectModalHeader}>
                  <ThemedText style={styles.selectModalTitle}>
                    {t("home.ai.conversation.select_voice", "Select Voice")}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => setIsSelectOpen(false)}
                    style={styles.selectModalClose}
                  >
                    <ThemedText style={styles.selectModalCloseText}>✕</ThemedText>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  style={styles.selectOptionsList}
                  showsVerticalScrollIndicator={true}
                >
                  {voices.map((voice) => {
                    const isSelected = selectedVoiceName === voice.name;
                    return (
                      <TouchableOpacity
                        key={voice.name}
                        style={[
                          styles.selectOption,
                          isSelected && styles.selectOptionSelected,
                        ]}
                        onPress={() => handleSelectVoice(voice.name)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.selectOptionContent}>
                          <View style={styles.selectOptionLeft}>
                            <View
                              style={[
                                styles.selectOptionIndicator,
                                isSelected && styles.selectOptionIndicatorSelected,
                              ]}
                            >
                              {isSelected && (
                                <View style={styles.selectOptionIndicatorDot} />
                              )}
                            </View>
                            <View style={styles.selectOptionInfo}>
                              <ThemedText
                                style={[
                                  styles.selectOptionName,
                                  isSelected && styles.selectOptionNameSelected,
                                ]}
                              >
                                {voice.name}
                              </ThemedText>
                              {voice.ssmlGender && (
                                <ThemedText style={styles.selectOptionGender}>
                                  {voice.ssmlGender === "MALE"
                                    ? t("home.ai.conversation.voice_male", "Male")
                                    : voice.ssmlGender === "FEMALE"
                                      ? t("home.ai.conversation.voice_female", "Female")
                                      : t("home.ai.conversation.voice_neutral", "Neutral")}
                                </ThemedText>
                              )}
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </BottomSheetContent>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
  },
  sheetHeader: {
    backgroundColor: "#ffffff",
    paddingBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    lineHeight: 20,
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 12,
    minHeight: 52,
  },
  selectTriggerOpen: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f7ff",
  },
  selectTriggerText: {
    fontSize: 16,
    color: "#1f2937",
    flex: 1,
    marginRight: 12,
  },
  selectPlaceholder: {
    color: "#9ca3af",
  },
  selectArrow: {
    transform: [{ rotate: "0deg" }],
  },
  selectArrowOpen: {
    transform: [{ rotate: "180deg" }],
  },
  sampleTextInputContainer: {
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  sampleTextInput: {
    padding: 14,
    fontSize: 15,
    color: "#1f2937",
    minHeight: 80,
    textAlignVertical: "top",
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "#28a745",
    borderRadius: 12,
    marginBottom: 12,
  },
  previewButtonDisabled: {
    opacity: 0.6,
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  confirmButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#e5e7eb",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  confirmButtonTextDisabled: {
    color: "#9ca3af",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  // Select Modal Styles
  selectModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  selectModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "70%",
    overflow: "hidden",
  },
  selectModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  selectModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  selectModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  selectModalCloseText: {
    fontSize: 18,
    color: "#6b7280",
    fontWeight: "600",
  },
  selectOptionsList: {
    maxHeight: 400,
  },
  selectOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  selectOptionSelected: {
    backgroundColor: "#dbeafe",
  },
  selectOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectOptionIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectOptionIndicatorSelected: {
    borderColor: "#007AFF",
  },
  selectOptionIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
  },
  selectOptionInfo: {
    flex: 1,
  },
  selectOptionName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 4,
  },
  selectOptionNameSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  selectOptionGender: {
    fontSize: 13,
    color: "#6b7280",
  },
});
