import { ThemedText } from "@components/ThemedText";
import { Audio } from "expo-av";
import React from "react";
import { Animated, TouchableOpacity, View } from "react-native";

interface AudioPlayerProps {
  audioUrl: string;
  onPlaybackStatusUpdate?: (status: any) => void;
  style?: any;
  buttonStyle?: any;
  disabled?: boolean;
}

export default function AudioPlayer({
  audioUrl,
  onPlaybackStatusUpdate,
  style,
  buttonStyle,
  disabled = false,
}: AudioPlayerProps) {
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    return () => {
      // Cleanup khi component unmount
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadAudio = async (shouldAutoPlay = false) => {
    try {
      setIsLoading(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: shouldAutoPlay },
        (status) => {
          // Xử lý khi audio kết thúc
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
            // Cleanup audio để có thể replay
            setTimeout(() => {
              newSound.unloadAsync();
              setSound(null);
            }, 100); // Delay nhỏ để đảm bảo cleanup hoàn tất
          }
          // Gọi callback từ parent nếu có
          onPlaybackStatusUpdate?.(status);
        }
      );
      setSound(newSound);

      // Nếu cần autoplay, phát ngay sau khi load
      if (shouldAutoPlay) {
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error loading audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async () => {
    // Nếu không có sound hoặc sound đã bị cleanup, load và phát luôn
    if (!sound) {
      await loadAudio(true); // Autoplay sau khi load
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      // Nếu có lỗi, reset state
      setIsPlaying(false);
    }
  };

  // Animation effect khi đang phát
  React.useEffect(() => {
    if (isPlaying) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      // Reset animation về trạng thái ban đầu
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying, scaleAnim]);

  return (
    <View style={style}>
      <TouchableOpacity
        onPress={playAudio}
        disabled={disabled || isLoading}
        activeOpacity={0.8}
        style={[
          {
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: isPlaying ? "#3b82f6" : "#e5e7eb",
            backgroundColor: isPlaying ? "rgba(59,130,246,0.1)" : "#ffffff",
            opacity: disabled || isLoading ? 0.5 : 1,
          },
          buttonStyle,
        ]}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <ThemedText style={{ fontSize: 24 }}>
            {isLoading ? "⏳" : isPlaying ? "⏸️" : "▶️"}
          </ThemedText>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}
