import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
  async function logStorage() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      console.log("🔎 AsyncStorage data:", stores);
    } catch (e) {
      console.error("Error reading AsyncStorage:", e);
    }
  }

  // Gọi hàm ở chỗ bạn cần debug
  logStorage();

  // 1. State/Ref để quản lý vị trí
  const pan = useRef(new Animated.ValueXY()).current;
  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);

  // 2. Hàm lưu vị trí vào AsyncStorage
  const savePosition = useCallback(async (x: number, y: number) => {
    try {
      const position = JSON.stringify({ x, y });
      await AsyncStorage.setItem(STORAGE_KEY, position);
    } catch (e) {
      console.error("Lỗi khi lưu vị trí:", e);
    }
  }, []);

  // 3. Hàm tải vị trí từ AsyncStorage
  useEffect(() => {
    // Vị trí mặc định (giữa màn hình)
    const defaultPosition = {
      x: screenWidth / 2 - OVERLAY_SIZE / 2,
      y: screenHeight / 2 - OVERLAY_SIZE / 2,
    };

    const loadPosition = async () => {
      try {
        const storedPosition = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedPosition !== null) {
          const { x, y } = JSON.parse(storedPosition);
          // Đặt giá trị ban đầu cho Animated.ValueXY
          pan.setValue({ x, y });
        } else {
          // Nếu không có vị trí đã lưu, đặt vị trí mặc định
          pan.setValue(defaultPosition);
          console.log("Using default position:", defaultPosition);
        }
      } catch (e) {
        console.error("Lỗi khi tải vị trí:", e);
        // Trong trường hợp lỗi, vẫn đặt vị trí mặc định
        pan.setValue(defaultPosition);
      } finally {
        setInitialLoadCompleted(true);
      }
    };

    // Timeout để đảm bảo component hiển thị ngay cả khi AsyncStorage chậm
    const timeoutId = setTimeout(() => {
      if (!initialLoadCompleted) {
        console.log("Timeout reached, forcing load completion");
        pan.setValue(defaultPosition);
        setInitialLoadCompleted(true);
      }
    }, 1000); // 1 giây timeout

    loadPosition();

    return () => clearTimeout(timeoutId);
  }, [pan, initialLoadCompleted]);

  // 4. PanResponder để xử lý kéo thả
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

        // 5. Ghi nhớ và giới hạn vị trí
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
      },
    })
  ).current;

  // 6. Ẩn/Hiện component
  if (!isVisible) {
    return null;
  }

  if (!initialLoadCompleted) {
    // Hiển thị loading state thay vì null
    return (
      <View
        style={[
          styles.container,
          { position: "absolute" as const, left: 0, top: 0, zIndex: 1001 },
        ]}
      >
        <View style={styles.overlayContent}>
          <Text style={styles.headerText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // 7. Style cho component
  const animatedStyle = {
    transform: pan.getTranslateTransform(),
    // Đặt vị trí ban đầu là absolute
    position: "absolute" as const,
    left: 0,
    top: 0,
    zIndex: 1001, // Đảm bảo overlay nằm trên cùng, cao hơn tour wrapper
  };

  return (
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
          // Fallback to text if no image provided
          <>
            <Text style={styles.headerText}>{text}</Text>
            <Text style={styles.bodyText}>Vị trí được ghi nhớ!</Text>
          </>
        )}

        {/* Optional text overlay */}
        {showText && imageUri && (
          <View style={styles.textOverlay}>
            <Text style={styles.overlayText}>{text}</Text>
          </View>
        )}

        {/* Nút đóng (tùy chọn) */}
        {/* <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity> */}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: OVERLAY_SIZE,
    height: OVERLAY_SIZE,
    borderRadius: 10,
    backgroundColor: "transparent", // Bỏ nền màu xanh
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
});

export default DraggableOverlay;
