import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useGlobalStore } from "../../stores/global/global.config";
import { useUserStore } from "../../stores/user/user.config";
import PokemonImage from "../atoms/PokemonImage";
import PokemonDisplay from "../molecules/PokemonDisplay";

// Tên key dùng để lưu vị trí trong AsyncStorage
const STORAGE_KEY = "@DraggableOverlay:position";

// Kích thước của overlay
const OVERLAY_SIZE = 150;
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface DraggableOverlayProps {
  isVisible?: boolean;
  onClose?: () => void;
  /** URI of the Pokemon image to display */
  imageUri?: string;
  /** Size of the Pokemon image (default: 80) */
  imageSize?: number;
  /** Whether to show background card or just the Pokemon image (default: true) */
  showBackground?: boolean;
  /** Whether to show text overlay (default: false) */
  showText?: boolean;
  /** Custom text to display */
  text?: string;
}

const TAP_THRESHOLD = 5;

/**
 * Component Overlay có thể kéo thả và ghi nhớ vị trí với Pokemon display
 *
 * @param {object} props - Thuộc tính của component
 * @param {boolean} props.isVisible - Xác định xem overlay có hiển thị hay không
 * @param {function} props.onClose - Hàm callback khi người dùng đóng overlay (nếu bạn thêm nút đóng)
 * @param {string} props.imageUri - URI của hình ảnh Pokemon
 * @param {number} props.imageSize - Kích thước hình ảnh Pokemon
 * @param {boolean} props.showBackground - Hiển thị background card hay chỉ hình ảnh
 * @param {boolean} props.showText - Hiển thị text overlay
 * @param {string} props.text - Text tùy chỉnh để hiển thị
 */
const DraggableOverlay = ({
  isVisible = true,
  onClose,
  imageUri,
  imageSize = 80,
  showBackground = true,
  showText = false,
  text = "Kéo Thả Tự Do",
}: DraggableOverlayProps) => {
  const { t } = useTranslation();
  // Global store for overlay position
  const {
    overlayPosition,
    isOverlayPositionLoaded,
    setOverlayPosition,
    setOverlayPositionLoaded,
    setPokemonOverlayEnabled,
  } = useGlobalStore();

  // User store to check first time login
  const { isFirstTimeLogin } = useUserStore();

  // 1. State/Ref để quản lý vị trí
  const pan = useRef(new Animated.ValueXY()).current;
  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);
  const isInitializing = useRef(false);
  const [showOverlayModal, setShowOverlayModal] = useState(false);

  // 2. Hàm lưu vị trí vào cả AsyncStorage và Global Store
  const savePosition = useCallback(
    async (x: number, y: number) => {
      try {
        const position = JSON.stringify({ x, y });
        await AsyncStorage.setItem(STORAGE_KEY, position);
        // Update global store immediately for instant sync across screens
        setOverlayPosition({ x, y });
      } catch (e) {
        console.error("Lỗi khi lưu vị trí:", e);
      }
    },
    [setOverlayPosition]
  );

  // 3. Initialize position from AsyncStorage (runs only once)
  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    const initializePosition = async () => {
      // Vị trí mặc định (giữa màn hình)
      const defaultPosition = {
        x: screenWidth / 2 - OVERLAY_SIZE / 2,
        y: screenHeight / 2 - OVERLAY_SIZE / 2,
      };

      try {
        // Always load from AsyncStorage first to get the most recent position
        const storedPosition = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedPosition !== null) {
          const { x, y } = JSON.parse(storedPosition);
          console.log("Loaded position from AsyncStorage:", { x, y });

          // Validate position is within screen bounds
          const validX = Math.max(0, Math.min(x, screenWidth - OVERLAY_SIZE));
          const validY = Math.max(0, Math.min(y, screenHeight - OVERLAY_SIZE));

          const validPosition = { x: validX, y: validY };

          // Update global store and set position
          setOverlayPosition(validPosition);
          pan.setValue(validPosition);
        } else {
          console.log("No stored position, using default:", defaultPosition);
          // Update global store with default position
          setOverlayPosition(defaultPosition);
          pan.setValue(defaultPosition);
        }
      } catch (e) {
        console.error("Lỗi khi tải vị trí:", e);
        // Update global store with default position
        setOverlayPosition(defaultPosition);
        pan.setValue(defaultPosition);
      } finally {
        setOverlayPositionLoaded(true);
        setInitialLoadCompleted(true);
      }
    };

    initializePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - runs only once on mount

  // 3.5. Handle first time login - set default position when user first logs in
  useEffect(() => {
    const handleFirstTimeLogin = async () => {
      // Only run if this is first time login and position hasn't been loaded yet
      if (isFirstTimeLogin === true && !isOverlayPositionLoaded) {
        const defaultPosition = {
          x: screenWidth / 2 - OVERLAY_SIZE / 2,
          y: screenHeight / 2 - OVERLAY_SIZE / 2,
        };

        console.log(
          "First time login detected, setting default center position:",
          defaultPosition
        );

        // Update global store with default position
        setOverlayPosition(defaultPosition);
        pan.setValue(defaultPosition);

        // Save the default position to AsyncStorage for future use
        await savePosition(defaultPosition.x, defaultPosition.y);
        setOverlayPositionLoaded(true);
        setInitialLoadCompleted(true);
      }
    };

    handleFirstTimeLogin();
  }, [
    isFirstTimeLogin,
    isOverlayPositionLoaded,
    setOverlayPosition,
    setOverlayPositionLoaded,
    pan,
    savePosition,
  ]);

  // 4. Sync position from global store when it changes (separate effect)
  useEffect(() => {
    if (isOverlayPositionLoaded && initialLoadCompleted) {
      // Only update if position is different to avoid unnecessary updates
      const currentPanX = (pan.x as any)._value;
      const currentPanY = (pan.y as any)._value;

      if (
        Math.abs(currentPanX - overlayPosition.x) > 1 ||
        Math.abs(currentPanY - overlayPosition.y) > 1
      ) {
        pan.setValue(overlayPosition);
      }
    }
  }, [overlayPosition, isOverlayPositionLoaded, initialLoadCompleted, pan]);

  // 5. PanResponder để xử lý kéo thả
  const panResponder = useRef(
    PanResponder.create({
      // Cho phép PanResponder xử lý cử chỉ
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      // Khi bắt đầu kéo
      onPanResponderGrant: () => {
        // Lưu lại giá trị ban đầu để tạo offset
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        // Reset giá trị hiện tại về 0 để di chuyển tương đối
        pan.setValue({ x: 0, y: 0 });
      },

      // Khi đang kéo
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }, // Cập nhật pan.x và pan.y với sự thay đổi (delta)
        ],
        { useNativeDriver: false } // Phải là false khi dùng Animated.ValueXY cho style 'top'/'left'
      ),

      // Khi thả tay (kết thúc kéo)
      onPanResponderRelease: (e, gestureState) => {
        // Kết hợp offset và giá trị hiện tại (đặt lại offset = 0)
        pan.flattenOffset();

        // 6. Ghi nhớ và giới hạn vị trí
        let finalX = (pan.x as any)._value;
        let finalY = (pan.y as any)._value;

        // Giới hạn X (0 đến (screenWidth - OVERLAY_SIZE))
        finalX = Math.max(0, Math.min(finalX, screenWidth - OVERLAY_SIZE));
        // Giới hạn Y (0 đến (screenHeight - OVERLAY_SIZE))
        finalY = Math.max(0, Math.min(finalY, screenHeight - OVERLAY_SIZE));

        // Đảm bảo component dừng ở vị trí giới hạn
        // Điều chỉnh vị trí của Animated Value
        pan.setValue({ x: finalX, y: finalY });

        // Lưu vị trí cuối cùng
        savePosition(finalX, finalY);

        // Detect tap (not a drag) to open modal
        const isTap =
          Math.abs(gestureState.dx) < TAP_THRESHOLD &&
          Math.abs(gestureState.dy) < TAP_THRESHOLD;
        if (isTap) {
          setShowOverlayModal(true);
        }
      },
    })
  ).current;

  // 7. Ẩn/Hiện component
  if (!isVisible) {
    return null;
  }

  if (!initialLoadCompleted) {
    // Don't render anything until position is properly loaded
    // This prevents the overlay from appearing at wrong position during initialization
    return null;
  }

  // 8. Style cho component
  const animatedStyle = {
    transform: pan.getTranslateTransform(),
    // Đặt vị trí ban đầu là absolute
    position: "absolute" as const,
    left: 0,
    top: 0,
    zIndex: 1001, // Đảm bảo overlay nằm trên cùng, cao hơn tour wrapper
  };

  return (
    <>
      <Animated.View
        style={[styles.container, animatedStyle]}
        {...panResponder.panHandlers} // Gán các hàm xử lý kéo thả
      >
        <View style={styles.overlayContent}>
          {/* Pokemon Display */}
          {imageUri ? (
            showBackground ? (
              <PokemonDisplay imageUri={imageUri} imageSize={imageSize} />
            ) : (
              <PokemonImage imageUri={imageUri} size={imageSize} />
            )
          ) : (
            // Keep showing loading state while waiting for imageUri to be available
            <PokemonImage imageUri={"" as any} size={imageSize} />
          )}

          {/* Optional text overlay */}
          {showText && imageUri && (
            <View style={styles.textOverlay}>
              <Text style={styles.overlayText}>{text}</Text>
            </View>
          )}
        </View>
      </Animated.View>

      <Modal
        visible={showOverlayModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOverlayModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowOverlayModal(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {t("settings.overlay_modal_title", "Tùy chọn bạn đồng hành")}
          </Text>
          <Text style={styles.modalDescription}>
            {t(
              "settings.overlay_modal_description",
              "Tắt bạn đồng hành nổi nếu bạn thấy vướng. Bạn có thể bật lại bất cứ lúc nào."
            )}
          </Text>

          <TouchableOpacity
            style={styles.modalPrimaryButton}
            onPress={() => {
              setShowOverlayModal(false);
              setPokemonOverlayEnabled(false);
            }}
          >
            <Text style={styles.modalPrimaryText}>
              {t("settings.overlay_turn_off", "Tắt bạn đồng hành")}
            </Text>
          </TouchableOpacity>

          <Text style={styles.modalHint}>
            {t(
              "settings.overlay_hint",
              "Muốn bật lại? Vào mục Cài đặt và bật “Pokémon overlay”."
            )}
          </Text>

          <TouchableOpacity
            style={styles.modalSecondaryButton}
            onPress={() => setShowOverlayModal(false)}
          >
            <Text style={styles.modalSecondaryText}>
              {t("common.cancel", "Cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: OVERLAY_SIZE,
    height: OVERLAY_SIZE,
    borderRadius: 10,
    backgroundColor: "transparent", // Bỏ nền màu xanh
    // Các thuộc tính style cho view cha để căn chỉnh vị trí được đặt trong animatedStyle
    overflow: "hidden", // Ensure content doesn't overflow rounded corners
  },
  overlayContent: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
  },
  bodyText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  textOverlay: {
    position: "absolute",
    bottom: 5,
    left: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 5,
    padding: 4,
  },
  overlayText: {
    color: "white",
    fontSize: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    top: screenHeight / 3,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  modalDescription: {
    fontSize: 14,
    color: "#475569",
  },
  modalHint: {
    fontSize: 13,
    color: "#94a3b8",
  },
  modalPrimaryButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalPrimaryText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  modalSecondaryButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  modalSecondaryText: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 15,
  },
});

export default DraggableOverlay;
