import { ThemedText } from '@components/ThemedText';
import { IconSymbol } from '@components/ui/IconSymbol';
import { useMicrophonePermission } from '@hooks/useMicrophonePermission';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

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
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          onPlaybackStop?.();
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
      onPlaybackStop?.();
    }
  };

  const deleteRecording = () => {
    setRecordedUri(null);
    setRecordedDuration(0);
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
        <View style={styles.durationContainer}>
          <ThemedText style={styles.durationText}>
            {formatDuration(recordingDuration)}
          </ThemedText>
          <ThemedText style={styles.maxDurationText}>
            / {formatDuration(maxDuration)}
          </ThemedText>
        </View>
      )}

      {/* Playback Controls */}
      {recordedUri && showPlayback && (
        <View style={styles.playbackContainer}>
          <ThemedText style={styles.playbackTitle}>
            🎵 Bản ghi âm của bạn ({formatDuration(recordedDuration)})
          </ThemedText>
          
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
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
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
