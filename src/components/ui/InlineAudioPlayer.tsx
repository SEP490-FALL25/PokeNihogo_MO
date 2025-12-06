import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import React from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

type InlineAudioPlayerProps = {
  audioUrl: string;
  style?: ViewStyle;
  accentColor?: string; // progress + knob color
};

export default function InlineAudioPlayer({ audioUrl, style, accentColor = "#2dd4bf" }: InlineAudioPlayerProps) {
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false); // preparing/buffering
  const [position, setPosition] = React.useState(0); // ms
  const [duration, setDuration] = React.useState(0); // ms
  const knobX = React.useRef(new Animated.Value(0)).current;
  const [barWidth, setBarWidth] = React.useState(0);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const updateFromStatus = (status: AVPlaybackStatusSuccess) => {
    if (!status.isLoaded) return;
    // Reflect buffering state (including while starting playback)
    const buffering = (status as any)?.isBuffering;
    setIsLoading(Boolean(buffering));
    setPosition(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);
    if (status.didJustFinish) {
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  React.useEffect(() => {
    const progress = duration > 0 ? position / duration : 0;
    const x = (barWidth - 24) * progress; // subtract knob size to keep inside
    Animated.timing(knobX, { toValue: isNaN(x) ? 0 : x, duration: 100, useNativeDriver: true }).start();
  }, [position, duration, barWidth, knobX]);

  const ensureLoaded = async () => {
    if (sound) return sound;
    try {
      setIsLoading(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        (status) => {
          if (status.isLoaded) updateFromStatus(status as AVPlaybackStatusSuccess);
        }
      );
      setSound(newSound);
      // we'll turn off loading when the first status callback arrives (loaded/buffer state)
      return newSound;
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  const togglePlay = async () => {
    const s = await ensureLoaded();
    const current = (await s.getStatusAsync()) as AVPlaybackStatusSuccess;
    if (!current.isLoaded) return;
    if (current.isPlaying) {
      await s.pauseAsync();
      setIsPlaying(false);
    } else {
      await s.playAsync();
      setIsPlaying(true);
    }
  };

  const seekTo = async (ratio: number) => {
    const s = await ensureLoaded();
    const newPos = Math.max(0, Math.min(1, ratio)) * (duration || 0);
    await s.setPositionAsync(newPos);
    const status = (await s.getStatusAsync()) as AVPlaybackStatusSuccess;
    updateFromStatus(status);
  };

  return (
    <View style={[styles.container, style]}> 
      <TouchableOpacity onPress={togglePlay} activeOpacity={0.8} style={[styles.playWrapper, { borderColor: accentColor }]}> 
        <View style={[styles.playInner, { backgroundColor: `${accentColor}1A` /* ~10% opacity */ }]}> 
          {isLoading ? (
            <ActivityIndicator size="small" color={accentColor} />
          ) : isPlaying ? (
            <View style={styles.pauseIcon}>
              <View style={[styles.pauseBar, { backgroundColor: accentColor }]} />
              <View style={[styles.pauseBar, { backgroundColor: accentColor, marginLeft: 4 }]} />
            </View>
          ) : (
            <View style={[styles.playTriangle, { borderLeftColor: accentColor }]} />
          )}
        </View>
      </TouchableOpacity>

      <Text style={styles.timeText}>{formatTime(position)}</Text>

      <View style={styles.barWrap} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
        <Pressable
          onPress={(e) => {
            if (duration <= 0) return;
            const x = e.nativeEvent.locationX;
            seekTo(x / Math.max(1, barWidth));
          }}
          style={styles.barTouchable}
        >
          <View style={styles.barBase} />
          <View style={[styles.barFill, { width: duration > 0 ? `${(position / duration) * 100}%` : "0%", backgroundColor: accentColor }]} />
          <Animated.View style={[styles.knob, { backgroundColor: accentColor, transform: [{ translateX: knobX }] }]} />
        </Pressable>
      </View>

      <Text style={styles.timeText}>{formatTime(duration)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 28,
    paddingHorizontal: 12,
    paddingVertical: 10,},
  playWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  playInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 12,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#2dd4bf",
    marginLeft: 2,
  },
  pauseIcon: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  pauseBar: { width: 4, height: 16, borderRadius: 1 },
  timeText: { fontSize: 14, color: "#6b7280", width: 48, textAlign: "center" },
  barWrap: { flex: 1, paddingHorizontal: 10 },
  barTouchable: { height: 24, justifyContent: "center" },
  barBase: { position: "absolute", left: 0, right: 0, height: 4, borderRadius: 2, backgroundColor: "#e5e7eb" },
  barFill: { position: "absolute", left: 0, height: 4, borderRadius: 2 },
  knob: { position: "absolute", width: 24, height: 24, borderRadius: 12, top: 0, opacity: 0.9 },
});

