import { ThemedText } from '@components/ThemedText';
import { IconSymbol } from '@components/ui/IconSymbol';
import { useMicrophonePermission } from '@hooks/useMicrophonePermission';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { Alert, PanResponder, StyleSheet, TouchableOpacity, View } from 'react-native';

interface AudioRecorderProps {
  onRecordingComplete?: (uri: string, duration: number) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onPlaybackStart?: () => void;
  onPlaybackStop?: () => void;
  maxDuration?: number; // in seconds
  disabled?: boolean;
  exerciseTitle?: string;
  showPlayback?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  onPlaybackStart,
  onPlaybackStop,
  maxDuration = 60,
  disabled = false,
  exerciseTitle = "Bài tập phát âm",
  showPlayback = true,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  
  const { hasPermission, requestMicrophonePermission } = useMicrophonePermission();

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [recording, sound]);

  const startRecording = async () => {
    if (!hasPermission) {
      await requestMicrophonePermission();
      return;
    }

    try {
      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      onRecordingStart?.();

      // Start duration counter
      const interval = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Auto-stop after max duration
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
        clearInterval(interval);
      }, maxDuration * 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Lỗi', 'Không thể bắt đầu ghi âm. Vui lòng thử lại.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      const duration = recordingDuration;
      
      setRecording(null);
      setRecordingDuration(0);
      setRecordedUri(uri);
      setRecordedDuration(duration);
      onRecordingStop?.();
      
      if (uri) {
        onRecordingComplete?.(uri, duration);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Lỗi', 'Không thể dừng ghi âm. Vui lòng thử lại.');
    }
  };

  const playRecording = async () => {
    if (!recordedUri) return;
    
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordedUri });
      setSound(newSound);
      setIsPlaying(true);
      onPlaybackStart?.();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPlaybackPosition(0);
            onPlaybackStop?.();
          } else if (status.positionMillis !== undefined && status.durationMillis !== undefined) {
            setPlaybackPosition(status.positionMillis / 1000);
            setPlaybackDuration(status.durationMillis / 1000);
          }
        }
      });

      await newSound.playAsync();
    } catch (error) {
      console.error('Failed to play recording:', error);
      Alert.alert('Lỗi', 'Không thể phát lại bản ghi âm.');
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setPlaybackPosition(0);
      onPlaybackStop?.();
    }
  };

  const deleteRecording = () => {
    setRecordedUri(null);
    setRecordedDuration(0);
    setPlaybackPosition(0);
    setPlaybackDuration(0);
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const seekToPosition = async (position: number) => {
    if (sound && playbackDuration > 0) {
      try {
        const seekPosition = (position / 100) * playbackDuration * 1000; // Convert to milliseconds
        await sound.setPositionAsync(seekPosition);
        setPlaybackPosition(position / 100 * playbackDuration);
      } catch (error) {
        console.error('Failed to seek:', error);
      }
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setIsSeeking(true);
    },
    onPanResponderMove: (evt, gestureState) => {
      if (playbackDuration > 0) {
        const progressBarWidth = 300; // Approximate width of progress bar
        const percentage = Math.max(0, Math.min(100, (gestureState.moveX / progressBarWidth) * 100));
        setPlaybackPosition((percentage / 100) * playbackDuration);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (playbackDuration > 0) {
        const progressBarWidth = 300;
        const percentage = Math.max(0, Math.min(100, (gestureState.moveX / progressBarWidth) * 100));
        seekToPosition(percentage);
      }
      setIsSeeking(false);
    },
  });

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, styles.disabledButton]}
          onPress={requestMicrophonePermission}
          disabled={disabled}
        >
          <IconSymbol name="mic.slash" size={24} color="#6b7280" />
          <ThemedText style={styles.buttonText}>
            Cấp quyền microphone
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.exerciseTitle}>{exerciseTitle}</ThemedText>
      
      <View style={styles.controls}>
        {!isRecording ? (
          <TouchableOpacity
            style={[styles.button, styles.recordButton]}
            onPress={startRecording}
            disabled={disabled}
          >
            <IconSymbol name="mic.fill" size={24} color="#ffffff" />
            <ThemedText style={[styles.buttonText, styles.recordButtonText]}>
              Bắt đầu ghi âm
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={stopRecording}
          >
            <IconSymbol name="stop.fill" size={24} color="#ffffff" />
            <ThemedText style={[styles.buttonText, styles.stopButtonText]}>
              Dừng ghi âm
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {isRecording && (
        <View style={styles.recordingProgressContainer}>
          <View style={styles.durationContainer}>
            <ThemedText style={styles.durationText}>
              {formatDuration(recordingDuration)}
            </ThemedText>
            <ThemedText style={styles.maxDurationText}>
              / {formatDuration(maxDuration)}
            </ThemedText>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(recordingDuration / maxDuration) * 100}%`,
                    backgroundColor: '#ef4444'
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      )}

      {/* Playback Controls */}
      {recordedUri && showPlayback && (
        <View style={styles.playbackContainer}>
          <ThemedText style={styles.playbackTitle}>
            🎵 Bản ghi âm của bạn ({formatDuration(recordedDuration)})
          </ThemedText>
          
          {/* Playback Progress */}
          <View style={styles.playbackProgressContainer}>
            <View style={styles.playbackTimeContainer}>
              <ThemedText style={styles.playbackTimeText}>
                {formatDuration(playbackPosition)}
              </ThemedText>
              <ThemedText style={styles.playbackTimeText}>
                {formatDuration(playbackDuration || recordedDuration)}
              </ThemedText>
            </View>
            <View style={styles.progressBarContainer} {...panResponder.panHandlers}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: playbackDuration > 0 ? `${(playbackPosition / playbackDuration) * 100}%` : '0%',
                      backgroundColor: isSeeking ? '#f59e0b' : '#10b981'
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
          
          <View style={styles.playbackControls}>
            {!isPlaying ? (
              <TouchableOpacity
                style={[styles.button, styles.playButton]}
                onPress={playRecording}
              >
                <IconSymbol name="play.fill" size={20} color="#ffffff" />
                <ThemedText style={[styles.buttonText, styles.playButtonText]}>
                  Phát lại
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.stopPlayButton]}
                onPress={stopPlayback}
              >
                <IconSymbol name="stop.fill" size={20} color="#ffffff" />
                <ThemedText style={[styles.buttonText, styles.stopPlayButtonText]}>
                  Dừng
                </ThemedText>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={deleteRecording}
            >
              <IconSymbol name="trash" size={20} color="#ffffff" />
              <ThemedText style={[styles.buttonText, styles.deleteButtonText]}>
                Xóa
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  recordButton: {
    backgroundColor: '#ef4444',
  },
  stopButton: {
    backgroundColor: '#6b7280',
  },
  disabledButton: {
    backgroundColor: '#e5e7eb',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  recordButtonText: {
    color: '#ffffff',
  },
  stopButtonText: {
    color: '#ffffff',
  },
  recordingProgressContainer: {
    marginTop: 12,
    width: '100%',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  maxDurationText: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  playbackContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    width: '100%',
  },
  playbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 12,
    textAlign: 'center',
  },
  playbackProgressContainer: {
    marginBottom: 16,
  },
  playbackTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  playbackTimeText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  playButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  stopPlayButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  stopPlayButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
});

export default AudioRecorder;
