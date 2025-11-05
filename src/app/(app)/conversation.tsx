import * as FileSystem from "expo-file-system";

import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@components/ThemedText";

import AudioPlayer from "@components/ui/AudioPlayer";

import VoiceRecorder from "@components/ui/EnhancedAudioRecorder";

import { router, useLocalSearchParams } from "expo-router";

import { ArrowLeftIcon } from "lucide-react-native";

type Message = {
  id: string;

  role: "ai" | "user";

  text: string;

  audioUrl?: string;

  feedback?: { words: { word: string; correct: boolean; score?: number }[] };
};

export default function ConversationScreen() {
  const { topicId } = useLocalSearchParams<{ topicId?: string }>();

  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);

  const [nextUserPrompt, setNextUserPrompt] = useState<string | undefined>();

  // Feedback state for display in recorder

  const [feedbackText, setFeedbackText] = useState<string | undefined>();

  const [feedbackWords, setFeedbackWords] = useState<
    { word: string; correct: boolean; score?: number }[]
  >([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setIsLoading(true);

        if (!mounted) return;

        // Local onboarding message since we are not using BE conversation flow

        setMessages([
          {
            id: `ai-${Date.now()}`,

            role: "ai",

            text: "Hãy nói 'こんにちは'.",
          },
        ]);

        setNextUserPrompt("「こんにちは」。");
      } catch {
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [topicId]);

  // Call Google Cloud Speech-to-Text directly from client

  const transcribeWithGoogle = async (
    uri: string
  ): Promise<{
    recognizedText: string;

    words?: { word: string; correct: boolean; score?: number }[];
  }> => {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_STT || process.env.GOOGLE_STT;

    if (!apiKey) {
      throw new Error(
        "Missing Google STT API key (EXPO_PUBLIC_GOOGLE_STT/GOOGLE_STT)"
      );
    }

    const fileBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Platform-specific encoding for Google STT

    let encoding: string | undefined;

    let sampleRateHertz: number | undefined;

    if (Platform.OS === "android") {
      encoding = "AMR_WB";

      sampleRateHertz = 16000;
    } else if (Platform.OS === "ios") {
      encoding = "LINEAR16";

      sampleRateHertz = 16000;
    } else {
      // Web uses WebM with Opus

      encoding = "WEBM_OPUS";
    }

    const body = {
      config: {
        languageCode: "ja-JP",

        enableWordConfidence: true,

        enableAutomaticPunctuation: true,

        model: "default",

        encoding,

        sampleRateHertz,
      },

      audio: {
        content: fileBase64,
      },
    };

    const res = await fetch(
      `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${apiKey}`,

      {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const text = await res.text();

      throw new Error(`Google STT error: ${res.status} ${text}`);
    }

    console.log(res);

    const json: any = await res.json();

    const alt = json?.results?.[0]?.alternatives?.[0];

    const transcript: string = alt?.transcript ?? "";

    console.log(json);

    console.log(transcript);

    console.log(alt);

    // Build feedback from word-level confidence when available

    let words: { word: string; correct: boolean; score?: number }[] | undefined;

    if (alt?.words?.length) {
      words = alt.words.map((w: any) => {
        const rawWord = (w.word ?? "").trim();

        const conf =
          typeof w.confidence === "number" ? w.confidence : undefined;

        const score = conf !== undefined ? Math.round(conf * 100) : undefined;

        const correct = conf !== undefined ? conf >= 0.85 : true;

        return { word: rawWord, correct, score };
      });
    }

    return { recognizedText: transcript, words };
  };

  // Normalize Japanese text: strip quotes/spaces/punctuation for alignment

  const normalizeJa = (s: string) => {
    return (s || "")

      .replace(/[\s\u3000]/g, "") // spaces incl. full-width

      .replace(/[「」『』（）()、。．・…~〜!！?？:：;；，,\.\-—]/g, "");
  };

  // Levenshtein alignment for per-character correctness

  // Returns feedback for TARGET sequence (the expected text) based on comparison with spoken text

  const buildFeedbackFromDiff = (
    targetRaw: string,

    spokenRaw: string
  ): { word: string; correct: boolean; score?: number }[] => {
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
          dp[i - 1][j] + 1, // deletion

          dp[i][j - 1] + 1, // insertion

          dp[i - 1][j - 1] + cost // substitution/match
        );
      }
    }

    // backtrace to align

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

    // Build tokens for the TARGET sequence (the expected text) with correctness based on spoken text

    const tokens: { word: string; correct: boolean; score?: number }[] = [];

    for (const a of aligned) {
      if (a.t !== undefined) {
        // For each character in target, check if it matches the corresponding spoken character

        const correct = a.s !== undefined && a.t === a.s;

        tokens.push({ word: a.t, correct, score: correct ? 100 : 0 });
      }
    }

    // Fallback: if no target after normalization, return original targetRaw as incorrect

    if (!tokens.length && targetRaw) {
      return targetRaw

        .split("")

        .map((ch) => ({ word: ch, correct: false, score: 0 }));
    }

    return tokens;
  };

  const handleRecordingComplete = async (uri: string) => {
    setIsSubmitting(true);

    try {
      const submit = await transcribeWithGoogle(uri);

      // Always use nextUserPrompt as the display text if available, otherwise use recognized text

      const displayText = nextUserPrompt || submit.recognizedText || "";

      const diffWords = buildFeedbackFromDiff(
        displayText,

        submit.recognizedText || ""
      );

      // Set feedback to display in recorder component

      setFeedbackText(displayText);

      setFeedbackWords(diffWords);

      // Don't add user message to messages list - only show AI messages

      // Keep the same nextUserPrompt (local) for now
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
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          >
            {/* Conversation bubbles - only show AI messages */}

            {messages

              .filter((m) => m.role === "ai")

              .map((m) => (
                <View
                  key={m.id}
                  style={{
                    marginTop: 12,

                    alignItems: "flex-start",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#ffffff",

                      borderRadius: 14,

                      paddingVertical: 10,

                      paddingHorizontal: 12,

                      maxWidth: "85%",

                      borderWidth: 1,

                      borderColor: "rgba(0,0,0,0.06)",
                    }}
                  >
                    <ThemedText style={{ fontSize: 16 }}>{m.text}</ThemedText>

                    {m.audioUrl ? (
                      <View style={{ marginTop: 8 }}>
                        <AudioPlayer audioUrl={m.audioUrl} />
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
          </ScrollView>

          {/* Recorder fixed at bottom */}

          <View>
            <VoiceRecorder
              onRecordingComplete={(uri: string, _duration: number) => {
                handleRecordingComplete(uri);
              }}
              onRecordingStart={() => {
                // Reset feedback when starting a new recording

                setFeedbackText(undefined);

                setFeedbackWords([]);
              }}
              exerciseTitle={
                isSubmitting ? "Đang gửi và chấm phát âm…" : "Nhấn để nói"
              }
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
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
