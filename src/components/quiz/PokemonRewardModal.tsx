import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";

interface PokemonReward {
  id: string;
  name: string;
  image: string;
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
}

interface PokemonRewardModalProps {
  visible: boolean;
  pokemon: PokemonReward;
  onClose: () => void;
  onClaim?: () => void;
}

const { width } = Dimensions.get("window");

export const PokemonRewardModal: React.FC<PokemonRewardModalProps> = ({
  visible,
  pokemon,
  onClose,
  onClaim,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Start animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      bounceAnim.setValue(0);
    }
  }, [visible, scaleAnim, rotateAnim, bounceAnim]);

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case "LEGENDARY":
        return "#fbbf24";
      case "EPIC":
        return "#a855f7";
      case "RARE":
        return "#3b82f6";
      case "UNCOMMON":
        return "#10b981";
      case "COMMON":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getRarityText = (rarity: string): string => {
    switch (rarity) {
      case "LEGENDARY":
        return "HUYỀN THOẠI";
      case "EPIC":
        return "EPIC";
      case "RARE":
        return "HIẾM";
      case "UNCOMMON":
        return "KHÔNG PHỔ BIẾN";
      case "COMMON":
        return "PHỔ BIẾN";
      default:
        return "PHỔ BIẾN";
    }
  };

  const getRarityEmoji = (rarity: string): string => {
    switch (rarity) {
      case "LEGENDARY":
        return "🌟";
      case "EPIC":
        return "💜";
      case "RARE":
        return "💎";
      case "UNCOMMON":
        return "✨";
      case "COMMON":
        return "⭐";
      default:
        return "⭐";
    }
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const bounceInterpolate = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          <Card style={styles.modalCard}>
            <CardContent style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>🎉 Chúc mừng!</Text>
                <Text style={styles.subtitle}>Bạn đã nhận được Pokemon!</Text>
              </View>

              {/* Pokemon Animation */}
              <View style={styles.pokemonContainer}>
                <Animated.View
                  style={[
                    styles.pokemonWrapper,
                    {
                      transform: [
                        { scale: scaleAnim },
                        { rotate: rotateInterpolate },
                        { translateY: bounceInterpolate },
                      ],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.pokemonImageContainer,
                      {
                        backgroundColor: getRarityColor(pokemon.rarity) + "20",
                      },
                    ]}
                  >
                    <Text style={styles.pokemonEmoji}>🦄</Text>
                  </View>
                </Animated.View>
              </View>

              {/* Pokemon Info */}
              <View style={styles.pokemonInfo}>
                <Text style={styles.pokemonName}>{pokemon.name}</Text>
                <View
                  style={[
                    styles.rarityBadge,
                    { backgroundColor: getRarityColor(pokemon.rarity) },
                  ]}
                >
                  <Text style={styles.rarityEmoji}>
                    {getRarityEmoji(pokemon.rarity)}
                  </Text>
                  <Text style={styles.rarityText}>
                    {getRarityText(pokemon.rarity)}
                  </Text>
                </View>
              </View>

              {/* Reward Description */}
              <View style={styles.rewardDescription}>
                <Text style={styles.descriptionText}>
                  Bạn đã hoàn thành quiz với điểm số xuất sắc và nhận được
                  Pokemon{" "}
                  <Text
                    style={[
                      styles.pokemonNameText,
                      { color: getRarityColor(pokemon.rarity) },
                    ]}
                  >
                    {pokemon.name}
                  </Text>
                  ! Pokemon này sẽ được thêm vào bộ sưu tập của bạn.
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  onPress={() => {
                    onClaim?.();
                    onClose();
                  }}
                  style={styles.claimButton}
                >
                  Nhận thưởng
                </Button>
                <Button
                  variant="outline"
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  Đóng
                </Button>
              </View>
            </CardContent>
          </Card>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContent: {
    padding: 24,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  pokemonContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  pokemonWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  pokemonImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pokemonEmoji: {
    fontSize: 60,
  },
  pokemonInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  pokemonName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  rarityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  rarityEmoji: {
    fontSize: 16,
  },
  rarityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  rewardDescription: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  pokemonNameText: {
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  claimButton: {
    flex: 1,
    height: 48,
  },
  closeButton: {
    flex: 1,
    height: 48,
  },
});
