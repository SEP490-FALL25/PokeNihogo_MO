import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import {
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "./ui/AlertDialog";
import BounceButton from "./ui/BounceButton";
import { Card, CardContent } from "./ui/Card";

const { width } = Dimensions.get("window");

// Định nghĩa Props (kiểu dữ liệu)
interface DailyCheckinModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCheckin: () => void;
}

const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({
  isVisible,
  onClose,
  onCheckin,
}) => {
  const handleCheckin = () => {
    onCheckin();
    setTimeout(onClose, 1000);
  };

  return (
    <AlertDialogContent
      isOpen={isVisible}
      onOpenChange={onClose}
      style={styles.dialogContent}
    >
      {/* Nút Đóng - X */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close-circle" size={30} color="#ef4444" />
      </TouchableOpacity>

      <AlertDialogHeader>
        {/* Icon Chính - dùng trophy-sharp Ionicon với màu primary đúng */}
        <Ionicons
          name="trophy-sharp"
          size={70}
          color="#22C55E"
          style={{ marginBottom: 15 }}
        />
        <ThemedText type="title" style={styles.modalTitle}>
          🎉 Check-in Hàng Ngày! 🎉
        </ThemedText>
        <ThemedText type="subtitle" style={styles.modalSubtitle}>
          Chào mừng bạn trở lại Pokenihongo!
        </ThemedText>
      </AlertDialogHeader>

      {/* Phần Thưởng sử dụng Card component */}
      <Card style={styles.rewardCard}>
        <CardContent style={styles.rewardContent}>
          <ThemedText style={styles.rewardText}>Bạn nhận được:</ThemedText>
          <View style={styles.rewardItem}>
            {/* Icon Coin - dùng logo-usd Ionicon với màu primary đúng */}
            <Ionicons name="logo-usd" size={24} color="#22C55E" />
            <ThemedText style={styles.rewardAmount}>
              + 100 Coin Nihon
            </ThemedText>
          </View>
          <View style={styles.rewardItem}>
            {/* Icon Streak - dùng flame-sharp Ionicon với màu secondary */}
            <Ionicons name="flame-sharp" size={24} color="#6FAFB2" />
            <ThemedText style={styles.rewardAmount}>+ 1 Streak Day</ThemedText>
          </View>
        </CardContent>
      </Card>

      <AlertDialogFooter>
        {/* Nút Check-in sử dụng Button component */}
        <BounceButton variant="solid" size="lg" onPress={handleCheckin}>
          NHẬN THƯỞNG NGAY
        </BounceButton>
      </AlertDialogFooter>

      {/* Lời nhắc */}
      <ThemedText style={styles.reminderText}>
        Hãy duy trì chuỗi học tập để nhận phần thưởng lớn!
      </ThemedText>
    </AlertDialogContent>
  );
};

const styles = StyleSheet.create({
  dialogContent: {
    alignItems: "center",
    width: width * 0.85,
    maxWidth: 400,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  modalTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  rewardCard: {
    width: "100%",
    marginBottom: 24,
    backgroundColor: "#f9fafb",
  },
  rewardContent: {
    padding: 16,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rewardAmount: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  checkinButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  reminderText: {
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
});

export default DailyCheckinModal;
