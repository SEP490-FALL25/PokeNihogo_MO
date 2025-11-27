import React, { useCallback, useEffect } from "react";
import {
  Dimensions,
  Modal,
  RefreshControlProps,
  StyleSheet,
  Text,
  TextProps,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BottomSheetProps {
  children: React.ReactNode;
  open?: boolean; // Controlled open state
  onOpenChange?: (open: boolean) => void; // Controlled onChange handler
  closeOnBlur?: boolean; // Auto close when screen loses focus
}

interface BottomSheetTriggerProps extends ViewProps {
  children: React.ReactNode;
}

interface BottomSheetContentProps extends ViewProps {
  children: React.ReactNode;
  snapPoints?: number[]; // Percentage of screen height (0-1)
  enablePanDownToClose?: boolean;
  backdropOpacity?: number;
  contentContainerStyle?: ViewProps["style"];
  showsVerticalScrollIndicator?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  stickyHeaderIndices?: number[];
}

interface BottomSheetHeaderProps extends ViewProps {
  children: React.ReactNode;
}

interface BottomSheetFooterProps extends ViewProps {
  children: React.ReactNode;
}

interface BottomSheetTitleProps extends TextProps {
  children: React.ReactNode;
}

interface BottomSheetDescriptionProps extends TextProps {
  children: React.ReactNode;
}

interface BottomSheetCloseProps extends ViewProps {
  children: React.ReactNode;
}

const BottomSheet = ({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  closeOnBlur = true,
}: BottomSheetProps) => {
  // Use controlled state if provided, otherwise use internal state
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (isControlled) {
        controlledOnOpenChange?.(open);
      } else {
        setInternalOpen(open);
      }
    },
    [isControlled, controlledOnOpenChange]
  );

  // Close BottomSheet when component unmounts (e.g., when navigating away)
  React.useEffect(() => {
    return () => {
      // Cleanup: close sheet when component unmounts
      if (isOpen) {
        handleOpenChange(false);
      }
    };
  }, [isOpen, handleOpenChange]);

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const cloned = React.cloneElement(child, {
            isOpen,
            onOpenChange: handleOpenChange,
          } as any);
          return cloned;
        }
        return child;
      })}
    </>
  );
};

const BottomSheetTrigger = React.forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  BottomSheetTriggerProps & {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ children, isOpen, onOpenChange, ...props }, ref) => {
  const handlePress = (e?: any) => {
    if (onOpenChange) {
      onOpenChange(true);
    } else {
      console.warn("BottomSheetTrigger: onOpenChange is not defined!");
    }
  };

  // Always wrap children in TouchableOpacity to ensure touch events work
  // If children is a TouchableOpacity or Pressable, we need to handle it differently
  if (React.isValidElement(children)) {
    const childProps = children.props as any;

    // If children already has onPress, clone and combine handlers
    if (childProps?.onPress !== undefined) {
      return React.cloneElement(
        children as any,
        {
          ...props,
          onPress: (e: any) => {
            handlePress(e);
            // Call original onPress if it exists
            if (childProps.onPress) {
              childProps.onPress(e);
            }
          },
        } as any
      );
    }
  }

  // Default: wrap in TouchableOpacity
  // Use pointerEvents to ensure children don't block touches
  let processedChildren = children;
  if (React.isValidElement(children)) {
    const childType = children.type as any;
    const isViewType =
      childType === View ||
      (typeof childType === "object" &&
        (childType?.displayName === "View" ||
          childType?.name === "View" ||
          (typeof childType === "function" &&
            childType.toString().includes("View"))));

    if (isViewType) {
      processedChildren = React.cloneElement(
        children as any,
        {
          ...(children.props as any),
          pointerEvents: "box-none" as const,
        } as any
      );
    }
  }

  return (
    <TouchableOpacity
      ref={ref}
      onPress={handlePress}
      activeOpacity={0.7}
      style={[{ flexShrink: 0 }, props.style]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      {...(props as any)}
    >
      {processedChildren}
    </TouchableOpacity>
  );
});

BottomSheetTrigger.displayName = "BottomSheetTrigger";

const BottomSheetContent = React.forwardRef<
  View,
  BottomSheetContentProps & {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (
    {
      children,
      isOpen,
      onOpenChange,
      snapPoints = [0.5], // Default to 50% of screen height
      enablePanDownToClose = true,
      backdropOpacity = 0.5,
      contentContainerStyle,
      showsVerticalScrollIndicator = true,
      refreshControl,
      stickyHeaderIndices,
      style,
      ...props
    },
    ref
  ) => {
    // translateY: 0 = off-screen (below), negative = slide up
    const translateY = useSharedValue(0); // Start off-screen below (at top: SCREEN_HEIGHT)
    const context = useSharedValue({ y: 0 });
    const backdropOpacityValue = useSharedValue(0);

    // Calculate how much of screen height the sheet should show
    // snapPoints[0] = 0.5 means show 50% of screen
    const visibleHeight = SCREEN_HEIGHT * (snapPoints[0] || 0.5);
    // When open, translateY should be -visibleHeight to show that much from bottom
    // Since top starts at SCREEN_HEIGHT, we need to move up by visibleHeight
    const openTranslateY = -visibleHeight;

    const scrollY = useSharedValue(0);
    const scrollViewRef = React.useRef<Animated.ScrollView>(null);
    // Initialize isVisible based on isOpen state
    const [isVisible, setIsVisible] = React.useState(isOpen);
    const animationTimeoutRef = React.useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

    // Initialize translateY position - start from bottom (off-screen)
    React.useEffect(() => {
      translateY.value = 0;
      backdropOpacityValue.value = 0;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    useEffect(() => {
      // Clear any pending timeouts
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }

      if (isOpen) {
        // Show Modal first, then animate
        setIsVisible(true);
        // Small delay to ensure Modal is mounted before animation
        // This ensures smooth opening animation
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Animate from bottom (off-screen, translateY = 0) to open position (translateY = -visibleHeight)
            translateY.value = withSpring(openTranslateY, {
              damping: 50,
              stiffness: 300,
            });
            backdropOpacityValue.value = withTiming(backdropOpacity, {
              duration: 300,
            });
          });
        });
      } else if (isVisible) {
        // Only animate if Modal is currently visible
        // Animate back to bottom (off-screen, translateY = 0) before hiding
        translateY.value = withSpring(0, {
          damping: 50,
          stiffness: 300,
        });
        backdropOpacityValue.value = withTiming(0, {
          duration: 300,
        });
        // Reset scroll position when closing
        scrollY.value = 0;

        // Hide Modal after animation completes (wait for spring animation + fade)
        // Spring animation typically takes ~400-500ms, backdrop fade takes 300ms
        animationTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          animationTimeoutRef.current = null;
        }, 400); // Wait for animations to complete
      }

      // Cleanup function
      return () => {
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
          animationTimeoutRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, openTranslateY, backdropOpacity]);

    const closeSheet = useCallback(() => {
      onOpenChange?.(false);
    }, [onOpenChange]);

    const handleScroll = React.useCallback(
      (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        scrollY.value = offsetY;
      },
      [scrollY]
    );

    // Pan gesture for dragging the sheet down
    // This gesture works when:
    // 1. User drags from the handle area
    // 2. User drags down when ScrollView is at the top (scrollY <= 0)
    const panGesture = Gesture.Pan()
      .enabled(enablePanDownToClose)
      .activeOffsetY(10) // Only activate when dragging down at least 10px
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate((event) => {
        // Allow dragging down when scroll is at top
        // event.translationY > 0 means dragging down (moving translateY towards 0)
        if (scrollY.value <= 0 && event.translationY > 0) {
          // When dragging down, translateY increases (from negative towards 0)
          const newTranslateY = context.value.y + event.translationY;
          // Clamp between openTranslateY (negative, e.g., -400) and 0 (off-screen)
          // openTranslateY < newTranslateY < 0
          translateY.value = Math.max(
            Math.min(newTranslateY, 0), // Can't go above 0
            openTranslateY // Can't go below openTranslateY (more negative)
          );
        }
      })
      .onEnd((event) => {
        // Only process end gesture if scroll was at top and we were dragging down
        if (scrollY.value <= 0 && event.translationY > 0) {
          const dragThreshold = SCREEN_HEIGHT * 0.12; // 12% of screen height threshold
          const shouldClose = event.translationY > dragThreshold;

          if (shouldClose) {
            // Close the sheet - animate to bottom (off-screen, translateY = 0)
            translateY.value = withSpring(0, {
              damping: 50,
              stiffness: 300,
            });
            backdropOpacityValue.value = withTiming(0, {
              duration: 300,
            });
            runOnJS(closeSheet)();
          } else {
            // Snap back to open position
            translateY.value = withSpring(openTranslateY, {
              damping: 50,
              stiffness: 300,
            });
          }
        } else if (scrollY.value <= 0 && event.translationY < 0) {
          // If dragged up slightly, snap back to open position
          translateY.value = withSpring(openTranslateY, {
            damping: 50,
            stiffness: 300,
          });
        }
      });

    const rBottomSheetStyle = useAnimatedStyle(() => {
      // translateY: SCREEN_HEIGHT = off-screen (below), openTranslateY = visible
      // Use transform to slide up/down
      return {
        transform: [{ translateY: translateY.value }],
      };
    });

    const rBackdropStyle = useAnimatedStyle(() => {
      return {
        opacity: backdropOpacityValue.value,
      };
    });

    const rHandleStyle = useAnimatedStyle(() => {
      // Handle opacity based on how close to open position
      const opacity =
        translateY.value <
        openTranslateY + (SCREEN_HEIGHT - openTranslateY) * 0.1
          ? 1
          : 0.5;
      return {
        opacity: withTiming(opacity, { duration: 200 }),
      };
    });

    // Don't render Modal if not visible (after close animation completes)
    if (!isVisible && !isOpen) return null;

    return (
      <Modal
        visible={isVisible || isOpen}
        transparent
        animationType="none"
        onRequestClose={closeSheet}
        statusBarTranslucent
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          {/* Backdrop */}
          <Animated.View
            style={[
              {
                ...StyleSheet.absoluteFillObject,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1,
              },
              rBackdropStyle,
            ]}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={closeSheet}
            />
          </Animated.View>

          {/* Bottom Sheet */}
          <GestureDetector gesture={panGesture}>
            <Animated.View
              ref={ref}
              style={[
                {
                  position: "absolute",
                  top: SCREEN_HEIGHT, // Start from below screen
                  left: 0,
                  right: 0,
                  height: visibleHeight,
                  backgroundColor: "#ffffff",
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: -4,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: 10,
                  zIndex: 2,
                },
                rBottomSheetStyle,
                style,
              ]}
              {...props}
            >
              {/* Handle Bar */}
              <View
                style={{
                  paddingTop: 12,
                  paddingBottom: 8,
                  alignItems: "center",
                }}
              >
                <Animated.View
                  style={[
                    {
                      width: 40,
                      height: 4,
                      backgroundColor: "#d1d5db",
                      borderRadius: 2,
                    },
                    rHandleStyle,
                  ]}
                />
              </View>

              {/* Scrollable Content */}
              <Animated.ScrollView
                ref={scrollViewRef}
                style={{ flex: 1 }}
                contentContainerStyle={[{ padding: 20 }, contentContainerStyle]}
                showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                bounces={true}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                refreshControl={refreshControl}
                stickyHeaderIndices={stickyHeaderIndices}
              >
                {children}
              </Animated.ScrollView>
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      </Modal>
    );
  }
);

BottomSheetContent.displayName = "BottomSheetContent";

const BottomSheetHeader = React.forwardRef<View, BottomSheetHeaderProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          flexDirection: "column",
          gap: 8,
          marginBottom: 16,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
);

BottomSheetHeader.displayName = "BottomSheetHeader";

const BottomSheetFooter = React.forwardRef<View, BottomSheetFooterProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          flexDirection: "column",
          gap: 8,
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
);

BottomSheetFooter.displayName = "BottomSheetFooter";

const BottomSheetTitle = React.forwardRef<Text, BottomSheetTitleProps>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[
        {
          fontSize: 20,
          fontWeight: "600",
          color: "#111827",
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  )
);

BottomSheetTitle.displayName = "BottomSheetTitle";

const BottomSheetDescription = React.forwardRef<
  Text,
  BottomSheetDescriptionProps
>(({ children, style, ...props }, ref) => (
  <Text
    ref={ref}
    style={[
      {
        fontSize: 14,
        color: "#6b7280",
        lineHeight: 20,
      },
      style,
    ]}
    {...props}
  >
    {children}
  </Text>
));

BottomSheetDescription.displayName = "BottomSheetDescription";

const BottomSheetClose = React.forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  BottomSheetCloseProps & { onOpenChange?: (open: boolean) => void }
>(({ children, onOpenChange, style, ...props }, ref) => (
  <TouchableOpacity
    ref={ref}
    onPress={() => onOpenChange?.(false)}
    activeOpacity={0.8}
    style={[
      {
        padding: 8,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
      },
      style,
    ]}
    {...props}
  >
    {children}
  </TouchableOpacity>
));

BottomSheetClose.displayName = "BottomSheetClose";

export {
  BottomSheet,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger
};
export type {
  BottomSheetCloseProps,
  BottomSheetContentProps,
  BottomSheetDescriptionProps,
  BottomSheetFooterProps,
  BottomSheetHeaderProps,
  BottomSheetProps,
  BottomSheetTitleProps,
  BottomSheetTriggerProps
};

