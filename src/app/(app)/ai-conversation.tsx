import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeftIcon, Menu, ShieldCheck, Sparkles } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  InteractionManager,
  ListRenderItem,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Socket } from "socket.io-client";

import { ConversationListSheet } from "@components/conversation/ConversationListSheet";
import { ThemedText } from "@components/ThemedText";
import AudioPlayer from "@components/ui/AudioPlayer";
import VoiceRecorder from "@components/ui/EnhancedAudioRecorder";
import { disconnectSocket, getSocket } from "@configs/socket";
import { SubscriptionFeatureKey } from "@constants/subscription.enum";
import { useAuth } from "@hooks/useAuth";
import { useSubscriptionMarketplacePackages } from "@hooks/useSubscription";
import { useCheckFeature } from "@hooks/useSubscriptionFeatures";
import { ROUTES } from "@routes/routes";
import {
  ConversationRoom,
  GetConversationRoomsResponse,
} from "@services/conversation";
import { useAuthStore } from "@stores/auth/auth.config";
import { useQueryClient } from "@tanstack/react-query";

type Message = {
  id: string;
  role: "ai" | "user";
  text?: string;
  translation?: string;
  audioUrl?: string;
  messageId?: string | number; // Backend message ID for audio updates (can be string or number)
};

type MarketplaceFeature = {
  id: number;
  featureId: number;
  value?: string | null;
  feature?: {
    id: number;
    featureKey?: string;
    nameKey?: string;
    nameTranslation?: string;
  };
};

type MarketplacePlan = {
  id: number;
  subscriptionId: number;
  price: number;
  type: string;
  durationInDays?: number | null;
  isActive: boolean;
};

type MarketplacePackage = {
  id: number;
  tagName?: string;
  nameTranslation?: string;
  descriptionTranslation?: string;
  plans?: MarketplacePlan[];
  features?: MarketplaceFeature[];
  isPopular?: boolean;
  canBuy?: boolean;
};

type MessageUpdate = (message: Message) => Message;

type RoomUpdatePayload = Partial<Omit<ConversationRoom, "conversationId">> & {
  conversationId: string;
};

const devLog = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};

// Helper component for user avatar with error handling
const UserAvatarWithFallback = ({
  avatar,
  name,
}: {
  avatar?: string;
  name: string;
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: !avatar || imageError ? "#007AFF" : "transparent",
      }}
    >
      {!avatar || imageError ? (
        <View
          style={{
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ThemedText
            style={{
              color: "#ffffff",
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {name.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
      ) : (
        <Image
          source={{ uri: avatar }}
          style={{
            width: "100%",
            height: "100%",
          }}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}
    </View>
  );
};

export default function AiConversationScreen() {
  const { t } = useTranslation();
  const { topicId, conversationId: initialConversationId } =
    useLocalSearchParams<{
      topicId?: string;
      conversationId?: string;
    }>();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { user } = useAuth();
  const hasAIKaiwa = useCheckFeature(SubscriptionFeatureKey.AI_KAIWA);
  // const hasAIKaiwa = true;
  const {
    data: marketplaceResponse,
    isLoading: isMarketplaceLoading,
  } = useSubscriptionMarketplacePackages();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<
    string | undefined
  >();
  const [isListSheetOpen, setIsListSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const socketRef = useRef<Socket | null>(null);
  const pendingNewRoomRef = useRef(false);
  const updateRoomCache = useCallback(
    (roomUpdate: RoomUpdatePayload) => {
      if (!roomUpdate?.conversationId) {
        return;
      }

      queryClient.setQueriesData<GetConversationRoomsResponse | undefined>(
        { queryKey: ["conversation-rooms"] },
        (old) => {
          if (!old?.data) {
            return old;
          }

          const existingIndex = old.data.results.findIndex(
            (room) => room.conversationId === roomUpdate.conversationId
          );

          const nextRoom: ConversationRoom =
            existingIndex >= 0
              ? {
                  ...old.data.results[existingIndex],
                  ...roomUpdate,
                }
              : {
                  conversationId: roomUpdate.conversationId,
                  title: roomUpdate.title ?? "Cuộc trò chuyện mới",
                  lastMessage: roomUpdate.lastMessage ?? "",
                  lastMessageAt: roomUpdate.lastMessageAt,
                };

          const nextResults =
            existingIndex >= 0
              ? old.data.results.map((room, index) =>
                  index === existingIndex ? nextRoom : room
                )
              : [nextRoom, ...old.data.results];

          return {
            ...old,
            data: {
              ...old.data,
              results: nextResults,
            },
          };
        }
      );
    },
    [queryClient]
  );
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

  const updateMessageById = useCallback(
    (messageId: string | number, updater: MessageUpdate) => {
      setMessages((prev) => {
        // Compare messageIds (handle both string and number)
        const index = prev.findIndex((msg) => {
          if (msg.messageId === undefined || messageId === undefined)
            return false;
          return String(msg.messageId) === String(messageId);
        });
        if (index === -1) return prev;
        const nextMessage = updater(prev[index]);
        if (nextMessage === prev[index]) {
          return prev;
        }
        const next = [...prev];
        next[index] = nextMessage;
        return next;
      });
    },
    []
  );

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

  const marketplacePackages: MarketplacePackage[] | undefined = useMemo(() => {
    return marketplaceResponse?.data?.data as MarketplacePackage[] | undefined;
  }, [marketplaceResponse]);

  const ultraPackage = useMemo(() => {
    if (!marketplacePackages) {
      return undefined;
    }
    return marketplacePackages.find(
      (pkg) =>
        pkg.tagName?.toUpperCase() === "ULTRA" ||
        pkg.nameTranslation?.toLowerCase().includes("ultra")
    );
  }, [marketplacePackages]);

  const ultraFeatures = useMemo(() => {
    return (
      ultraPackage?.features
        ?.map((feature) => {
          const name = feature.feature?.nameTranslation;
          if (!name) return null;
          const valueSuffix =
            feature.value && feature.value !== "null"
              ? ` (x${feature.value})`
              : "";
          return `${name}${valueSuffix}`;
        })
        ?.filter((item): item is string => Boolean(item)) ?? []
    );
  }, [ultraPackage]);

  const ultraPlanPrice = ultraPackage?.plans?.[0]?.price;

  const formattedUltraPrice = useMemo(() => {
    if (!ultraPlanPrice) return undefined;
    try {
      return `${new Intl.NumberFormat("vi-VN").format(ultraPlanPrice)}₫/tháng`;
    } catch {
      return `${ultraPlanPrice.toLocaleString()}₫/tháng`;
    }
  }, [ultraPlanPrice]);

  const priceHighlightText = useMemo(() => {
    if (!formattedUltraPrice) return undefined;
    return `Chỉ ${formattedUltraPrice}`;
  }, [formattedUltraPrice]);

  const priceSubHighlight = useMemo(() => {
    if (!ultraFeatures || ultraFeatures.length === 0) return undefined;
    const priorityKeywords = ["kaiwa", "xp", "kinh nghiệm", "xu", "coin"];
    const prioritized = ultraFeatures.filter((feature) => {
      const lower = feature.toLowerCase();
      return priorityKeywords.some((keyword) => lower.includes(keyword));
    });
    const highlightSource =
      prioritized.length > 0 ? prioritized : ultraFeatures;
    return highlightSource
      .slice(0, 2)
      .map((feature) => feature.replace(/\(x[0-9.]+\)/i, "").trim())
      .join(" · ");
  }, [ultraFeatures]);

  const heroContent = useMemo(
    () => ({
      badge: t("home.ai.conversation.hero_badge"),
      title: t("home.ai.conversation.hero_title"),
      subtitle: t("home.ai.conversation.hero_subtitle"),
    }),
    [t]
  );

  const heroStats = useMemo(
    () => [
      {
        value: t("home.ai.conversation.hero_stats_response_value"),
        label: t("home.ai.conversation.hero_stats_response_label"),
      },
      {
        value: t("home.ai.conversation.hero_stats_speed_value"),
        label: t("home.ai.conversation.hero_stats_speed_label"),
      },
      {
        value: t("home.ai.conversation.hero_stats_consistency_value"),
        label: t("home.ai.conversation.hero_stats_consistency_label"),
      },
    ],
    [t]
  );

  const featureHighlights = useMemo(() => {
    if (ultraFeatures && ultraFeatures.length > 0) {
      return ultraFeatures.slice(0, 3);
    }
    return [
      t("home.ai.conversation.feature_feedback"),
      t("home.ai.conversation.feature_library"),
      t("home.ai.conversation.feature_rewards"),
    ];
  }, [ultraFeatures, t]);

  const socialProofText = useMemo(
    () => t("home.ai.conversation.social_proof"),
    [t]
  );

  const guaranteeCopy = useMemo(
    () => ({
      title: t("home.ai.conversation.guarantee_title"),
      subtitle: t("home.ai.conversation.guarantee_subtitle"),
    }),
    [t]
  );

  useEffect(() => {
    if (listData.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [listData]);

  const renderMessageItem = useCallback<ListRenderItem<Message>>(
    ({ item }) => {
      const isUser = item.role === "user";
      const userAvatar = user?.avatar;
      const userName = user?.name || "User";

      return (
        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: isUser ? "flex-end" : "flex-start",
            paddingHorizontal: 4,
          }}
        >
          {!isUser && (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                marginRight: 8,
                overflow: "hidden",
                backgroundColor: "#f3f4f6",
              }}
            >
              <Image
                source={require("../../../assets/images/PokeNihongoLogo.png")}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                resizeMode="cover"
              />
            </View>
          )}
          <View
            style={{
              backgroundColor: isUser ? "#007AFF" : "#ffffff",
              borderRadius: 14,
              paddingVertical: 10,
              paddingHorizontal: 12,
              maxWidth: "75%",
              borderWidth: isUser ? 0 : 1,
              borderColor: "rgba(0,0,0,0.06)",
            }}
          >
            {item.text ? (
              <ThemedText
                style={{
                  fontSize: 16,
                  color: isUser ? "#ffffff" : undefined,
                }}
              >
                {item.text}
              </ThemedText>
            ) : null}
            {item.translation ? (
              <ThemedText
                style={{
                  fontSize: 15,
                  opacity: isUser ? 0.9 : 0.75,
                  marginTop: item.text ? 6 : 0,
                  color: isUser ? "#ffffff" : undefined,
                }}
              >
                {item.translation}
              </ThemedText>
            ) : null}

            {/* Always show audio player, disabled if no audioUrl */}
            <View style={{ marginTop: 8 }}>
              <AudioPlayer
                audioUrl={item.audioUrl || null}
                iconColor={isUser ? "#ffffff" : "#3b82f6"}
                buttonStyle={
                  isUser
                    ? {
                        borderColor: "rgba(255,255,255,0.3)",
                        backgroundColor: "rgba(255,255,255,0.2)",
                      }
                    : undefined
                }
              />
            </View>
          </View>
          {isUser && (
            <View style={{ marginLeft: 8 }}>
              <UserAvatarWithFallback avatar={userAvatar} name={userName} />
            </View>
          )}
        </View>
      );
    },
    [user]
  );

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
          {t("home.ai.conversation.empty_message")}
        </ThemedText>
      </View>
    ),
    [t]
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

    // Don't connect if user doesn't have subscription
    if (!hasAIKaiwa) {
      setIsLoading(false);
      setIsConnecting(false);
      return;
    }

    setIsConnecting(true);
    const socket = getSocket("kaiwa", accessToken);
    socketRef.current = socket;

    socket.on("connect", () => {
      devLog("[SOCKET] Connected to AI conversation room");
      setIsSocketConnected(true);
      setIsConnecting(false);

      // Emit join event - use join-kaiwa-room with optional conversationId
      if (initialConversationId) {
        // Join existing conversation immediately
        socket.emit("join-kaiwa-room", {
          conversationId: initialConversationId,
        });
        setConversationId(initialConversationId);
        setIsLoading(true);
      } else {
        // Wait for the user to start speaking before creating a room
        setIsLoading(false);
      }
    });

    // Listen for joined event (after join)
    socket.on("joined", (data: { conversationId?: string }) => {
      devLog("[SOCKET] Joined room:", data);
      const wasPendingNewRoom = pendingNewRoomRef.current;
      // Reset pending flag to avoid accidental future invalidations
      pendingNewRoomRef.current = false;
      if (data?.conversationId) {
        setConversationId(data.conversationId);
      }
      setIsLoading(false);
      if (wasPendingNewRoom && data?.conversationId) {
        queryClient.invalidateQueries({ queryKey: ["conversation-rooms"] });
      }
    });

    // Listen for history event (load previous messages when joining existing conversation)
    socket.on(
      "history",
      (data: {
        messages?: {
          messageId?: string | number;
          role: "USER" | "AI";
          message: string;
          translation?: string;
          audioUrl?: string;
        }[];
      }) => {
        devLog("[SOCKET] History loaded:", data);
        if (data.messages && data.messages.length > 0) {
          const historyMessages: Message[] = data.messages.map(
            (msg, index) => ({
              id:
                msg.messageId !== undefined && msg.messageId !== null
                  ? String(msg.messageId)
                  : `${msg.role}-${Date.now()}-${index}-${Math.random()}`,
              role: msg.role === "USER" ? "user" : "ai",
              text: msg.message,
              translation: msg.translation,
              audioUrl: msg.audioUrl,
              messageId: msg.messageId,
            })
          );
          setMessages(historyMessages);
          devLog(
            `[SOCKET] Loaded ${historyMessages.length} messages from history`
          );
        }
      }
    );

    // Listen for room-updated event (refresh room list when conversation is updated)
    socket.on(
      "room-updated",
      (
        data:
          | RoomUpdatePayload
          | {
              conversationId?: string;
              room?: RoomUpdatePayload;
            }
      ) => {
        devLog("[SOCKET] Room updated:", data);
        const normalized: RoomUpdatePayload | undefined = (() => {
          if (!data) return undefined;
          if ("room" in data && data.room) {
            return {
              ...data.room,
              conversationId:
                data.room.conversationId ?? data.conversationId ?? "",
            };
          }
          return {
            ...(data as RoomUpdatePayload),
            conversationId:
              (data as RoomUpdatePayload).conversationId ??
              (data as { conversationId?: string }).conversationId ??
              "",
          };
        })();
        if (normalized?.conversationId) {
          updateRoomCache(normalized);
        }
      }
    );

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
          ? t("home.ai.conversation.processing_speech_to_text")
          : data.status === "gemini-processing"
            ? t("home.ai.conversation.processing_ai")
            : data.status === "text-to-speech"
              ? t("home.ai.conversation.processing_tts")
              : data.message || t("home.ai.conversation.processing_default");
      setProcessingStatus(statusText);
    });

    // Listen for transcription (user's speech to text)
    socket.on(
      "transcription",
      (data: {
        text?: string;
        messageId?: string | number;
        audioUrl?: string;
      }) => {
        devLog("[SOCKET] Transcription:", data);
        if (data.text) {
          appendMessage({
            id: `user-${Date.now()}`,
            role: "user",
            text: data.text,
            messageId: data.messageId,
            // If audioUrl is already available in transcription event, use it
            audioUrl: data.audioUrl,
          });
          devLog(
            "[SOCKET] User message created with messageId:",
            data.messageId,
            "audioUrl:",
            data.audioUrl
          );
        }
        setProcessingStatus(undefined);
      }
    );

    // Listen for AI text response
    socket.on(
      "text-response",
      (data: {
        text?: string;
        translation?: string;
        messageId?: string | number;
      }) => {
        devLog("[SOCKET] AI Response:", data.text);
        if (data.text || data.translation) {
          const messageId = `ai-${Date.now()}`;
          appendMessage({
            id: messageId,
            role: "ai",
            // Start empty to animate typing
            text: "",
            // Translation will be delayed if typing is ongoing
            translation: undefined,
            messageId: data.messageId,
          });
          devLog("[SOCKET] AI message created with messageId:", data.messageId);
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

    // Listen for message-audio-updated event (update audio URL for existing message)
    socket.on(
      "message-audio-updated",
      (data: {
        messageId?: string | number;
        role?: "USER" | "AI";
        audioUrl?: string;
      }) => {
        devLog("[SOCKET] Message audio updated:", data);
        if (!data.audioUrl) {
          devLog("[SOCKET] No audioUrl in message-audio-updated event");
          return;
        }

        if (!data.role) {
          devLog("[SOCKET] No role in message-audio-updated event");
          return;
        }

        const role = data.role === "USER" ? "user" : "ai";
        devLog(
          `[SOCKET] Updating audio for ${role} message (role: ${data.role}), messageId:`,
          data.messageId
        );

        // Helper function to compare messageIds (handle both string and number)
        const compareMessageId = (
          msgId1: string | number | undefined,
          msgId2: string | number | undefined
        ): boolean => {
          if (msgId1 === undefined || msgId2 === undefined) return false;
          // Convert both to string for comparison
          return String(msgId1) === String(msgId2);
        };

        // Try to update by messageId if provided
        if (data.messageId !== undefined && data.messageId !== null) {
          setMessages((prev) => {
            // First, try to find by messageId
            const index = prev.findIndex((msg) =>
              compareMessageId(msg.messageId, data.messageId)
            );
            if (index !== -1) {
              // Verify role matches
              if (prev[index].role === role) {
                const next = [...prev];
                next[index] = { ...next[index], audioUrl: data.audioUrl };
                devLog(
                  `[SOCKET] ✅ Successfully updated ${role} message by messageId: ${data.messageId} at index ${index}`
                );
                return next;
              } else {
                devLog(
                  `[SOCKET] ⚠️ Message found by messageId but role mismatch. Expected: ${role}, Found: ${prev[index].role}`
                );
              }
            }

            // Not found by messageId or role mismatch, use fallback
            devLog(
              `[SOCKET] Message not found by messageId or role mismatch, using fallback for ${role}`
            );
            for (let i = prev.length - 1; i >= 0; i--) {
              if (prev[i].role === role && !prev[i].audioUrl) {
                const next = [...prev];
                next[i] = { ...next[i], audioUrl: data.audioUrl };
                devLog(
                  `[SOCKET] ✅ Updated ${role} message at index ${i} with fallback (messageId: ${prev[i].messageId})`
                );
                return next;
              }
            }
            devLog(
              `[SOCKET] ❌ No ${role} message found to update (searched ${prev.length} messages)`
            );
            return prev;
          });
        } else {
          // No messageId provided, use fallback: update last message of matching role
          devLog(
            `[SOCKET] No messageId provided, using fallback for ${role} message`
          );
          setMessages((prev) => {
            for (let i = prev.length - 1; i >= 0; i--) {
              if (prev[i].role === role && !prev[i].audioUrl) {
                const next = [...prev];
                next[i] = { ...next[i], audioUrl: data.audioUrl };
                devLog(
                  `[SOCKET] ✅ Updated last ${role} message at index ${i} without audioUrl (messageId: ${prev[i].messageId})`
                );
                return next;
              }
            }
            devLog(
              `[SOCKET] ❌ No ${role} message found to update (searched ${prev.length} messages)`
            );
            return prev;
          });
        }
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
      socket.off("history");
      socket.off("room-updated");
      socket.off("processing");
      socket.off("transcription");
      socket.off("text-response");
      socket.off("text-response-update");
      socket.off("audio-response");
      socket.off("message-audio-updated");
      socket.off("error");
      disconnectSocket();
      clearTranslationTimer();
      clearTypingInterval();
    };
  }, [
    accessToken,
    topicId,
    initialConversationId,
    hasAIKaiwa,
    appendMessage,
    updateLastAiMessage,
    updateMessageById,
    scheduleApplyPendingTranslation,
    startTypingAnimation,
    t,
    queryClient,
    updateRoomCache,
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

  const handleRecordingComplete = useCallback(
    async (uri: string, durationSec: number) => {
      // Don't allow recording if user doesn't have subscription
      if (!hasAIKaiwa) {
        return;
      }

      try {
        const info = await FileSystem.getInfoAsync(uri);
        const isLikelySilent =
          !info.exists || (info.size ?? 0) < 2000 || (durationSec ?? 0) < 0.5;

        if (isLikelySilent) {
          setProcessingStatus(t("home.ai.conversation.no_audio_detected"));
          return;
        }

        // Check if we have a conversation, if not create one
        if (
          !conversationId &&
          socketRef.current &&
          socketRef.current.connected
        ) {
          pendingNewRoomRef.current = true;
          socketRef.current.emit("join-kaiwa-room", {});
          // Wait a bit for the join to complete
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        setIsSubmitting(true);
        setProcessingStatus(t("home.ai.conversation.sending_audio"));

        // Use WebSocket if connected, otherwise fallback to old method
        if (socketRef.current && socketRef.current.connected) {
          await sendAudioToServer(uri);
          // Events will be received: processing -> transcription -> text-response -> audio-response
        } else {
          console.warn("[SOCKET] Not connected, cannot send audio");
          setIsSubmitting(false);
          setProcessingStatus(
            t("home.ai.conversation.server_connection_error")
          );
        }
      } catch (error) {
        console.error("[RECORDING] Error:", error);
        setIsSubmitting(false);
        setProcessingStatus(t("home.ai.conversation.audio_send_error"));
      }
    },
    [hasAIKaiwa, conversationId, t]
  );

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
        <ThemedText style={{ fontSize: 18, fontWeight: "700", marginLeft: 4, flex: 1 }}>
          {t("home.ai.conversation.title")}
        </ThemedText>
        {hasAIKaiwa && (
          <TouchableOpacity
            onPress={() => setIsListSheetOpen(true)}
            style={{ padding: 8 }}
          >
            <Menu size={20} color="#1f2937" />
          </TouchableOpacity>
        )}
      </View>

      {!hasAIKaiwa ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            paddingTop: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#7c3aed", "#4c1d95"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 28,
              padding: 24,
              marginBottom: 20,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 999,
                paddingVertical: 6,
                paddingHorizontal: 12,
                marginBottom: 16,
              }}
            >
              <Sparkles size={14} color="#fef9c3" style={{ marginRight: 6 }} />
              <ThemedText
                style={{ color: "#fffbea", fontSize: 13, fontWeight: "600" }}
              >
                {heroContent.badge}
              </ThemedText>
            </View>

            <ThemedText
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: "#ffffff",
                lineHeight: 32,
                marginBottom: 12,
              }}
            >
              {heroContent.title}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.85)",
                lineHeight: 22,
                marginBottom: 18,
              }}
            >
              {heroContent.subtitle}
            </ThemedText>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {featureHighlights.map((feature, index) => (
                <View
                  key={`${feature}-${index}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.12)",
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 999,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Sparkles size={14} color="#fef3c7" style={{ marginRight: 6 }} />
                  <ThemedText
                    style={{
                      fontSize: 13,
                      color: "#ffffff",
                      fontWeight: "600",
                    }}
                  >
                    {feature}
                  </ThemedText>
                </View>
              ))}
            </View>

            <Image
              source={require("@assets/images/unnamed.jpg")}
              style={{
                width: 110,
                height: 110,
                position: "absolute",
                right: -10,
                bottom: -10,
                opacity: 0.25,
              }}
              resizeMode="contain"
            />
          </LinearGradient>

          <View
            style={{
              backgroundColor: "#f5f3ff",
              borderRadius: 20,
              paddingVertical: 18,
              paddingHorizontal: 22,
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            {heroStats.map((stat, index) => (
              <View
                key={`${stat.label}-${index}`}
                style={{
                  flex: 1,
                  alignItems: index === 1 ? "center" : index === 2 ? "flex-end" : "flex-start",
                }}
              >
                <ThemedText
                  style={{ fontSize: 20, fontWeight: "800", color: "#5b21b6" }}
                >
                  {stat.value}
                </ThemedText>
                <ThemedText
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: "#5b21b6",
                    opacity: 0.8,
                  }}
                >
                  {stat.label}
                </ThemedText>
              </View>
            ))}
          </View>

          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.05)",
              marginBottom: 20,
            }}
          >
            <ThemedText
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#1f2937",
                marginBottom: 6,
              }}
            >
              {ultraPackage?.nameTranslation ||
                t("home.ai.conversation.locked_title")}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 16,
                color: "#4b5563",
                marginBottom: 18,
                lineHeight: 22,
              }}
            >
              {ultraPackage?.descriptionTranslation ||
                t("home.ai.conversation.locked_description")}
            </ThemedText>

            {formattedUltraPrice ? (
              <View
                style={{
                  borderRadius: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 18,
                  marginBottom: 16,
                  backgroundColor: "#f5f3ff",
                  borderWidth: 1,
                  borderColor: "rgba(139,92,246,0.3)",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <ThemedText
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#6d28d9",
                    }}
                  >
                    {priceHighlightText || formattedUltraPrice}
                  </ThemedText>
                  {priceSubHighlight ? (
                    <ThemedText
                      style={{
                        marginTop: 4,
                        fontSize: 14,
                        color: "#4c1d95",
                        opacity: 0.85,
                      }}
                    >
                      {priceSubHighlight}
                    </ThemedText>
                  ) : null}
                </View>
                <View
                  style={{
                    backgroundColor: "#ede9fe",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                  }}
                >
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color: "#6d28d9",
                      fontWeight: "700",
                    }}
                  >
                    Premium
                  </ThemedText>
                </View>
              </View>
            ) : null}

            {isMarketplaceLoading ? (
              <ActivityIndicator style={{ marginBottom: 16 }} color="#6d28d9" />
            ) : ultraFeatures.length > 0 ? (
              <View style={{ marginBottom: 10 }}>
                {ultraFeatures.map((feature, index) => (
                  <View
                    key={`${feature}-${index}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: index === ultraFeatures.length - 1 ? 0 : 10,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#8b5cf6",
                        marginTop: 7,
                        marginRight: 10,
                      }}
                    />
                    <ThemedText
                      style={{
                        flex: 1,
                        fontSize: 15,
                        color: "#1f2937",
                      }}
                    >
                      {feature}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={() => {
              if (ultraPackage?.id) {
                router.push({
                  pathname: ROUTES.APP.SUBSCRIPTION as any,
                  params: { packageId: String(ultraPackage.id) },
                });
              } else {
                router.push(ROUTES.APP.SUBSCRIPTION as any);
              }
            }}
            style={{
              backgroundColor: "#111827",
              paddingVertical: 16,
              borderRadius: 16,
              marginBottom: 14,
              alignItems: "center",
              shadowColor: "#111827",
              shadowOpacity: 0.2,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
            }}
          >
            <ThemedText
              style={{
                color: "#ffffff",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {t("home.ai.conversation.subscribe_button")}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (ultraPackage?.id) {
                router.push({
                  pathname: ROUTES.APP.SUBSCRIPTION as any,
                  params: { packageId: String(ultraPackage.id) },
                });
              } else {
                router.push(ROUTES.APP.SUBSCRIPTION as any);
              }
            }}
            style={{
              borderWidth: 1,
              borderColor: "rgba(17,24,39,0.15)",
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <ThemedText
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              {t("home.ai.conversation.cta_secondary")}
            </ThemedText>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f9fafb",
              borderRadius: 18,
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.05)",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#dbeafe",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <ShieldCheck color="#1d4ed8" size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText
                style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}
              >
                {guaranteeCopy.title}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 14,
                  color: "#4b5563",
                  marginTop: 4,
                  lineHeight: 20,
                }}
              >
                {guaranteeCopy.subtitle}
              </ThemedText>
            </View>
          </View>

          <ThemedText
            style={{
              textAlign: "center",
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            {socialProofText}
          </ThemedText>
        </ScrollView>
      ) : isLoading || isConnecting ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
          <ThemedText style={{ marginTop: 12, opacity: 0.7 }}>
            {isConnecting
              ? t("home.ai.conversation.connecting")
              : t("home.ai.conversation.loading")}
          </ThemedText>
        </View>
      ) : !isSocketConnected && !topicId ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ThemedText style={{ opacity: 0.7 }}>
            {t("home.ai.conversation.connection_error")}
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
              disabled={isSubmitting || !isSocketConnected || !hasAIKaiwa}
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
                  {t("home.ai.conversation.connecting_to_ai")}
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

      {/* Conversation List Bottom Sheet */}
      {hasAIKaiwa && (
        <ConversationListSheet
          isOpen={isListSheetOpen}
          onClose={() => setIsListSheetOpen(false)}
          currentConversationId={conversationId}
          onSelectConversation={(convId) => {
            setIsListSheetOpen(false);
            
            // Clear current messages before switching
            setMessages([]);
            pendingNewRoomRef.current = false;
            
            if (convId) {
              // Switch to existing conversation
              setIsLoading(true);
              setConversationId(convId);
              if (socketRef.current?.connected) {
                socketRef.current.emit("join-kaiwa-room", {
                  conversationId: convId,
                });
              }
            } else {
              // New conversation: wait until the first recording before creating the room
              setConversationId(null);
              setIsLoading(false);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}
