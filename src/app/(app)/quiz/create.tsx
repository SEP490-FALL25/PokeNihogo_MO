import BounceButton from "@components/ui/BounceButton";
import { Button } from "@components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Select } from "@components/ui/Select";
import { ICreateQuizSessionResponse } from "@models/quiz/quiz.response";
import { quizService } from "@services/quiz";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface QuizConfig {
  category?: string;
  level?: "N5" | "N4" | "N3";
  questionCount?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export default function CreateQuizScreen() {
  const [config, setConfig] = useState<QuizConfig>({
    category: "vocabulary",
    level: "N5",
    questionCount: 10,
    difficulty: "beginner",
  });
  const [isCreating, setIsCreating] = useState(false);

  const categories = [
    { value: "vocabulary", label: "Từ vựng" },
    { value: "grammar", label: "Ngữ pháp" },
    { value: "kanji", label: "Kanji" },
    { value: "listening", label: "Nghe hiểu" },
    { value: "reading", label: "Đọc hiểu" },
    { value: "mixed", label: "Tổng hợp" },
  ];

  const levels = [
    { value: "N5", label: "N5 - Cơ bản" },
    { value: "N4", label: "N4 - Trung cấp" },
    { value: "N3", label: "N3 - Cao cấp" },
  ];

  const difficulties = [
    { value: "beginner", label: "Dễ" },
    { value: "intermediate", label: "Trung bình" },
    { value: "advanced", label: "Khó" },
  ];

  const questionCounts = [
    { value: "5", label: "5 câu hỏi" },
    { value: "10", label: "10 câu hỏi" },
    { value: "15", label: "15 câu hỏi" },
    { value: "20", label: "20 câu hỏi" },
  ];

  const handleCreateQuiz = async () => {
    try {
      setIsCreating(true);

      const response: ICreateQuizSessionResponse =
        await quizService.createQuizSession(config);

      if (response.statusCode === 201 && response.data?.session) {
        // Navigate to quiz screen
        router.replace({
          pathname: "/quiz/[sessionId]",
          params: { sessionId: response.data.session.id },
        });
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      Alert.alert("Lỗi", "Không thể tạo quiz. Vui lòng thử lại.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Tạo Quiz Mới</Text>
          <Text style={styles.subtitle}>
            Chọn cài đặt để tạo quiz phù hợp với trình độ của bạn
          </Text>
        </View>

        {/* Category Selection */}
        <Card style={styles.configCard}>
          <CardHeader>
            <CardTitle style={styles.configTitle}>Chủ đề Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={config.category}
              onValueChange={(value) =>
                setConfig({ ...config, category: value })
              }
              options={categories}
              placeholder="Chọn chủ đề"
            />
          </CardContent>
        </Card>

        {/* Level Selection */}
        <Card style={styles.configCard}>
          <CardHeader>
            <CardTitle style={styles.configTitle}>Trình độ</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={config.level}
              onValueChange={(value) =>
                setConfig({ ...config, level: value as any })
              }
              options={levels}
              placeholder="Chọn trình độ"
            />
          </CardContent>
        </Card>

        {/* Difficulty Selection */}
        <Card style={styles.configCard}>
          <CardHeader>
            <CardTitle style={styles.configTitle}>Độ khó</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={config.difficulty}
              onValueChange={(value) =>
                setConfig({ ...config, difficulty: value as any })
              }
              options={difficulties}
              placeholder="Chọn độ khó"
            />
          </CardContent>
        </Card>

        {/* Question Count Selection */}
        <Card style={styles.configCard}>
          <CardHeader>
            <CardTitle style={styles.configTitle}>Số câu hỏi</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={config.questionCount?.toString()}
              onValueChange={(value) =>
                setConfig({ ...config, questionCount: parseInt(value) })
              }
              options={questionCounts}
              placeholder="Chọn số câu hỏi"
            />
          </CardContent>
        </Card>

        {/* Quiz Info */}
        <Card style={styles.infoCard}>
          <CardHeader>
            <CardTitle style={styles.infoTitle}>Thông tin Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Chủ đề:</Text>
              <Text style={styles.infoValue}>
                {categories.find((c) => c.value === config.category)?.label}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trình độ:</Text>
              <Text style={styles.infoValue}>
                {levels.find((l) => l.value === config.level)?.label}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Độ khó:</Text>
              <Text style={styles.infoValue}>
                {difficulties.find((d) => d.value === config.difficulty)?.label}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số câu hỏi:</Text>
              <Text style={styles.infoValue}>
                {
                  questionCounts.find(
                    (q) => q.value === config.questionCount?.toString()
                  )?.label
                }
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thời gian ước tính:</Text>
              <Text style={styles.infoValue}>
                {Math.ceil((config.questionCount || 10) * 1.5)} phút
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <BounceButton
            onPress={handleCreateQuiz}
            loading={isCreating}
            variant="ghost"
            // style={styles.createButton}
          >
            Bắt đầu Quiz
          </BounceButton>

          <Button
            variant="outline"
            onPress={() => router.back()}
            style={styles.cancelButton}
          >
            Hủy
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  configCard: {
    margin: 16,
    marginBottom: 8,
  },
  configTitle: {
    fontSize: 18,
    marginBottom: 0,
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: "#f0f9ff",
    borderColor: "#dbeafe",
  },
  infoTitle: {
    fontSize: 18,
    marginBottom: 0,
    color: "#1e40af",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  actionContainer: {
    padding: 20,
    gap: 12,
  },
  createButton: {
    height: 50,
  },
  cancelButton: {
    height: 50,
  },
});
