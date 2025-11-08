import { Audio } from "expo-av";
import { BlurView } from "expo-blur";
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@components/ThemedText";
import AudioPlayer from "@components/ui/AudioPlayer";
import VoiceRecorder from "@components/ui/EnhancedAudioRecorder";
import { useAuth } from "@hooks/useAuth";
import userTestService from "@services/user-test";

type Message = {
  id: string;
  role: "ai" | "user";
  text: string;
  question?: string;
  pronunciation?: string;
  audioUrl?: string;
  feedback?: { words: { word: string; correct: boolean; score?: number }[] };
};

type FeedbackWord = { word: string; correct: boolean; score?: number };

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

export default function ConversationScreen() {
  const { topicId } = useLocalSearchParams<{ topicId?: string }>();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextUserPrompt, setNextUserPrompt] = useState<string | undefined>();
  const [countdown, setCountdown] = useState<number>(0);
  const [queuedQuestions, setQueuedQuestions] = useState<any[]>([]);
  const [isSequencing, setIsSequencing] = useState(false);
  const [awaitingUser, setAwaitingUser] = useState(false);
  const [feedbackText, setFeedbackText] = useState<string | undefined>();
  const [feedbackWords, setFeedbackWords] = useState<FeedbackWord[]>([]);

  const advanceWaitRef = useRef<(() => void) | null>(null);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const opacityAnim = useState(new Animated.Value(1))[0];

  const DELAY_BETWEEN_MESSAGES_MS = 4000;

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

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setIsLoading(true);
        if (!mounted) return;

        if (topicId) {
          try {
            const test = await userTestService.getTestFullUser(String(topicId));
            if (!mounted) return;

            const questions =
              test?.testSets?.[0]?.questions
                ?.slice()
                ?.sort(
                  (a: any, b: any) =>
                    (a?.questionOrder ?? 0) - (b?.questionOrder ?? 0)
                ) ?? [];
            setQueuedQuestions(questions);
            setCountdown(3);
          } catch {}
        } else {
          setMessages([
            {
              id: `ai-${Date.now()}`,
              role: "ai",
              text: "Hãy nói 'こんにちは'.",
              question: "Hãy nói",
              pronunciation: "こんにちは",
            },
          ]);
          setNextUserPrompt("「こんにちは」。");
        }
      } catch {
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [topicId]);

  const startSequence = useCallback(async () => {
    if (!queuedQuestions?.length) return;
    setIsSequencing(true);
    setMessages([]);
    for (const q of queuedQuestions) {
      const qb = q?.questionBank ?? {};
      const isSystem = String(qb?.role || "B").toUpperCase() === "B";
      const role: "ai" | "user" = isSystem ? "ai" : "user";
      const text = qb?.pronunciation || qb?.question || "";
      const audioUrl: string | undefined = qb?.audioUrl || undefined;
      if (!text && !audioUrl) continue;

      const msg: Message = {
        id: String(q?.id ?? `${role}-${Date.now()}`),
        role,
        text,
        question: qb?.question || undefined,
        pronunciation: qb?.pronunciation || undefined,
        audioUrl,
      };
      setMessages((prev) => [...prev, msg]);

      if (isSystem) {
        if (audioUrl) {
          await playAudio(audioUrl);
        }
        await new Promise((res) => setTimeout(res, DELAY_BETWEEN_MESSAGES_MS));
      } else {
        setNextUserPrompt(text);
        setFeedbackText(text);
        setFeedbackWords([]);
        if (audioUrl) {
          await playAudio(audioUrl);
        }
        setAwaitingUser(true);
        await new Promise<void>((resolve) => {
          advanceWaitRef.current = () => {
            resolve();
            advanceWaitRef.current = null;
          };
        });
        setAwaitingUser(false);
        await new Promise((res) => setTimeout(res, 500));
      }
    }
    setIsSequencing(false);
  }, [queuedQuestions, DELAY_BETWEEN_MESSAGES_MS]);

  useEffect(() => {
    if (countdown <= 0 || isSequencing) return;
    scaleAnim.setValue(1.2);
    opacityAnim.setValue(1);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    if (countdown === 1) {
      setTimeout(() => {
        startSequence();
      }, 1000);
    }
    return () => clearTimeout(t);
  }, [countdown, isSequencing, startSequence, scaleAnim, opacityAnim]);

  const sendToGemini = async (
    uri: string,
    referenceText?: string
  ): Promise<{
    feedbackText?: string;
    words?: FeedbackWord[];
    recognizedText?: string;
    aiMessageText?: string;
    aiAudioBase64?: string;
    aiAudioMimeType?: string;
  }> => {
    const apiKey =
      process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Missing Gemini API key (EXPO_PUBLIC_GEMINI_API_KEY/GOOGLE_API_KEY)"
      );
    }

    const audioBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const getMimeFromUri = (u: string) => {
      const lower = u.toLowerCase();
      if (lower.endsWith(".wav")) return "audio/wav";
      if (lower.endsWith(".mp3")) return "audio/mpeg";
      if (lower.endsWith(".m4a")) return "audio/mp4";
      if (lower.endsWith(".aac")) return "audio/aac";
      if (lower.endsWith(".3gp") || lower.endsWith(".3gpp"))
        return "audio/3gpp";
      if (lower.endsWith(".webm")) return "audio/webm";
      return Platform.OS === "ios" ? "audio/mp4" : "audio/3gpp";
    };

    const mimeType = getMimeFromUri(uri);

    const candidateModels = [
      "gemini-2.5-flash-native-audio-dialog",
      "gemini-2.0-flash-exp",
      "gemini-2.0-flash",
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro",
    ];

    const systemInstruction =
      'Role: You are a STRICT Japanese Pronunciation Assessment AI. Compare the user\'s spoken audio against the provided reference text. If the spoken audio deviates or confidence is low, LOWER SCORES aggressively. Do NOT hallucinate.\n\nSteps:\n1) Transcribe the spoken audio to kana/romaji-like text: TranscribedText.\n2) Compute MatchScore in [0,1] between TranscribedText and ReferenceText.\n3) Score: Perfect match 90-100, minor deviations 60-80, clear mismatch/unintelligible 0-40. If MatchScore < 0.6 treat as mismatch and penalize.\n\nOutput (JSON only):\n{\n  "Overall": { "AccuracyScore": number, "FluencyScore": number, "PronScore": number },\n  "TranscribedText": string,\n  "MatchScore": number,\n  "Syllables": [ { "Syllable": string, "Romaji": string, "AccuracyScore": number, "ErrorType": "Substitution"|"Omission"|"Insertion"|"PitchAccentError"|"None", "ErrorDetail": string } ]\n}\n\nBe conservative: if confidence is low or speech differs, keep scores low and mark errors.';

    const userPrompt = `Reference Text (Japanese): ${referenceText ?? ""}`;

    const baseBody = {
      system_instruction: {
        parts: [
          {
            text: systemInstruction,
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: userPrompt,
            },
            {
              inline_data: { mime_type: mimeType, data: audioBase64 },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.3,
      },
    } as const;

    let lastError: Error | undefined;
    for (const model of candidateModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(baseBody),
          }
        );

        if (!res.ok) {
          const errText = await res.text();
          if (
            res.status === 404 ||
            /NOT_FOUND|is not found|unsupported/i.test(errText)
          ) {
            continue;
          }
          throw new Error(`Gemini error: ${res.status} ${errText}`);
        }

        const json: any = await res.json();
        const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        let parsed: any = {};
        try {
          parsed = raw ? JSON.parse(raw) : {};
        } catch {
          parsed = {};
        }

        let wordsOut: FeedbackWord[] | undefined;
        if (Array.isArray(parsed)) {
          wordsOut = parsed
            .map((it: any) => {
              const ch =
                typeof it?.character === "string"
                  ? it.character
                  : String(it?.character ?? "");
              const acc = String(it?.accuracy ?? "").toLowerCase();
              const score =
                acc === "good"
                  ? 100
                  : acc === "ok" || acc === "medium"
                    ? 60
                    : acc
                      ? 0
                      : undefined;
              const correct =
                score !== undefined ? score >= 85 : acc === "good";
              return ch ? { word: ch, correct, score } : undefined;
            })
            .filter(Boolean) as FeedbackWord[];
        } else if (parsed?.words && Array.isArray(parsed.words)) {
          wordsOut = parsed.words as FeedbackWord[];
        } else if (parsed?.Syllables && Array.isArray(parsed.Syllables)) {
          wordsOut = (parsed.Syllables as any[])
            .map((syl: any) => {
              const word = String(syl?.Syllable ?? "");
              const scoreNum =
                typeof syl?.AccuracyScore === "number"
                  ? syl.AccuracyScore
                  : parseFloat(String(syl?.AccuracyScore ?? ""));
              const score = isFinite(scoreNum)
                ? Math.max(0, Math.min(100, Math.round(scoreNum)))
                : undefined;
              const correct = score !== undefined ? score >= 85 : false;
              return word ? { word, correct, score } : undefined;
            })
            .filter(Boolean) as FeedbackWord[];
        }

        return {
          feedbackText: parsed.ReferenceText || parsed.feedbackText,
          words: wordsOut,
          recognizedText:
            parsed.TranscribedText ||
            parsed.transcribedText ||
            parsed.recognizedText,
          aiMessageText: parsed.aiMessageText,
          aiAudioBase64: parsed.aiAudioBase64,
          aiAudioMimeType: parsed.aiAudioMimeType,
        };
      } catch (e: any) {
        lastError = e instanceof Error ? e : new Error(String(e));
      }
    }

    if (lastError) throw lastError;
    throw new Error(
      "Gemini models unavailable or unsupported for this endpoint."
    );
  };

  const normalizeJa = (s: string) =>
    (s || "")
      .replace(/[\s\u3000]/g, "")
      .replace(/[「」『』（）()、。．・…~〜!！?？:：;；，,\.\-—]/g, "");

  const buildFeedbackFromDiff = (
    targetRaw: string,
    spokenRaw: string
  ): FeedbackWord[] => {
    const target = normalizeJa(targetRaw).split("");
    const spoken = normalizeJa(spokenRaw).split("");
    const m = target.length;
    const n = spoken.length;

    const dp: number[][] = Array.from({ length: m + 1 }, () =>
      new Array(n + 1).fill(0)
    );

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = target[i - 1] === spoken[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }

    let i = m,
      j = n;
    const aligned: { t?: string; s?: string }[] = [];

    while (i > 0 || j > 0) {
      if (
        i > 0 &&
        j > 0 &&
        dp[i][j] ===
          dp[i - 1][j - 1] + (target[i - 1] === spoken[j - 1] ? 0 : 1)
      ) {
        aligned.push({ t: target[i - 1], s: spoken[j - 1] });
        i--;
        j--;
      } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        aligned.push({ t: target[i - 1], s: undefined });
        i--;
      } else {
        aligned.push({ t: undefined, s: spoken[j - 1] });
        j--;
      }
    }

    aligned.reverse();

    const tokens: FeedbackWord[] = [];
    for (const a of aligned) {
      if (a.t !== undefined) {
        const correct = a.s !== undefined && a.t === a.s;
        tokens.push({ word: a.t, correct, score: correct ? 100 : 0 });
      }
    }

    if (!tokens.length && targetRaw) {
      return targetRaw
        .split("")
        .map((ch) => ({ word: ch, correct: false, score: 0 }));
    }

    return tokens;
  };

  const isPredominantlyJapanese = (s: string, threshold = 0.6): boolean => {
    if (!s) return false;
    const jpRegex =
      /[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF\u4E00-\u9FFF\u3400-\u4DBF\u3005\u3007\u30FC]/g;
    const allowedPunct =
      /[\u3001\u3002\uFF0C\uFF0E\uFF1F\uFF01\u30FB\u300C\u300D\u300E\u300F\u301C\uFF5E\s]/g;
    const total = s.replace(allowedPunct, "").length;
    if (total === 0) return false;
    const matches = s.match(jpRegex);
    const count = matches ? matches.length : 0;
    return count / total >= threshold;
  };

  const projectModelScoresToReference = (
    referenceText: string,
    recognizedText: string,
    modelWords?: FeedbackWord[]
  ): FeedbackWord[] => {
    const alignedTokens = buildFeedbackFromDiff(referenceText, recognizedText);
    if (!modelWords || !modelWords.length) {
      return alignedTokens.map((t) => ({
        word: t.word,
        correct: t.correct,
        score: t.correct ? 100 : 0,
      }));
    }

    const queues = new Map<string, number[]>();
    for (const w of modelWords) {
      const ch = String(w.word ?? "");
      const score = typeof w.score === "number" ? w.score : undefined;
      if (!queues.has(ch)) queues.set(ch, []);
      if (score !== undefined) queues.get(ch)!.push(score);
    }

    const projected: FeedbackWord[] = alignedTokens.map((t) => {
      if (!t.correct) {
        return { word: t.word, correct: false, score: 0 };
      }
      const list = queues.get(t.word);
      const score = list && list.length ? list.shift() : 100;
      const normalized =
        score !== undefined
          ? Math.max(0, Math.min(100, Math.round(score)))
          : 100;
      const isCorrect = normalized >= 85;
      return { word: t.word, correct: isCorrect, score: normalized };
    });

    return projected;
  };

  const handleRecordingComplete = async (uri: string, durationSec: number) => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      const isLikelySilent =
        !info.exists || (info.size ?? 0) < 2000 || (durationSec ?? 0) < 0.5;

      if (isLikelySilent) {
        const displayText = nextUserPrompt || "";
        const words = buildFeedbackFromDiff(displayText, "");
        setFeedbackText(displayText);
        setFeedbackWords(words);
        return;
      }

      setIsSubmitting(true);

      const result = await sendToGemini(uri, nextUserPrompt);
      const displayText = result.feedbackText || nextUserPrompt || "";
      const recognized = String((result as any).recognizedText || "");

      if (recognized && !isPredominantlyJapanese(recognized)) {
        setFeedbackText("Vui lòng nói tiếng Nhật");
        setFeedbackWords(buildFeedbackFromDiff(displayText, ""));
        return;
      }

      let words: FeedbackWord[];
      if (result.words && Array.isArray(result.words) && result.words.length) {
        words = projectModelScoresToReference(
          displayText,
          recognized,
          result.words as any
        );
      } else if (recognized) {
        words = buildFeedbackFromDiff(displayText, recognized);
      } else {
        words = buildFeedbackFromDiff(displayText, "");
      }

      setFeedbackText(displayText);
      setFeedbackWords(words);
    } catch {
    } finally {
      setIsSubmitting(false);
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

      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <>
          {countdown > 0 ? (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10,
              }}
            >
              <BlurView
                tint="systemChromeMaterial"
                intensity={50}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 160,
                    height: 160,
                    borderRadius: 80,
                    backgroundColor: "rgba(0,0,0,0.35)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Animated.Text
                    style={{
                      fontSize: 100,
                      fontWeight: "800",
                      color: "#ffffff",
                      textShadowColor: "rgba(0,0,0,0.6)",
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 8,
                      transform: [{ scale: scaleAnim }],
                      opacity: opacityAnim,
                    }}
                  >
                    {countdown}
                  </Animated.Text>
                </View>
              </View>
            </View>
          ) : null}
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          >
            {messages.map((m) => {
              const isUser = m.role === "user";
              const userAvatar = user?.avatar;
              const userName = user?.name || "User";
              
              return (
                <View
                  key={m.id}
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
                    {m.question || m.pronunciation ? (
                      <View>
                        {m.question ? (
                          <ThemedText
                            style={{
                              fontSize: 16,
                              color: isUser ? "#ffffff" : undefined,
                            }}
                          >
                            {m.question}
                          </ThemedText>
                        ) : null}
                        {m.pronunciation ? (
                          <ThemedText
                            style={{
                              fontSize: 16,
                              opacity: isUser ? 0.9 : 0.9,
                              marginTop: 6,
                              color: isUser ? "#ffffff" : undefined,
                            }}
                          >
                            {m.pronunciation}
                          </ThemedText>
                        ) : null}
                      </View>
                    ) : m.text ? (
                      <ThemedText
                        style={{
                          fontSize: 16,
                          color: isUser ? "#ffffff" : undefined,
                        }}
                      >
                        {m.text}
                      </ThemedText>
                    ) : null}

                    {m.audioUrl ? (
                      <View style={{ marginTop: 8 }}>
                        <AudioPlayer
                          audioUrl={m.audioUrl}
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
                    ) : null}
                  </View>
                  {isUser && (
                    <View style={{ marginLeft: 8 }}>
                      <UserAvatarWithFallback avatar={userAvatar} name={userName} />
                    </View>
                  )}
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
                setFeedbackText(undefined);
                setFeedbackWords([]);
              }}
              exerciseTitle={isSubmitting ? <AnimatedDots /> : "Nhấn để nói"}
              showPlayback={true}
              disabled={isSubmitting}
              maxDuration={10}
              showSaveButton={false}
              autoStopOnSilence={true}
              silenceDurationSeconds={2}
              silenceDbThreshold={-50}
              feedbackText={feedbackText || nextUserPrompt}
              feedbackWords={feedbackWords}
            />
            {awaitingUser ? (
              <View style={{ alignItems: "center", marginTop: 8 }}>
                <TouchableOpacity
                  onPress={() =>
                    advanceWaitRef.current && advanceWaitRef.current()
                  }
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    backgroundColor: "#3B82F6",
                    borderRadius: 10,
                  }}
                >
                  <ThemedText style={{ color: "#ffffff", fontWeight: "700" }}>
                    Tiếp tục
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
