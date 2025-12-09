import { IUserEntity } from "@models/user/user.entity";
import React, { useCallback, useRef, useState } from "react";
import { Animated, Easing, InteractionManager, Modal, Pressable, StyleSheet } from "react-native";
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
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handleOpen = useCallback(() => {
    setIsExpanded(true);
    // Reset opacity for fade in
    opacityAnim.setValue(0);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const handleClose = useCallback((onComplete?: () => void) => {
    // Start navigation slightly before animation completes for seamless transition
    const navigationDelay = 200; // Start navigation at ~67% of animation
    
    if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, navigationDelay);
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start(() => {
      // Defer state update to avoid "useInsertionEffect must not schedule updates" error
      InteractionManager.runAfterInteractions(() => {
        setIsExpanded(false);
      });
    });
  }, [slideAnim, opacityAnim]);

  const handleCloseWithoutCallback = useCallback(() => {
    handleClose();
  }, [handleClose]);

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
        onRequestClose={handleCloseWithoutCallback}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: opacityAnim,
            },
          ]}
        >
          <Pressable 
            style={styles.overlayPressable}
            onPress={handleCloseWithoutCallback}
          >
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
        </Animated.View>
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
  overlayPressable: {
    flex: 1,
  },
  modalContent: {
    // Animation container
  },
});
