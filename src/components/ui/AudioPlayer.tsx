// ============================================================================
// IMPORTS
// ============================================================================
import { Audio } from "expo-av";
import { Loader2, Volume2 } from "lucide-react-native";
import React from "react";
import { Animated, Easing, TouchableOpacity, View } from "react-native";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface AudioPlayerProps {
  audioUrl: string;
  onPlaybackStatusUpdate?: (status: any) => void;
  style?: any;
  buttonStyle?: any;
  disabled?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AudioPlayer({
  audioUrl,
  onPlaybackStatusUpdate,
  style,
  buttonStyle,
  disabled = false,
}: AudioPlayerProps) {
  // ============================================================================
  // STATE & REFS
  // ============================================================================
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  // ============================================================================
  // EFFECTS
  // ============================================================================
  /**
   * Cleanup effect - unloads audio when component unmounts
   */
  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // ============================================================================
  // AUDIO MANAGEMENT FUNCTIONS
  // ============================================================================
  /**
   * Loads audio from URL with optional autoplay
   * @param shouldAutoPlay - Whether to start playing immediately after loading
   */
  const loadAudio = async (shouldAutoPlay = false) => {
    try {
      setIsLoading(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: shouldAutoPlay },
        (status) => {
          // Handle audio completion
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
            // Cleanup audio for replay capability
            setTimeout(() => {
              newSound.unloadAsync();
              setSound(null);
            }, 100); // Small delay to ensure cleanup completes
          }
          // Call parent callback if provided
          onPlaybackStatusUpdate?.(status);
        }
      );
      setSound(newSound);

      // If autoplay is needed, start playing immediately after loading
      if (shouldAutoPlay) {
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error loading audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles play/pause functionality
   * Loads audio if not already loaded, then toggles playback
   */
  const playAudio = async () => {
    // If no sound or sound was cleaned up, load and play immediately
    if (!sound) {
      await loadAudio(true); // Autoplay after loading
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
      // Reset state on error
      setIsPlaying(false);
    }
  };

  /**
   * Animation effect for playing state - creates pulsing animation
   */
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
      // Reset animation to initial state
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying, scaleAnim]);

  // Loading spinner rotation
  React.useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    if (isLoading) {
      rotateAnim.setValue(0);
      loop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [isLoading, rotateAnim]);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <View style={style}>
      <TouchableOpacity
        onPress={playAudio}
        disabled={disabled || isLoading}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[
          {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: isPlaying ? "#3b82f6" : "#e5e7eb",
            backgroundColor: isPlaying ? "rgba(59,130,246,0.1)" : "#ffffff",
            opacity: disabled || isLoading ? 0.5 : 1,
          },
          buttonStyle,
        ]}
      >
        <Animated.View
          style={{
            transform: [
              { scale: scaleAnim },
              // rotate only while loading
              ...(isLoading
                ? [
                    {
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ]
                : []),
            ],
          }}
        >
          {isLoading ? (
            <Loader2 size={18} color="#3b82f6" />
          ) : (
            <Volume2 size={18} color="#3b82f6" />
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}
