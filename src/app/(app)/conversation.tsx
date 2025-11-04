import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@components/ThemedText";
import AudioPlayer from "@components/ui/AudioPlayer";
import VoiceRecorder from "@components/ui/EnhancedAudioRecorder";
import {
  ConversationStartResponse,
  startConversation,
  SubmitSpeechResponse,
  submitUserSpeech,
} from "@services/conversation";
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
  const conversationRef = useRef<{
    conversationId: string;
    turnId: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const start: ConversationStartResponse = await startConversation(
          String(topicId ?? "default")
        );
        if (!mounted) return;
        conversationRef.current = {
          conversationId: start.conversationId,
          turnId: start.turnId,
        };
        setMessages([
          {
            id: `ai-${Date.now()}`,
            role: "ai",
            text: start.aiMessage.text,
            audioUrl: start.aiMessage.audioUrl,
          },
        ]);
        setNextUserPrompt(start.nextUserPrompt);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [topicId]);

  const handleRecordingComplete = async (uri: string) => {
    if (!conversationRef.current) return;
    setIsSubmitting(true);
    try {
      const submit: SubmitSpeechResponse = await submitUserSpeech({
        conversationId: conversationRef.current.conversationId,
        turnId: conversationRef.current.turnId,
        topicId: topicId ? String(topicId) : undefined,
        fileUri: uri,
      });

      // Append user's result as a message with feedback coloring
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          text: submit.recognizedText,
          feedback: submit.words ? { words: submit.words } : undefined,
        },
      ]);

      // Append AI response if any
      if (submit.aiMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: "ai",
            text: submit.aiMessage?.text ?? "",
            audioUrl: submit.aiMessage?.audioUrl,
          },
        ]);
      }

      conversationRef.current = {
        conversationId: submit.conversationId,
        turnId: submit.turnId,
      };
      setNextUserPrompt(submit.nextUserPrompt);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFeedbackText = (msg: Message) => {
    if (!msg.feedback?.words?.length) {
      return <ThemedText style={{ fontSize: 16 }}>{msg.text}</ThemedText>;
    }
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {msg.feedback.words.map((w, idx) => (
          <ThemedText
            key={`${w.word}-${idx}`}
            style={{
              fontSize: 16,
              color: w.correct ? "#065f46" : "#991b1b",
              backgroundColor: w.correct
                ? "rgba(16,185,129,0.12)"
                : "rgba(239,68,68,0.12)",
              paddingHorizontal: 4,
              borderRadius: 4,
              marginRight: 4,
              marginBottom: 4,
            }}
          >
            {w.word}
          </ThemedText>
        ))}
      </View>
    );
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
            {/* Conversation bubbles */}
            {messages.map((m) => (
              <View
                key={m.id}
                style={{
                  marginTop: 12,
                  alignItems: m.role === "ai" ? "flex-start" : "flex-end",
                }}
              >
                <View
                  style={{
                    backgroundColor: m.role === "ai" ? "#ffffff" : "#2563eb",
                    borderRadius: 14,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    maxWidth: "85%",
                    borderWidth: m.role === "ai" ? 1 : 0,
                    borderColor: "rgba(0,0,0,0.06)",
                  }}
                >
                  {m.role === "ai" ? (
                    <ThemedText style={{ fontSize: 16 }}>{m.text}</ThemedText>
                  ) : (
                    renderFeedbackText(m)
                  )}
                  {m.audioUrl ? (
                    <View style={{ marginTop: 8 }}>
                      <AudioPlayer audioUrl={m.audioUrl} />
                    </View>
                  ) : null}
                </View>
              </View>
            ))}

            {/* Next prompt card and mic guidance */}
            {!!nextUserPrompt && (
              <View style={{ marginTop: 20, alignItems: "flex-end" }}>
                <View
                  style={{
                    backgroundColor: "#1d4ed8",
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    maxWidth: "92%",
                  }}
                >
                  <ThemedText
                    style={{ color: "white", fontSize: 16, fontWeight: "600" }}
                  >
                    {nextUserPrompt}
                  </ThemedText>
                  <ThemedText
                    style={{ color: "rgba(255,255,255,0.85)", marginTop: 6 }}
                  >
                    Nhấn để nói ở bên dưới
                  </ThemedText>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Recorder fixed at bottom */}
          <View>
            <VoiceRecorder
              onRecordingComplete={(uri: string, _duration: number) =>
                handleRecordingComplete(uri)
              }
              exerciseTitle={
                isSubmitting ? "Đang gửi và chấm phát âm…" : "Nhấn để nói"
              }
              showPlayback={true}
              disabled={isSubmitting}
              maxDuration={10}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
