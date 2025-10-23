import AudioRecorder from "@components/AudioRecorder";
import HomeLayout from "@components/layouts/HomeLayout";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { IconSymbol } from "@components/ui/IconSymbol";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const sampleSpeakingExercises = [
  {
    id: 1,
    title: "Basic Greetings",
    description: "Practice common Japanese greetings and responses",
    level: "Beginner",
    estimatedTime: "5 min",
    icon: "hand.wave.fill",
    color: "#10b981",
    progress: 100,
  },
  {
    id: 2,
    title: "Self Introduction",
    description: "Learn how to introduce yourself in Japanese",
    level: "Beginner",
    estimatedTime: "8 min",
    icon: "person.fill",
    color: "#f59e0b",
    progress: 75,
  },
  {
    id: 3,
    title: "Daily Conversations",
    description: "Practice everyday Japanese conversations",
    level: "Intermediate",
    estimatedTime: "12 min",
    icon: "bubble.left.and.bubble.right.fill",
    color: "#3b82f6",
    progress: 30,
  },
  {
    id: 4,
    title: "Shopping & Dining",
    description: "Speaking practice for shopping and restaurant situations",
    level: "Intermediate",
    estimatedTime: "15 min",
    icon: "cart.fill",
    color: "#8b5cf6",
    progress: 0,
  },
  {
    id: 5,
    title: "Business Japanese",
    description: "Formal business conversations and presentations",
    level: "Advanced",
    estimatedTime: "20 min",
    icon: "briefcase.fill",
    color: "#ef4444",
    progress: 0,
  },
  {
    id: 6,
    title: "Cultural Topics",
    description: "Discuss Japanese culture and traditions",
    level: "Advanced",
    estimatedTime: "25 min",
    icon: "globe",
    color: "#06b6d4",
    progress: 0,
  },
];

const SpeakingCard: React.FC<{
  exercise: (typeof sampleSpeakingExercises)[0];
  onPress: () => void;
}> = ({ exercise, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.speakingCard, { borderLeftColor: exercise.color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View
          style={[styles.iconContainer, { backgroundColor: exercise.color }]}
        >
          <IconSymbol name={exercise.icon as any} size={24} color="#ffffff" />
        </View>
        <View style={styles.exerciseInfo}>
          <ThemedText type="subtitle" style={styles.exerciseTitle}>
            {exercise.title}
          </ThemedText>
          <ThemedText style={styles.exerciseDescription}>
            {exercise.description}
          </ThemedText>
        </View>
        <View style={styles.micButton}>
          <IconSymbol
            name={"mic.fill" as any}
            size={32}
            color={exercise.color}
          />
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaInfo}>
          <View style={styles.levelBadge}>
            <ThemedText style={styles.levelText}>{exercise.level}</ThemedText>
          </View>
          <ThemedText style={styles.timeText}>
            ⏱️ {exercise.estimatedTime}
          </ThemedText>
        </View>

        {exercise.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${exercise.progress}%`,
                    backgroundColor: exercise.color,
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.progressText}>
              {exercise.progress}%
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function SpeakingScreen() {
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const handleSpeakingPress = (exerciseId: number) => {
    setSelectedExercise(exerciseId);
  };

  const handleRecordingComplete = (uri: string, duration: number) => {
    setRecordingUri(uri);
    setRecordingDuration(duration);
    console.log("Recording completed:", uri, "Duration:", duration);
  };

  const handleRecordingStart = () => {
    console.log("Recording started");
  };

  const handleRecordingStop = () => {
    console.log("Recording stopped");
  };

  const handlePlaybackStart = () => {
    console.log("Playback started");
  };

  const handlePlaybackStop = () => {
    console.log("Playback stopped");
  };

  const uploadRecording = async (uri: string) => {
    try {
      // Tạo FormData để upload file
      const formData = new FormData();
      formData.append("audio", {
        uri: uri,
        type: "audio/m4a",
        name: `speaking_exercise_${selectedExercise}_${Date.now()}.m4a`,
      } as any);
      formData.append("exerciseId", selectedExercise?.toString() || "");
      formData.append("duration", recordingDuration.toString());

      // Gửi lên server
      const response = await fetch("YOUR_SERVER_ENDPOINT", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Upload successful:", result);
        Alert.alert("Thành công", "Bản ghi âm đã được gửi lên server!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Lỗi", "Không thể gửi bản ghi âm lên server.");
    }
  };

  return (
    <HomeLayout>
      <ThemedText type="title" style={styles.title}>
        🎤 Speaking Practice
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Improve your Japanese speaking skills with interactive exercises
      </ThemedText>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        🗣️ Speaking Exercises
      </ThemedText>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.exercisesContainer}>
          {sampleSpeakingExercises.map((exercise) => (
            <SpeakingCard
              key={exercise.id}
              exercise={exercise}
              onPress={() => handleSpeakingPress(exercise.id)}
            />
          ))}
        </View>

        {/* Audio Recorder Section */}
        {selectedExercise && (
          <ThemedView style={styles.recorderSection}>
            <ThemedText type="subtitle" style={styles.recorderTitle}>
              🎙️ Ghi âm bài tập
            </ThemedText>
            <ThemedText style={styles.recorderDescription}>
              Chọn bài tập và bắt đầu ghi âm để luyện tập phát âm
            </ThemedText>

            <AudioRecorder
              exerciseTitle={
                selectedExercise
                  ? sampleSpeakingExercises[selectedExercise - 1]?.title
                  : "Bài tập phát âm"
              }
              onRecordingComplete={handleRecordingComplete}
              onRecordingStart={handleRecordingStart}
              onRecordingStop={handleRecordingStop}
              onPlaybackStart={handlePlaybackStart}
              onPlaybackStop={handlePlaybackStop}
              maxDuration={60}
              showPlayback={true}
            />

            {recordingUri && (
              <ThemedView style={styles.recordingResult}>
                <ThemedText style={styles.resultTitle}>
                  ✅ Ghi âm hoàn thành! ({Math.floor(recordingDuration / 60)}:
                  {(recordingDuration % 60).toString().padStart(2, "0")})
                </ThemedText>
                <ThemedText style={styles.resultDescription}>
                  Bạn có thể nghe lại bản ghi âm, ghi âm lại hoặc gửi lên server
                  để phân tích
                </ThemedText>

                <View style={styles.uploadContainer}>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => uploadRecording(recordingUri)}
                  >
                    <IconSymbol
                      name="icloud.and.arrow.up"
                      size={20}
                      color="#ffffff"
                    />
                    <ThemedText style={styles.uploadButtonText}>
                      Gửi lên server
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedView>
            )}
          </ThemedView>
        )}

        <ThemedView style={styles.statsCard}>
          <ThemedText type="subtitle" style={styles.statsTitle}>
            📊 Speaking Progress
          </ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>12</ThemedText>
              <ThemedText style={styles.statLabel}>Exercises Done</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>1.5h</ThemedText>
              <ThemedText style={styles.statLabel}>Practice Time</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>85%</ThemedText>
              <ThemedText style={styles.statLabel}>Pronunciation</ThemedText>
            </View>
          </View>
        </ThemedView>

        <ThemedView style={styles.tipsCard}>
          <ThemedText type="subtitle" style={styles.tipsTitle}>
            🎯 Speaking Tips
          </ThemedText>
          <View style={styles.tipsList}>
            <ThemedText style={styles.tipItem}>
              • Practice speaking out loud regularly, even if alone
            </ThemedText>
            <ThemedText style={styles.tipItem}>
              • Record yourself and listen back to identify areas for
              improvement
            </ThemedText>
            <ThemedText style={styles.tipItem}>
              • Focus on pronunciation and intonation patterns
            </ThemedText>
            <ThemedText style={styles.tipItem}>
              • Try to think in Japanese rather than translating from English
            </ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={styles.controlsCard}>
          <ThemedText type="subtitle" style={styles.controlsTitle}>
            🎛️ Recording Controls
          </ThemedText>
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlButton}>
              <IconSymbol
                name={"stop.circle.fill" as any}
                size={24}
                color="#ef4444"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <IconSymbol
                name={"mic.circle.fill" as any}
                size={48}
                color="#3b82f6"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <IconSymbol
                name={"play.circle.fill" as any}
                size={24}
                color="#10b981"
              />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.controlsHint}>
            Tap any exercise above to start speaking practice
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </HomeLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  exercisesContainer: {
    gap: 16,
  },
  speakingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  micButton: {
    marginLeft: 8,
  },
  cardFooter: {
    gap: 8,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  timeText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  statsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ef4444",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  tipsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  controlsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  controlsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 12,
  },
  controlButton: {
    padding: 8,
  },
  controlsHint: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    fontStyle: "italic",
  },
  scrollView: {
    flex: 1,
  },
  recorderSection: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  recorderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  recorderDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  recordingResult: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
    marginBottom: 4,
    textAlign: "center",
  },
  resultDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  uploadContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  uploadButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
