import { IUserEntity } from "@models/user/user.entity";
import React, { useState } from "react";
import { Animated, InteractionManager, Modal, Pressable, StyleSheet } from "react-native";
import CompactHeader from "../molecules/CompactHeader";
import ExpandedContent from "../molecules/ExpandedContent";

interface UserProfileHeaderAtomicProps {
  user: IUserEntity;
  style?: any;
}

export default function UserProfileHeaderAtomic({
  user,
  style,
}: UserProfileHeaderAtomicProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-300));

  const handleOpen = () => {
    setIsExpanded(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      // Use InteractionManager to defer state update until after interactions complete
      InteractionManager.runAfterInteractions(() => {
        setIsExpanded(false);
      });
    });
  };

  return (
    <>
      {/* Compact Header Bar */}
      <CompactHeader
        user={user}
        onPress={handleOpen}
        style={style}
      />
      {/* Overlay Modal */}
      <Modal
        visible={isExpanded}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <ExpandedContent user={user} onClose={handleClose} />
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(121, 180, 196, 0.8)",
    justifyContent: "flex-start",
    paddingTop: 60,
  },
  modalContent: {
    // Animation container
  },
});
