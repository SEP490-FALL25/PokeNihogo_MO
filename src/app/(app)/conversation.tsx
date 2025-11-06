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

import { startConversation } from "@services/conversation";
import { router, useLocalSearchParams } from "expo-router";

import { ArrowLeftIcon } from "lucide-react-native";

type Message = {
  id: string;

  role: "ai" | "user";

  text: string;

  audioUrl?: string;

  feedback?: { words: { word: string; correct: boolean; score?: number }[] };
};

type FeedbackWord = { word: string; correct: boolean; score?: number };

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

        // Call BE to start conversation using provided topicId
        if (topicId) {
          const data = await startConversation(String(topicId));
          if (!mounted) return;
          setMessages([
            {
              id: data.turnId || `ai-${Date.now()}`,
              role: "ai",
              text: data.aiMessage?.text || "",
              audioUrl: data.aiMessage?.audioUrl,
            },
          ]);
          setNextUserPrompt(data.nextUserPrompt);
        } else {
          // Fallback when no topicId is passed
          setMessages([
            {
              id: `ai-${Date.now()}`,
              role: "ai",
              text: "Hãy nói 'こんにちは'.",
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

  // Send audio + referenceText to Gemini (client-side REST)

  const sendToGemini = async (
    uri: string,
    referenceText?: string
  ): Promise<{
    feedbackText?: string;
    words?: FeedbackWord[];
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

    const baseBody = {
      system_instruction: {
        parts: [
          {
            text: "Role: You are a specialized Japanese Pronunciation Assessment AI. Your task is to analyze the user's spoken Japanese audio against a provided reference text and generate a detailed evaluation in JSON format.\n\nInput:\n1. Reference Text (Japanese): The exact Japanese text the user is attempting to pronounce.\n2. User Audio: The audio file containing the user's spoken attempt.\n\nOutput Requirement: Generate a single JSON object structured similarly to the detailed pronunciation assessment examples, containing both overall scores and syllable-level analysis.\n\nAssessment Criteria:\n1. Fundamental Sound Accuracy (Sei-on/Basic Phonemes):\n- Evaluate the correctness of the 5 basic vowels (a, i, u, e, o).\n- Check for accurate pronunciation of challenging consonants for Vietnamese speakers: 「し」(shi), 「ち」(chi), 「つ」(tsu).\n- Assess the Japanese 'r' sound (/r/, often trilled or flapped).\n\n2. Pitch Accent and Intonation:\n- Pitch Accent: Determine if the word-level pitch pattern (high-low sequence) matches Tokyo dialect.\n- Sentence Intonation: Assess if sentence-level intonation is natural (question vs. statement).\n\n3. Special Sound Accuracy:\n- Sokuon (促音/Small Tsu): Detect correct brief stop.\n- Chouon (長音/Long Vowels): Verify correct duration (2 mora).\n- Syllabic Nasal (ん/N): Realization as [-n]/[-m]/[-ng] contextually.\n\n4. Fluency and Intelligibility:\n- FluencyScore: speed, rhythm, pausing.\n- Intelligibility: how easily a native would understand.\n\nJSON Output Structure:\n- Overall Scores: include AccuracyScore, FluencyScore, PronScore (overall).\n- Syllables: array per kana/mora with fields: Syllable, Romaji, AccuracyScore (0-100), ErrorType (Substitution|Omission|Insertion|PitchAccentError|None), ErrorDetail, and optional Offset/Duration (simulated).\n\nFinal Action: Analyze the provided user audio against the provided Japanese reference text based on the above criteria, calculate the overall percentage, and output the result in the specified JSON format.",
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Reference Text (Japanese): ${referenceText ?? ""}`,
            },
            {
              inline_data: { mime_type: mimeType, data: audioBase64 },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.2,
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
            continue; // try next model
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

        // Normalize to our expected structure (supports multiple shapes)
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

  // Normalize Japanese text for diff

  const normalizeJa = (s: string) =>
    (s || "")
      .replace(/[\s\u3000]/g, "")
      .replace(/[「」『』（）()、。．・…~〜!！?？:：;；，,\.\-—]/g, "");

  // Levenshtein alignment for per-character correctness

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

    const tokens: FeedbackWord[] = [];

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
      const result = await sendToGemini(uri, nextUserPrompt);
      console.log("result", result);
      const displayText = result.feedbackText || nextUserPrompt || "";

      const words =
        result.words && Array.isArray(result.words) && result.words.length
          ? result.words
          : buildFeedbackFromDiff(displayText, "");

      setFeedbackText(displayText);
      setFeedbackWords(words);

      // Optionally append next AI message here
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
