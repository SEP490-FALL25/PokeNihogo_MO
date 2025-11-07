import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  InteractionManager,
  ListRenderItem,
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

type MessageUpdate = (message: Message) => Message;

const devLog = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(...args);
  }
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

  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<FlatList<Message>>(null);

  // Control when translation should appear: wait until AI text "typing" ends
  const aiTypingEndsAtRef = useRef<number | null>(null);
  const pendingTranslationRef = useRef<string | null>(null);
  const translationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTranslationTimer = () => {
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
      translationTimeoutRef.current = null;
    }
  };

  const appendMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateLastAiMessage = useCallback((updater: MessageUpdate) => {
    setMessages((prev) => {
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].role === "ai") {
          const nextMessage = updater(prev[i]);
          if (nextMessage === prev[i]) {
            return prev;
          }
          const next = [...prev];
          next[i] = nextMessage;
          return next;
        }
      }
      return prev;
    });
  }, []);

  const scheduleApplyPendingTranslation = useCallback(() => {
    clearTranslationTimer();
    const now = Date.now();
    const endsAt = aiTypingEndsAtRef.current ?? now;
    const delay = Math.max(0, endsAt - now);
    translationTimeoutRef.current = setTimeout(() => {
      if (pendingTranslationRef.current) {
        const translation = pendingTranslationRef.current;
        pendingTranslationRef.current = null;
        updateLastAiMessage((message) => ({
          ...message,
          translation: translation ?? message.translation,
        }));
      }
      clearTranslationTimer();
    }, delay);
  }, [updateLastAiMessage]);

  const clearTypingInterval = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  };

  const startTypingAnimation = useCallback(
    (fullText: string | undefined) => {
      clearTypingInterval();
      if (!fullText || fullText.length === 0) {
        // No typing needed
        aiTypingEndsAtRef.current = Date.now();
        // If a translation was buffered for an empty text, apply immediately
        if (pendingTranslationRef.current) {
          const translation = pendingTranslationRef.current;
          pendingTranslationRef.current = null;
          updateLastAiMessage((message) => ({
            ...message,
            translation: translation ?? message.translation,
          }));
        }
        return;
      }

      const len = fullText.length;
      const perCharMs = 30;
      const minMs = 500;
      const maxMs = 5000;
      const typingMs = Math.min(maxMs, Math.max(minMs, len * perCharMs));
      aiTypingEndsAtRef.current = Date.now() + typingMs;

      let index = 0;
      // Reveal multiple characters per tick for a smoother feel
      const step = Math.max(1, Math.floor(len / Math.max(typingMs / 40, 1)));

      typingIntervalRef.current = setInterval(() => {
        index = Math.min(len, index + step);
        const current = fullText.slice(0, index);
        updateLastAiMessage((message) => ({
          ...message,
          text: current,
        }));
        if (index >= len) {
          clearTypingInterval();
          aiTypingEndsAtRef.current = Date.now();
          // Apply any pending translation now
          if (pendingTranslationRef.current) {
            const translation = pendingTranslationRef.current;
            pendingTranslationRef.current = null;
            updateLastAiMessage((message) => ({
              ...message,
              translation: translation ?? message.translation,
            }));
          }
        }
      }, 40);
    },
    [updateLastAiMessage]
  );

  const listData = useMemo(() => messages, [messages]);

  useEffect(() => {
    if (listData.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [listData]);

  const renderMessageItem = useCallback<ListRenderItem<Message>>(({ item }) => {
    const isUser = item.role === "user";
    return (
      <View
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
          {item.text ? (
            <ThemedText style={{ fontSize: 16 }}>{item.text}</ThemedText>
          ) : null}
          {item.translation ? (
            <ThemedText
              style={{
                fontSize: 15,
                opacity: 0.75,
                marginTop: item.text ? 6 : 0,
              }}
            >
              {item.translation}
            </ThemedText>
          ) : null}

          {item.audioUrl ? (
            <View style={{ marginTop: 8 }}>
              <AudioPlayer audioUrl={item.audioUrl} />
            </View>
          ) : null}
        </View>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const renderEmptyComponent = useCallback(
    () => (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 48,
        }}
      >
        <ThemedText style={{ opacity: 0.6 }}>
          Bắt đầu ghi âm để luyện hội thoại nhé!
        </ThemedText>
      </View>
    ),
    []
  );

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

  const saveBase64ToFile = async (
    base64Data: string,
    extension: string
  ): Promise<string> => {
    const ext = extension || "mp3";
    const fileUri = `${FileSystem.cacheDirectory}kaiwa-${Date.now()}.${ext}`;
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return fileUri;
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
      devLog("[SOCKET] Connected to AI conversation room");
      setIsSocketConnected(true);
      setIsConnecting(false);

      // Emit join event (no data, just join)
      socket.emit("join");
      setIsLoading(true);
    });

    // Listen for joined event (after join)
    socket.on("joined", (data: { conversationId?: string }) => {
      devLog("[SOCKET] Joined room:", data);
      if (data?.conversationId) {
        setConversationId(data.conversationId);
      }
      setIsLoading(false);
    });

    socket.on("disconnect", () => {
      devLog("[SOCKET] Disconnected from AI conversation room");
      setIsSocketConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("[SOCKET] Connection error:", error);
      setIsConnecting(false);
      setIsLoading(false);
    });

    // Listen for processing status
    socket.on("processing", (data: { status?: string; message?: string }) => {
      devLog("[SOCKET] Processing:", data);
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
      devLog("[SOCKET] Transcription:", data.text);
      if (data.text) {
        appendMessage({
          id: `user-${Date.now()}`,
          role: "user",
          text: data.text,
        });
      }
      setProcessingStatus(undefined);
    });

    // Listen for AI text response
    socket.on(
      "text-response",
      (data: { text?: string; translation?: string }) => {
        devLog("[SOCKET] AI Response:", data.text);
        if (data.text || data.translation) {
          appendMessage({
            id: `ai-${Date.now()}`,
            role: "ai",
            // Start empty to animate typing
            text: "",
            // Translation will be delayed if typing is ongoing
            translation: undefined,
          });
          // Kick off client-side typing animation
          startTypingAnimation(data.text);

          // If server already sent a translation, buffer it until typing ends
          if (data.translation) {
            pendingTranslationRef.current = data.translation;
            scheduleApplyPendingTranslation();
          } else {
            // Ensure timer cleared if no pending translation
            clearTranslationTimer();
          }
        }
        setProcessingStatus(undefined);
      }
    );

    // Listen for text response update (translation update)
    socket.on("text-response-update", (data: { translation?: string }) => {
      devLog("[SOCKET] Translation update:", data.translation);
      if (!data.translation) return;

      const now = Date.now();
      const endsAt = aiTypingEndsAtRef.current;
      if (endsAt && now < endsAt) {
        // Still typing AI text → buffer and schedule apply
        pendingTranslationRef.current = data.translation;
        scheduleApplyPendingTranslation();
      } else {
        // Typing finished → apply immediately
        updateLastAiMessage((message) => ({
          ...message,
          translation: data.translation,
        }));
      }
    });

    // Listen for AI audio response
    socket.on(
      "audio-response",
      (data: { audio?: string; audioFormat?: string }) => {
        devLog("[SOCKET] Audio response received");
        if (data.audio) {
          const ext = data.audioFormat || "mp3";
          // Save to cache file to avoid heavy data URI playback on JS thread
          saveBase64ToFile(data.audio, ext)
            .then((fileUri) => {
              // Schedule playback after current interactions to avoid jank
              InteractionManager.runAfterInteractions(() => {
                playAudio(fileUri);
              });
              // Attach file URI to last AI message
              updateLastAiMessage((message) => ({
                ...message,
                audioUrl: fileUri,
              }));
            })
            .catch((err) => {
              console.error("[AUDIO] Failed to write audio file:", err);
            });
        }
        setProcessingStatus(undefined);
        setIsSubmitting(false);
        // Do not interfere with typing animation; let it finish naturally.
        // Translation will be flushed when typing completes or by scheduled timer.
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
      clearTranslationTimer();
      clearTypingInterval();
    };
  }, [
    accessToken,
    topicId,
    appendMessage,
    updateLastAiMessage,
    scheduleApplyPendingTranslation,
    startTypingAnimation,
  ]);

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
          <FlatList
            ref={listRef}
            data={listData}
            keyExtractor={keyExtractor}
            renderItem={renderMessageItem}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 24,
              paddingTop: 12,
            }}
            ListEmptyComponent={renderEmptyComponent}
          />

          <View>
            <VoiceRecorder
              onRecordingComplete={(uri: string, _duration: number) => {
                handleRecordingComplete(uri, _duration);
              }}
              onRecordingStart={() => {
                setProcessingStatus(undefined);
              }}
              exerciseTitle={isSubmitting ? <AnimatedDots /> : processingStatus}
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
            {/* {processingStatus ? (
              <View
                style={{
                  alignItems: "center",
                  marginTop: 12,
                  paddingHorizontal: 16,
                }}
              >
                <ThemedText
                  style={{ fontSize: 13, opacity: 0.7, textAlign: "center" }}
                >
                  {processingStatus}
                </ThemedText>
              </View>
            ) : null} */}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
