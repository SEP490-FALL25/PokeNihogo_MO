import { ThemedText } from "@components/ThemedText";
import { Play } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
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
  const [sampleText, setSampleText] = useState("こんにちは。今日はいい天気ですね。");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  // Temporary selected voice (chưa confirm, chỉ để preview)
  const [tempSelectedVoiceName, setTempSelectedVoiceName] = useState<string | null>(
    selectedVoiceName || null
  );
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.9), []);

  // Sync tempSelectedVoiceName khi modal mở hoặc selectedVoiceName thay đổi
  React.useEffect(() => {
    if (isOpen) {
      // Khi modal mở, sync với selectedVoiceName hiện tại
      setTempSelectedVoiceName(selectedVoiceName || null);
    }
  }, [isOpen, selectedVoiceName]);

  // Animation khi mở/đóng modal
  React.useEffect(() => {
    if (isOpen) {
      // Reset select modal khi mở modal chính
      setIsSelectOpen(false);
      // Reset animation values
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      // Start animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Đóng select modal khi đóng modal chính
      setIsSelectOpen(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, fadeAnim, scaleAnim]);

  // Chọn voice tạm thời (chỉ để preview, chưa confirm)
  const handleSelectVoice = useCallback(
    (voiceName: string) => {
      setTempSelectedVoiceName(voiceName);
      setIsSelectOpen(false);
      // Không gọi onSelectVoice ở đây, chỉ khi user bấm confirm
    },
    []
  );

  const handlePreview = useCallback(
    async () => {
      if (!onPreviewVoice || !sampleText.trim() || !tempSelectedVoiceName) return;
      setIsPreviewing(true);
      try {
        await onPreviewVoice(tempSelectedVoiceName, sampleText.trim());
      } catch (error) {
        console.error("Error previewing voice:", error);
      } finally {
        setIsPreviewing(false);
      }
    },
    [onPreviewVoice, sampleText, tempSelectedVoiceName]
  );

  // Dùng tempSelectedVoiceName để hiển thị và preview
  const selectedVoice = useMemo(() => {
    return voices.find((v) => v.name === tempSelectedVoiceName);
  }, [voices, tempSelectedVoiceName]);

  // Handle confirm - mới gọi onSelectVoice
  const handleConfirm = useCallback(() => {
    if (tempSelectedVoiceName) {
      onSelectVoice(tempSelectedVoiceName);
    }
  }, [tempSelectedVoiceName, onSelectVoice]);

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

  const getGenderLabel = useCallback((gender?: string) => {
    if (gender === "MALE") return t("home.ai.conversation.voice_male", "Male");
    if (gender === "FEMALE") return t("home.ai.conversation.voice_female", "Female");
    if (gender === "NEUTRAL") return t("home.ai.conversation.voice_neutral", "Neutral");
    return "";
  }, [t]);

  return (
    <>
      {/* Main Voice Selection Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
            {/* Header */}
            <View style={styles.header} pointerEvents="box-none">
              <View style={styles.headerLeft}>
                <ThemedText style={styles.title}>
                  {t("home.ai.conversation.select_voice_title", "Choose AI Voice")}
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  {t(
                    "home.ai.conversation.select_voice_subtitle",
                    "Select a voice for your AI conversation"
                  )}
                </ThemedText>
              </View>
            </View>

            {/* Content */}
            <View style={styles.contentWrapper}>
              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.contentContainer}
                bounces={false}
                nestedScrollEnabled={true}
              >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
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
              ) : (
                <>
                  {/* Voice Select */}
                  <View style={styles.formGroup}>
                    <ThemedText style={styles.formLabel}>
                      {t("home.ai.conversation.voice_label", "Voice")}
                    </ThemedText>
                    <View style={styles.selectContainer}>
                      <TouchableOpacity
                        style={[
                          styles.selectTrigger,
                          isSelectOpen && styles.selectTriggerOpen,
                          selectedVoice && styles.selectTriggerSelected,
                        ]}
                        onPress={() => {
                          console.log("Select trigger pressed, opening select modal");
                          setIsSelectOpen(!isSelectOpen);
                        }}
                        activeOpacity={0.7}
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
                        <View
                          style={[
                            styles.selectArrow,
                            isSelectOpen && styles.selectArrowOpen,
                          ]}
                        >
                          <ThemedText style={styles.selectArrowText}>▼</ThemedText>
                        </View>
                      </TouchableOpacity>
                      
                      {/* Dropdown List - Hiển thị ngay trong modal chính */}
                      {isSelectOpen && (
                        <View style={styles.selectDropdown}>
                          <ScrollView
                            style={styles.selectOptionsList}
                            showsVerticalScrollIndicator={true}
                            nestedScrollEnabled={true}
                            bounces={false}
                          >
                            {voices.map((voice) => {
                              const isSelected = tempSelectedVoiceName === voice.name;
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
                                          {getGenderLabel(voice.ssmlGender)}
                                        </ThemedText>
                                      )}
                                    </View>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </ScrollView>
                        </View>
                      )}
                    </View>
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

                  {/* Preview Button - Chỉ để nghe thử */}
                  {onPreviewVoice && tempSelectedVoiceName && (
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
                          <Play size={18} color="#ffffff" fill="#ffffff" />
                          <ThemedText style={styles.previewButtonText}>
                            {t("home.ai.conversation.preview_voice", "Preview Voice")}
                          </ThemedText>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  {/* Confirm Button - Xác nhận chọn voice */}
                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      !tempSelectedVoiceName && styles.confirmButtonDisabled,
                    ]}
                    onPress={handleConfirm}
                    disabled={!tempSelectedVoiceName}
                    activeOpacity={0.8}
                  >
                    <ThemedText
                      style={[
                        styles.confirmButtonText,
                        !tempSelectedVoiceName && styles.confirmButtonTextDisabled,
                      ]}
                    >
                      {t("home.ai.conversation.confirm_voice", "Confirm Voice Selection")}
                    </ThemedText>
                  </TouchableOpacity>
                </>
              )}
              </ScrollView>
            </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>

    </>
  );
};

// Get screen dimensions for responsive sizing
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Calculate modal dimensions based on screen size
const MODAL_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 400);
const MODAL_MAX_HEIGHT = Math.min(SCREEN_HEIGHT * 0.85, 600);
const DROPDOWN_MAX_HEIGHT = Math.min(SCREEN_HEIGHT * 0.3, 250);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: MODAL_WIDTH,
    maxHeight: MODAL_MAX_HEIGHT,
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  contentWrapper: {
    flexShrink: 1,
    overflow: "visible",
  },
  content: {
    flexShrink: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 32,
  },
  formGroup: {
    marginBottom: 24,
    width: "100%",
  },
  formLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  selectContainer: {
    position: "relative",
    zIndex: 10,
    width: "100%",
  },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    minHeight: 56,
    width: "100%",
  },
  selectTriggerOpen: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f7ff",
  },
  selectTriggerSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f7ff",
  },
  selectTriggerText: {
    fontSize: 16,
    color: "#1f2937",
    flex: 1,
    marginRight: 12,
    fontWeight: "500",
    flexShrink: 1,
  },
  selectPlaceholder: {
    color: "#9ca3af",
    fontWeight: "400",
  },
  selectArrow: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  selectArrowOpen: {
    transform: [{ rotate: "180deg" }],
  },
  selectArrowText: {
    fontSize: 12,
    color: "#6b7280",
  },
  selectDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 8,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    maxHeight: DROPDOWN_MAX_HEIGHT,
    zIndex: 1000,
  },
  sampleTextInputContainer: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    width: "100%",
  },
  sampleTextInput: {
    padding: 16,
    fontSize: 15,
    color: "#1f2937",
    minHeight: 100,
    maxHeight: 150,
    textAlignVertical: "top",
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "#28a745",
    borderRadius: 12,
    marginBottom: 16,
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
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: "#e5e7eb",
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#ffffff",
  },
  confirmButtonTextDisabled: {
    color: "#9ca3af",
  },
  loadingContainer: {
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#6b7280",
  },
  emptyContainer: {
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: "#9ca3af",
    textAlign: "center",
  },
  // Select Modal Styles
  selectModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 1000,
  },
  selectModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 500,
    maxHeight: "70%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 1001,
  },
  selectModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  selectModalTitle: {
    fontSize: 20,
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
  selectOptionsList: {
    maxHeight: 400,
  },
  selectOption: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  selectOptionSelected: {
    backgroundColor: "#dbeafe",
  },
  selectOptionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectOptionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  selectOptionIndicatorSelected: {
    borderColor: "#007AFF",
  },
  selectOptionIndicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
