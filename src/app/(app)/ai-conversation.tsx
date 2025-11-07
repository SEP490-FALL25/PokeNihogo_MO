import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Socket } from "socket.io-client";

import { ThemedText } from "@components/ThemedText";
import AudioPlayer from "@components/ui/AudioPlayer";
import VoiceRecorder from "@components/ui/EnhancedAudioRecorder";
import { disconnectSocket, getSocket } from "@configs/socket";
import { useAuthStore } from "@stores/auth/auth.config";

type Message = {
  id: string;
  role: "ai" | "user";
  text?: string;
  translation?: string;
  audioUrl?: string;
};

export default function AiConversationScreen() {
  const { topicId } = useLocalSearchParams<{ topicId?: string }>();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<
    string | undefined
  >();
  const [transcribedText, setTranscribedText] = useState<string | undefined>();

  const socketRef = useRef<Socket | null>(null);

  const AnimatedDots = () => {
    const dotAnimsRef = useState(() => [
      new Animated.Value(0),
      new Animated.Value(0),
      new Animated.Value(0),
    ])[0] as Animated.Value[];
    const animationsRef = useState<Animated.CompositeAnimation[]>([])[0];

    useEffect(() => {
      animationsRef.forEach((a) => a.stop());
      animationsRef.length = 0;

      const createBounce = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 350,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 350,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );

      const loops = dotAnimsRef.map((a, idx) => createBounce(a, idx * 150));
      loops.forEach((l) => l.start());
      loops.forEach((l) => animationsRef.push(l));
      return () => loops.forEach((l) => l.stop());
    }, [dotAnimsRef, animationsRef]);

    const renderDot = (anim: Animated.Value, key: string) => (
      <Animated.View
        key={key}
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: "#007AFF",
          marginHorizontal: 6,
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
          }),
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -6],
              }),
            },
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1.1],
              }),
            },
          ],
        }}
      />
    );

    return (
      <View style={{ flexDirection: "row", alignItems: "center", height: 18 }}>
        {dotAnimsRef.map((a, i) => renderDot(a, `dot-${i}`))}
      </View>
    );
  };

  const playAudio = async (audioUrl: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch {}
  };

  // Initialize WebSocket connection
  useEffect(() => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsConnecting(true);
    const socket = getSocket("kaiwa", accessToken);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[SOCKET] Connected to AI conversation room");
      setIsSocketConnected(true);
      setIsConnecting(false);

      // Emit join event (no data, just join)
      socket.emit("join");
      setIsLoading(true);
    });

    // Listen for joined event (after join)
    socket.on("joined", (data: { conversationId?: string }) => {
      console.log("[SOCKET] Joined room:", data);
      if (data?.conversationId) {
        setConversationId(data.conversationId);
      }
      setIsLoading(false);
    });

    socket.on("disconnect", () => {
      console.log("[SOCKET] Disconnected from AI conversation room");
      setIsSocketConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("[SOCKET] Connection error:", error);
      setIsConnecting(false);
      setIsLoading(false);
    });

    // Listen for processing status
    socket.on("processing", (data: { status?: string; message?: string }) => {
      console.log("[SOCKET] Processing:", data);
      const statusText =
        data.status === "speech-to-text"
          ? "Đang nhận diện giọng nói..."
          : data.status === "gemini-processing"
            ? "Đang xử lý với AI..."
            : data.status === "text-to-speech"
              ? "Đang tạo giọng nói..."
              : data.message || "Đang xử lý...";
      setProcessingStatus(statusText);
    });

    // Listen for transcription (user's speech to text)
    socket.on("transcription", (data: { text?: string }) => {
      console.log("[SOCKET] Transcription:", data.text);
      if (data.text) {
        setTranscribedText(data.text);
        setMessages((prev) => [
          ...prev,
          {
            id: `user-${Date.now()}`,
            role: "user",
            text: data.text,
          },
        ]);
      }
      setProcessingStatus(undefined);
    });

    // Listen for AI text response
    socket.on(
      "text-response",
      (data: { text?: string; translation?: string }) => {
        console.log("[SOCKET] AI Response:", data.text);
        if (data.text || data.translation) {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              role: "ai",
              text: data.text,
              translation: data.translation,
            },
          ]);
        }
        setProcessingStatus(undefined);
      }
    );

    // Listen for text response update (translation update)
    socket.on("text-response-update", (data: { translation?: string }) => {
      console.log("[SOCKET] Translation update:", data.translation);
      // Update last AI message with translation
      setMessages((prev) => {
        const updated = [...prev];
        const lastAiMessage = updated
          .slice()
          .reverse()
          .find((m) => m.role === "ai");
        if (lastAiMessage && data.translation) {
          lastAiMessage.translation = data.translation;
        }
        return updated;
      });
    });

    // Listen for AI audio response
    socket.on(
      "audio-response",
      (data: { audio?: string; audioFormat?: string }) => {
        console.log("[SOCKET] Audio response received");
        if (data.audio) {
          // Convert base64 to data URI and play
          const mimeType =
            data.audioFormat === "mp3"
              ? "audio/mpeg"
              : `audio/${data.audioFormat || "mp3"}`;
          const audioUri = `data:${mimeType};base64,${data.audio}`;
          playAudio(audioUri);

          // Update last AI message with audio
          setMessages((prev) => {
            const updated = [...prev];
            const lastAiMessage = updated
              .slice()
              .reverse()
              .find((m) => m.role === "ai");
            if (lastAiMessage) {
              lastAiMessage.audioUrl = audioUri;
            }
            return updated;
          });
        }
        setProcessingStatus(undefined);
        setIsSubmitting(false);
      }
    );

    // Listen for errors
    socket.on("error", (error: { message?: string }) => {
      console.error("[SOCKET] Error:", error);
      setProcessingStatus(undefined);
      setIsSubmitting(false);
      // Show error message to user (optional)
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("joined");
      socket.off("processing");
      socket.off("transcription");
      socket.off("text-response");
      socket.off("text-response-update");
      socket.off("audio-response");
      socket.off("error");
      disconnectSocket();
    };
  }, [accessToken, topicId]);

  // Send audio to server via WebSocket
  // Backend expects Int16Array buffer via "user-audio-chunk" event
  const sendAudioToServer = async (uri: string): Promise<void> => {
    if (!socketRef.current || !socketRef.current.connected) {
      throw new Error("Socket not connected");
    }

    try {
      // Read audio file as base64
      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to binary string manually (React Native doesn't have atob)
      // Base64 decode function for React Native
      const base64Decode = (base64: string): Uint8Array => {
        const chars =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        const lookup = new Uint8Array(256);
        for (let i = 0; i < chars.length; i++) {
          lookup[chars.charCodeAt(i)] = i;
        }

        let bufferLength = base64.length * 0.75;
        if (base64[base64.length - 1] === "=") {
          bufferLength--;
          if (base64[base64.length - 2] === "=") {
            bufferLength--;
          }
        }

        const bytes = new Uint8Array(bufferLength);
        let p = 0;
        for (let i = 0; i < base64.length; i += 4) {
          const encoded1 = lookup[base64.charCodeAt(i)];
          const encoded2 = lookup[base64.charCodeAt(i + 1)];
          const encoded3 = lookup[base64.charCodeAt(i + 2)];
          const encoded4 = lookup[base64.charCodeAt(i + 3)];

          bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
          bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
          bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }

        return bytes;
      };

      // Decode base64 to Uint8Array
      const audioBytes = base64Decode(audioBase64);

      // Send as ArrayBuffer (backend will handle Int16Array conversion if needed)
      // Socket.IO can handle ArrayBuffer natively
      socketRef.current.emit("user-audio-chunk", audioBytes.buffer);

      console.log(
        "[SOCKET] Audio sent, size:",
        audioBytes.buffer.byteLength,
        "bytes"
      );
    } catch (error) {
      console.error("[SOCKET] Error preparing audio:", error);
      throw error;
    }
  };

  const handleRecordingComplete = async (uri: string, durationSec: number) => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      const isLikelySilent =
        !info.exists || (info.size ?? 0) < 2000 || (durationSec ?? 0) < 0.5;

      if (isLikelySilent) {
        setProcessingStatus("Không phát hiện âm thanh. Thử lại nhé.");
        return;
      }

      setIsSubmitting(true);
      setTranscribedText(undefined);
      setProcessingStatus("Đang gửi audio...");

      // Use WebSocket if connected, otherwise fallback to old method
      if (socketRef.current && socketRef.current.connected) {
        await sendAudioToServer(uri);
        // Events will be received: processing -> transcription -> text-response -> audio-response
      } else {
        console.warn("[SOCKET] Not connected, cannot send audio");
        setIsSubmitting(false);
        setProcessingStatus("Không thể kết nối tới máy chủ.");
      }
    } catch (error) {
      console.error("[RECORDING] Error:", error);
      setIsSubmitting(false);
      setProcessingStatus("Có lỗi khi gửi audio.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View
        style={{
          height: 52,
          alignItems: "center",
          flexDirection: "row",
          paddingHorizontal: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <ArrowLeftIcon size={20} color="#1f2937" />
        </TouchableOpacity>
        <ThemedText style={{ fontSize: 18, fontWeight: "700", marginLeft: 4 }}>
          Conversation
        </ThemedText>
      </View>

      {isLoading || isConnecting ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
          <ThemedText style={{ marginTop: 12, opacity: 0.7 }}>
            {isConnecting ? "Đang kết nối..." : "Đang tải..."}
          </ThemedText>
        </View>
      ) : !isSocketConnected && !topicId ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ThemedText style={{ opacity: 0.7 }}>
            Không thể kết nối. Vui lòng thử lại.
          </ThemedText>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          >
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <View
                  key={m.id}
                  style={{
                    marginTop: 12,
                    alignItems: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: isUser ? "#DCFCE7" : "#ffffff",
                      borderRadius: 14,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      maxWidth: "85%",
                      borderWidth: 1,
                      borderColor: "rgba(0,0,0,0.06)",
                    }}
                  >
                    {m.text ? (
                      <ThemedText style={{ fontSize: 16 }}>{m.text}</ThemedText>
                    ) : null}
                    {m.translation ? (
                      <ThemedText
                        style={{
                          fontSize: 15,
                          opacity: 0.75,
                          marginTop: m.text ? 6 : 0,
                        }}
                      >
                        {m.translation}
                      </ThemedText>
                    ) : null}

                    {m.audioUrl ? (
                      <View style={{ marginTop: 8 }}>
                        <AudioPlayer audioUrl={m.audioUrl} />
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View>
            <VoiceRecorder
              onRecordingComplete={(uri: string, _duration: number) => {
                handleRecordingComplete(uri, _duration);
              }}
              onRecordingStart={() => {
                setTranscribedText(undefined);
                setProcessingStatus(undefined);
              }}
              exerciseTitle={isSubmitting ? <AnimatedDots /> : undefined}
              showPlayback={false}
              showWaveform={false}
              disabled={isSubmitting || !isSocketConnected}
              maxDuration={10}
              showSaveButton={false}
              showDeleteButton={false}
              autoStopOnSilence={true}
              silenceDurationSeconds={4}
              silenceDbThreshold={-50}
            />
            {!isSocketConnected && (
              <View
                style={{
                  alignItems: "center",
                  marginTop: 8,
                  paddingHorizontal: 16,
                }}
              >
                <ThemedText
                  style={{ fontSize: 12, opacity: 0.6, textAlign: "center" }}
                >
                  Đang kết nối với AI...
                </ThemedText>
              </View>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
