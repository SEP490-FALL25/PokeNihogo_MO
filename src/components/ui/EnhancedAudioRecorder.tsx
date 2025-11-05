import { Ionicons } from "@expo/vector-icons";
import { useMicrophonePermission } from "@hooks/useMicrophonePermission";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import * as FileSystem from "expo-file-system";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface VoiceRecorderProps {
  onRecordingComplete?: (uri: string, duration: number) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onPlaybackStart?: () => void;
  onPlaybackStop?: () => void;
  maxDuration?: number; // in seconds
  disabled?: boolean;
  exerciseTitle?: string;
  showPlayback?: boolean;
  customSavePath?: string; // Custom path for saving recordings
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  onPlaybackStart,
  onPlaybackStop,
  maxDuration = 60,
  disabled = false,
  exerciseTitle,
  showPlayback = true,
  customSavePath,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  
  const { hasPermission, requestMicrophonePermission } = useMicrophonePermission();

  // Metering values for real-time audio visualization
  const [meteringValues, setMeteringValues] = useState<number[]>([]);
  const meteringHistoryRef = useRef<number[]>([]);
  const playbackIndexRef = useRef<number>(0);
  const playbackProgressRef = useRef<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const barWidth = 3;
  const barSpacing = 2;
  
  // Tính toán chiều rộng container (trừ padding card và container)
  const waveContainerWidth = width - 40 - 32 - 8; // width - container padding - card padding - scrollContent padding

  // Animation values for wave bars - dynamically created based on metering values
  const waveAnimationsRef = useRef<Map<number, Animated.Value>>(new Map());

  // Throttle refs for scroll updates
  const lastScrollTimeRef = useRef<number>(0);

  // Last metering values length to detect new bars
  const lastMeteringLengthRef = useRef<number>(0);

  // Timer ref for maxDuration auto-stop
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref to store stopRecording function for use in effect
  const stopRecordingRef = useRef<(() => Promise<void>) | undefined>(undefined);

  // Get or create animation value for a specific index
  const getAnimationValue = useCallback((index: number): Animated.Value => {
    if (!waveAnimationsRef.current.has(index)) {
      waveAnimationsRef.current.set(index, new Animated.Value(0));
    }
    return waveAnimationsRef.current.get(index)!;
  }, []);

  // Function to delete file from device
  const deleteFileFromDevice = async (uri: string) => {
    try {
      if (uri && uri.startsWith('file://')) {
        const fileExists = await FileSystem.getInfoAsync(uri);
        if (fileExists.exists) {
          await FileSystem.deleteAsync(uri);
          console.log('File deleted from device:', uri);
        }
      }
    } catch (error) {
      console.error('Failed to delete file from device:', error);
    }
  };

  // Function to create custom save path
  const createCustomSavePath = () => {
    if (customSavePath) {
      // Ensure directory exists
      const dirPath = customSavePath.endsWith('/') ? customSavePath : `${customSavePath}/`;
      return `${dirPath}recording_${Date.now()}.m4a`;
    }
    return null;
  };

  useEffect(() => {
    const recordingRef = recording;
    const soundRef = sound;
    const timerRef = maxDurationTimerRef.current;
    
    return () => {
      if (recordingRef) {
        recordingRef.stopAndUnloadAsync();
      }
      if (soundRef) {
        soundRef.unloadAsync();
      }
      // Clear maxDuration timer
      if (timerRef) {
        clearTimeout(timerRef);
      }
    };
  }, [recording, sound]);

  // Convert metering value (-160 to 0 dB) to normalized height (0 to 1)
  const normalizeMeteringValue = (value: number): number => {
    // Metering range is typically -160 (silence) to 0 (max)
    const minDb = -60; // Threshold for minimum visualization
    const maxDb = 0;

    const normalized = (value - minDb) / (maxDb - minDb);
    return Math.max(0, Math.min(1, normalized));
  };

  // Update wave animations - mượt mà với spring animation
  useEffect(() => {
    // Chỉ update bar cuối cùng (đang record) với spring animation để mượt mà
    // Các bars cũ giữ nguyên giá trị
    if (meteringValues.length > 0 && isRecording) {
      const lastIndex = meteringValues.length - 1;
      const value = meteringValues[lastIndex];
      const animValue = getAnimationValue(lastIndex);

      // Dùng spring cho bar cuối cùng để có animation mượt
      Animated.spring(animValue, {
        toValue: value,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }).start();
    } else if (meteringValues.length > 0) {
      // Khi không recording, set giá trị trực tiếp cho tất cả bars
      meteringValues.forEach((value, index) => {
        const animValue = getAnimationValue(index);
        animValue.setValue(value);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meteringValues.length, isRecording, getAnimationValue]);

  // Throttled scroll function - giảm throttle time để mượt hơn
  const performScroll = useCallback(
    (index: number, animated: boolean = true) => {
      const now = Date.now();
      // Giảm throttle time xuống 30ms để scroll mượt hơn
      if (now - lastScrollTimeRef.current < 30) {
        return;
      }
      lastScrollTimeRef.current = now;

      const scrollPosition = index * (barWidth + barSpacing) - width / 2 + 50;
      scrollViewRef.current?.scrollTo({
        x: Math.max(0, scrollPosition),
        animated,
      });
    },
    []
  );

  // Auto-scroll during recording - throttled
  useEffect(() => {
    if (isRecording && meteringHistoryRef.current.length > 0) {
      const currentIndex = meteringHistoryRef.current.length - 1;
      performScroll(currentIndex, true);
    }
  }, [meteringValues.length, isRecording, performScroll]);

  // Auto-scroll during playback - throttled
  // Sử dụng playbackPosition thay vì playbackIndexRef để trigger effect
  const playbackIndex = useRef(0);
  useEffect(() => {
    if (isPlaying && playbackPosition > 0 && playbackDuration > 0) {
      const newIndex = Math.floor(
        (playbackPosition / playbackDuration) *
          meteringHistoryRef.current.length
      );
      if (newIndex !== playbackIndex.current) {
        playbackIndex.current = newIndex;
        playbackIndexRef.current = newIndex;
        performScroll(newIndex, true);
      }
    }
  }, [playbackPosition, playbackDuration, isPlaying, performScroll]);

  // Auto-stop recording when maxDuration is reached
  useEffect(() => {
    if (isRecording && maxDuration && recordingDuration > 0) {
      const durationSeconds = recordingDuration / 1000;
      
      // Clear existing timer if any
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
      }
      
      // Calculate remaining time
      const remainingTime = maxDuration - durationSeconds;
      
      if (remainingTime <= 0) {
        // Already exceeded, stop immediately
        stopRecordingRef.current?.();
      } else {
        // Set timer to stop when maxDuration is reached
        maxDurationTimerRef.current = setTimeout(() => {
          stopRecordingRef.current?.();
        }, remainingTime * 1000);
      }
    }
    
    return () => {
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
        maxDurationTimerRef.current = null;
      }
    };
  }, [isRecording, recordingDuration, maxDuration]);

  // Update metering display during recording - update mỗi giá trị để mượt mà
  const updateMeteringDisplay = useCallback((metering: number) => {
    const normalized = normalizeMeteringValue(metering);

    // Lưu toàn bộ metering history
    meteringHistoryRef.current.push(normalized);

    // Update state mỗi giá trị để waveform mượt mà, không bị nhảy
    setMeteringValues([...meteringHistoryRef.current]);
  }, []);

  const formatTime = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Memoize timer text để giảm re-renders
  const timerText = useMemo(() => {
    return recordingUri
      ? `${formatTime(playbackPosition)} / ${formatTime(playbackDuration)}`
      : formatTime(recordingDuration);
  }, [
    recordingUri,
    playbackPosition,
    playbackDuration,
    recordingDuration,
    formatTime,
  ]);

  const startRecording = async () => {
    if (!hasPermission) {
      await requestMicrophonePermission();
      return;
    }

    if (disabled) return;

    try {
      // Delete previous recording file if exists
      if (recordingUri) {
        await deleteFileFromDevice(recordingUri);
      }

      // Configure audio mode for recording - tối đa hóa độ ưu tiên và giảm âm hệ thống
      // Lưu ý: Trong Expo managed workflow, không thể tắt hoàn toàn system sounds,
      // nhưng cấu hình này sẽ giúp yêu cầu audio focus và giảm âm khác xuống
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true, // giảm âm khác trên Android xuống mức tối thiểu
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix, // yêu cầu focus độc quyền - ngăn âm khác phát
        interruptionModeIOS: InterruptionModeIOS.DoNotMix, // ngăn mixing trên iOS - tạm dừng âm khác
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      // Create recording options with custom path if provided
      const baseOptions = {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          // Use AMR_WB in 3GP for Google STT
          extension: ".3gp",
          outputFormat: Audio.AndroidOutputFormat.THREE_GPP,
          audioEncoder: Audio.AndroidAudioEncoder.AMR_WB,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 16000,
        },
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          // Try LINEARPCM in .caf at 16kHz mono (LINEAR16)
          extension: ".caf",
          outputFormat: (Audio as any).IOSOutputFormat?.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
        },
        web: {
          // Web uses WebM (Opus). Google STT supports WEBM_OPUS.
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      } as any;

      const recordingOptions = customSavePath 
        ? {
            ...baseOptions,
            uri: createCustomSavePath(),
          }
        : baseOptions;

      const { recording: newRecording } = await Audio.Recording.createAsync(
        recordingOptions,
        (status) => {
          if (status.isRecording) {
            setRecordingDuration(status.durationMillis);

            // Update wave visualization with real metering data
            if (status.metering !== undefined) {
              updateMeteringDisplay(status.metering);
            }
          }
        },
        100 // Update interval in milliseconds
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      meteringHistoryRef.current = [];
      setMeteringValues([]);
      waveAnimationsRef.current.clear();
      lastMeteringLengthRef.current = 0;
      lastScrollTimeRef.current = 0;

      // Reset scroll position
      scrollViewRef.current?.scrollTo({ x: 0, animated: false });
      
      // Call callback
      onRecordingStart?.();
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert('Lỗi', 'Không thể bắt đầu ghi âm. Vui lòng thử lại.');
    }
  };

  const stopRecording = useCallback(async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      
      // Clear maxDuration timer
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
        maxDurationTimerRef.current = null;
      }
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const duration = recordingDuration / 1000; // Convert to seconds
      
      setRecordingUri(uri);
      setRecording(null);

      // Show full waveform after recording - hiển thị toàn bộ waveform
      setMeteringValues([...meteringHistoryRef.current]);

      // Scroll to end of waveform
      if (meteringHistoryRef.current.length > 0) {
        setTimeout(() => {
          performScroll(meteringHistoryRef.current.length - 1, true);
        }, 100);
      }

      // Call callbacks
      onRecordingStop?.();
      
      if (uri && onRecordingComplete) {
        onRecordingComplete(uri, duration);
      }

      // Restore a safer default audio mode after recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    } catch (err) {
      console.error("Failed to stop recording", err);
      Alert.alert('Lỗi', 'Không thể dừng ghi âm. Vui lòng thử lại.');
    }
  }, [recording, recordingDuration, onRecordingStop, onRecordingComplete, performScroll]);

  // Update stopRecording ref
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  const playSound = async () => {
    if (!recordingUri) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true, progressUpdateIntervalMillis: 50 }
      );

      setSound(newSound);
      setIsPlaying(true);
      onPlaybackStart?.();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          const position = status.positionMillis;
          const duration = status.durationMillis || 0;

          setPlaybackPosition(position);
          setPlaybackDuration(duration);

          // Calculate smooth progress
          if (duration > 0) {
            playbackProgressRef.current = position / duration;
            const newIndex = Math.floor(
              playbackProgressRef.current * meteringHistoryRef.current.length
            );

            // Chỉ update index nếu thay đổi đáng kể để giảm re-renders
            if (Math.abs(newIndex - playbackIndexRef.current) > 2) {
              playbackIndexRef.current = newIndex;
            }

            // Không cần update meteringValues trong playback callback
            // State đã được set khi stop recording
          }

          if (status.didJustFinish) {
            setIsPlaying(false);
            setPlaybackPosition(0);
            playbackIndexRef.current = 0;
            playbackProgressRef.current = 0;
            onPlaybackStop?.();
          }
        }
      });

      await newSound.playAsync();
    } catch (err) {
      console.error("Failed to play sound", err);
      Alert.alert('Lỗi', 'Không thể phát lại bản ghi âm.');
    }
  };

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
      onPlaybackStop?.();
    }
  };

  const deleteRecording = async () => {
    // Delete file from device if it exists
    if (recordingUri) {
      await deleteFileFromDevice(recordingUri);
    }
    
    if (sound) {
      await sound.unloadAsync();
    }
    setRecordingUri(null);
    setSound(null);
    setIsPlaying(false);
    setPlaybackPosition(0);
    setPlaybackDuration(0);
    setRecordingDuration(0);
    meteringHistoryRef.current = [];
    playbackIndexRef.current = 0;
    playbackProgressRef.current = 0;
    lastMeteringLengthRef.current = 0;
    lastScrollTimeRef.current = 0;
    setMeteringValues([]);
    waveAnimationsRef.current.clear();

    // Reset scroll position
    scrollViewRef.current?.scrollTo({ x: 0, animated: false });
  };

  // Show permission request UI if no permission
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.recordButton, disabled && styles.disabledButton]}
            onPress={requestMicrophonePermission}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <Ionicons name="mic-off" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.recordLabel}>
            Cấp quyền microphone
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Exercise Title */}
        {exerciseTitle && (
          <Text style={styles.exerciseTitle}>{exerciseTitle}</Text>
        )}
        
        {/* Wave Visualization - chỉ hiển thị khi đang recording hoặc có recording */}
        {(isRecording || recordingUri) && (
          <View style={styles.waveContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              meteringValues.length > 0 && {
                minWidth: waveContainerWidth,
                justifyContent: 'flex-start',
              }
            ]}
            removeClippedSubviews={true}
            scrollEnabled={false}
            bounces={false}
          >
            {meteringValues.map((value, index) => {
              const baseHeight = 8;
              const maxHeight = 80;
              const anim = getAnimationValue(index);
              
              // Tính toán để giữ bar width đồng bộ và phân bổ khoảng cách để fit ngang
              const totalBars = meteringValues.length;
              const targetBarWidth = 3; // giữ cố định để không bị phình to lúc đầu
              const minSpacing = barSpacing;
              const maxSpacing = 10;
              const dynamicSpacing = totalBars > 1
                ? Math.min(
                    maxSpacing,
                    Math.max(
                      minSpacing,
                      (waveContainerWidth - totalBars * targetBarWidth) / (totalBars - 1)
                    )
                  )
                : 0;
              const calculatedBarWidth = targetBarWidth;

              // Determine if this bar is in the played section during playback
              const isPlayed =
                recordingUri && index <= playbackIndexRef.current;
              const isCurrentBar =
                recordingUri && index === playbackIndexRef.current;

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.waveBar,
                    {
                      width: calculatedBarWidth,
                      borderRadius: calculatedBarWidth / 2,
                      height: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [baseHeight, maxHeight],
                      }),
                      backgroundColor: isPlayed
                        ? "#007AFF"
                        : isRecording
                          ? "#007AFF"
                          : "#C7C7CC",
                      opacity: isCurrentBar
                        ? 1
                        : isPlayed
                          ? 0.9
                          : isRecording
                            ? 0.6
                            : 0.4,
                      transform: [
                        {
                          scaleY: isCurrentBar ? 1.1 : 1,
                        },
                      ],
                      marginRight: index < totalBars - 1 ? dynamicSpacing : 0,
                    },
                  ]}
                />
              );
            })}
          </ScrollView>
        </View>
        )}

        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{timerText}</Text>
        </View>

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          {!recordingUri ? (
            // Recording Mode
            <View style={styles.recordingControls}>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive,
                  disabled && styles.disabledButton,
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={disabled}
                activeOpacity={0.8}
              >
                {isRecording ? (
                  <View style={styles.stopIcon} />
                ) : (
                  <View style={styles.micIconContainer}>
                    <Ionicons name="mic" size={26} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.recordLabel}>
                {isRecording ? "Nhấn để dừng" : "Nhấn để ghi âm"}
              </Text>
            </View>
          ) : showPlayback ? (
            // Playback Mode
            <View style={styles.playbackControls}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={deleteRecording}
                activeOpacity={0.7}
                disabled={disabled}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playButton}
                onPress={isPlaying ? pauseSound : playSound}
                activeOpacity={0.8}
                disabled={disabled}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={26}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  // Add save/export functionality here
                  console.log("Save recording:", recordingUri);
                }}
                activeOpacity={0.7}
                disabled={disabled}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color="#34C759"
                />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  waveContainer: {
    height: 60,
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 4,
    flexDirection: "row",
  },
  waveBar: {
    width: 3,
    backgroundColor: "#007AFF",
    borderRadius: 1.5,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  timerText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    fontVariant: ["tabular-nums"],
  },
  controlsContainer: {
    alignItems: "center",
  },
  recordingControls: {
    alignItems: "center",
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  recordButtonActive: {
    backgroundColor: "#FF3B30",
    shadowColor: "#FF3B30",
  },
  disabledButton: {
    backgroundColor: "#e5e7eb",
    opacity: 0.6,
  },
  micIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  recordLabel: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  exerciseTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  playbackControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default VoiceRecorder;
