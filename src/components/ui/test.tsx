import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface VoiceRecorderProps {
  onRecordingComplete?: (uri: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);

  // Metering values for real-time audio visualization
  const [meteringValues, setMeteringValues] = useState<number[]>([]);
  const meteringHistoryRef = useRef<number[]>([]);
  const playbackIndexRef = useRef<number>(0);
  const playbackProgressRef = useRef<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const barWidth = 3;
  const barSpacing = 2;
  
  // Animation values for wave bars - dynamically created based on metering values
  const waveAnimationsRef = useRef<Map<number, Animated.Value>>(new Map());
  
  // Throttle refs for scroll updates
  const lastScrollTimeRef = useRef<number>(0);
  
  // Last metering values length to detect new bars
  const lastMeteringLengthRef = useRef<number>(0);
  
  // Get or create animation value for a specific index
  const getAnimationValue = useCallback((index: number): Animated.Value => {
    if (!waveAnimationsRef.current.has(index)) {
      waveAnimationsRef.current.set(index, new Animated.Value(0));
    }
    return waveAnimationsRef.current.get(index)!;
  }, []);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const performScroll = useCallback((index: number, animated: boolean = true) => {
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
  }, []);

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
        (playbackPosition / playbackDuration) * meteringHistoryRef.current.length
      );
      if (newIndex !== playbackIndex.current) {
        playbackIndex.current = newIndex;
        playbackIndexRef.current = newIndex;
        performScroll(newIndex, true);
      }
    }
  }, [playbackPosition, playbackDuration, isPlaying, performScroll]);

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
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);
  
  // Memoize timer text để giảm re-renders
  const timerText = useMemo(() => {
    return recordingUri
      ? `${formatTime(playbackPosition)} / ${formatTime(playbackDuration)}`
      : formatTime(recordingDuration);
  }, [recordingUri, playbackPosition, playbackDuration, recordingDuration, formatTime]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          android: {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
          },
          ios: {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
            extension: '.m4a',
            audioQuality: Audio.IOSAudioQuality.HIGH,
          },
          web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
          },
        },
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

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      meteringHistoryRef.current = [];
      setMeteringValues([]);
      waveAnimationsRef.current.clear();
      lastMeteringLengthRef.current = 0;
      lastScrollTimeRef.current = 0;
      
      // Reset scroll position
      scrollViewRef.current?.scrollTo({ x: 0, animated: false });
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
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

      if (uri && onRecordingComplete) {
        onRecordingComplete(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

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
          }
        }
      });

      await newSound.playAsync();
    } catch (err) {
      console.error('Failed to play sound', err);
    }
  };

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (sound) {
      sound.unloadAsync();
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

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Wave Visualization */}
        <View style={styles.waveContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            removeClippedSubviews={true}
            scrollEnabled={false}
            bounces={false}
          >
            {meteringValues.map((value, index) => {
              const baseHeight = 8;
              const maxHeight = 80;
              const anim = getAnimationValue(index);
              
              // Determine if this bar is in the played section during playback
              const isPlayed = recordingUri && index <= playbackIndexRef.current;
              const isCurrentBar = recordingUri && index === playbackIndexRef.current;
              
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.waveBar,
                    {
                      height: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [baseHeight, maxHeight],
                      }),
                      backgroundColor: isPlayed ? '#007AFF' : (isRecording ? '#007AFF' : '#C7C7CC'),
                      opacity: isCurrentBar ? 1 : (isPlayed ? 0.9 : (isRecording ? 0.6 : 0.4)),
                      transform: [
                        {
                          scaleY: isCurrentBar ? 1.1 : 1,
                        },
                      ],
                      marginRight: barSpacing,
                    },
                  ]}
                />
              );
            })}
          </ScrollView>
        </View>

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
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.8}
              >
                {isRecording ? (
                  <View style={styles.stopIcon} />
                ) : (
                  <View style={styles.micIconContainer}>
                    <Ionicons name="mic" size={32} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.recordLabel}>
                {isRecording ? 'Nhấn để dừng' : 'Nhấn để ghi âm'}
              </Text>
            </View>
          ) : (
            // Playback Mode
            <View style={styles.playbackControls}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={deleteRecording}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playButton}
                onPress={isPlaying ? pauseSound : playSound}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={32}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  // Add save/export functionality here
                  console.log('Save recording:', recordingUri);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-circle-outline" size={24} color="#34C759" />
              </TouchableOpacity>
            </View>
          )}
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
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  waveContainer: {
    height: 100,
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#007AFF',
    borderRadius: 1.5,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#000',
    fontVariant: ['tabular-nums'],
  },
  controlsContainer: {
    alignItems: 'center',
  },
  recordingControls: {
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  recordButtonActive: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
  },
  micIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIcon: {
    width: 28,
    height: 28,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  recordLabel: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VoiceRecorder;