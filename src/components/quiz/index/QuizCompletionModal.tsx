import { QuizCompletionStatus } from "@constants/quiz.enum";
import { ICheckCompletionData } from "@models/user-exercise-attempt/user-exercise-attempt.response";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

interface QuizCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  data: ICheckCompletionData | null;
  questions: { id: string; bankId?: string | number }[]; // Questions array to map IDs to question numbers
  // For test: questions have both id and bankId
  // For quiz: questions only have id (which is bankId converted to string)
}

export function QuizCompletionModal({
  visible,
  onClose,
  onSubmit,
  data,
  questions,
}: QuizCompletionModalProps) {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Map unanswered question IDs (bankId numbers) to question numbers (index + 1)
  const unansweredQuestionNumbers = useMemo(() => {
    if (!data?.unansweredQuestionIds || !questions.length) return [];
    
    return data.unansweredQuestionIds
      .map((bankId) => {
        // Find question by bankId or id
        // - For test: questions have both id and bankId, use bankId
        // - For quiz: questions only have id (which is bankId converted to string), use id
        const questionIndex = questions.findIndex((q) => {
          // If question has bankId (test case), compare with bankId
          if (q.bankId !== undefined) {
            return q.bankId === String(bankId);
          }
          // Otherwise (quiz case), compare id with bankId as string
          return q.id === String(bankId);
        });
        return questionIndex >= 0 ? questionIndex + 1 : null;
      })
      .filter((num): num is number => num !== null)
      .sort((a, b) => a - b);
  }, [data?.unansweredQuestionIds, questions]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible, scaleAnim, fadeAnim]);

  const statusLabel = useMemo(() => {
    if (!data) {
      return t("quiz_completion.status.not_started", "Chưa bắt đầu");
    }

    switch (data.status) {
      case QuizCompletionStatus.COMPLETED:
        return t("quiz_completion.status.completed", "Hoàn thành");
      case QuizCompletionStatus.IN_PROGRESS:
        return t("quiz_completion.status.in_progress", "Đang làm");
      case QuizCompletionStatus.FAILED:
        return t("quiz_completion.status.failed", "Không đạt");
      case QuizCompletionStatus.PENDING:
      default:
        return t("quiz_completion.status.not_started", "Chưa bắt đầu");
    }
  }, [data, t]);

  if (!visible || !data) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>
                  {t("quiz_completion.title", "Thông tin bài làm")}
                </Text>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    {t("quiz_completion.labels.total_questions", "Tổng số câu hỏi:")}
                  </Text>
                  <Text style={styles.value}>{data.totalQuestions}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    {t("quiz_completion.labels.answered", "Đã trả lời:")}
                  </Text>
                  <Text style={[styles.value, styles.answeredValue]}>
                    {data.answeredQuestions}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    {t("quiz_completion.labels.unanswered", "Chưa trả lời:")}
                  </Text>
                  <Text style={[styles.value, styles.unansweredValue]}>
                    {data.unansweredQuestions}
                  </Text>
                </View>

                {data.unansweredQuestions > 0 && (
                  <View style={styles.unansweredSection}>
                    <Text style={styles.unansweredTitle}>
                      {t(
                        "quiz_completion.labels.unanswered_list",
                        "Câu hỏi chưa trả lời:"
                      )}
                    </Text>
                    <View style={styles.unansweredList}>
                      <Text style={styles.unansweredText}>
                        {unansweredQuestionNumbers
                          .map((num) =>
                            t("quiz_completion.labels.question_number", {
                              number: num,
                              defaultValue: `Câu ${num}`,
                            })
                          )
                          .join(", ")}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.statusRow}>
                  <Text style={styles.label}>
                    {t("quiz_completion.labels.status", "Trạng thái:")}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      data.isCompleted
                        ? styles.statusCompleted
                        : styles.statusInProgress,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        data.isCompleted
                          ? styles.statusTextCompleted
                          : styles.statusTextInProgress,
                      ]}
                    >
                      {statusLabel}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>
                    {t("quiz_completion.buttons.continue", "Làm tiếp")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={onSubmit}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>
                    {t("quiz_completion.buttons.submit", "Nộp bài")}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTouchable: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  content: {
    marginBottom: 24,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  answeredValue: {
    color: "#10b981",
  },
  unansweredValue: {
    color: "#ef4444",
  },
  unansweredSection: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
  },
  unansweredTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#991b1b",
    marginBottom: 8,
  },
  unansweredList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  unansweredItem: {
    marginRight: 4,
  },
  unansweredText: {
    fontSize: 14,
    color: "#991b1b",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: "#d1fae5",
  },
  statusInProgress: {
    backgroundColor: "#dbeafe",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusTextCompleted: {
    color: "#065f46",
  },
  statusTextInProgress: {
    color: "#1e40af",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  submitButton: {
    backgroundColor: "#0ea5e9",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});

