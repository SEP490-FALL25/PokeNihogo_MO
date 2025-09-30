import { cva, VariantProps } from "class-variance-authority";
import * as Haptics from "expo-haptics";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const bounceButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gray-100",
        destructive: "bg-destructive",
        outline: "border border-input bg-background",
        secondary: "bg-secondary",
        ghost: "bg-transparent border border-green-600",
        link: "text-primary underline",
        translucent: "bg-white/20 border border-white/50",
        solid: "bg-secondary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        full: "h-12 w-full px-4 py-2",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const textVariants = cva("text-center font-bold", {
  variants: {
    variant: {
      default: "text-green-700",
      destructive: "text-white",
      outline: "text-gray-700",
      secondary: "text-white",
      ghost: "text-gray-50",
      link: "text-primary",
      translucent: "text-white [text-shadow:0px_1px_2px_rgba(0,0,0,0.25)]",
      solid: "text-white [text-shadow:0px_1px_1px_rgba(0,0,0,0.3)]",
    },
    size: {
      default: "text-lg",
      sm: "text-sm",
      lg: "text-lg",
      full: "text-lg",
      icon: "text-md",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const shadowVariants = cva("absolute top-1.5 left-0 right-0 h-16 rounded-xl", {
  variants: {
    variant: {
      default: "bg-green-600",
      destructive: "bg-red-800",
      outline: "border-2 border-gray-300",
      secondary: "bg-gray-500",
      ghost: "bg-transparent border-b-8 border-green-600",
      link: "bg-transparent",
      translucent: "bg-black/10",
      solid: "bg-secondary-dark",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});


interface BounceButtonProps extends VariantProps<typeof bounceButtonVariants> {
  children?: React.ReactNode;
  onPress?: () => void;
  withHaptics?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function BounceButton({
  children,
  onPress,
  variant,
  size,
  withHaptics = false,
  loading = false,
  disabled = false,
  className,
}: BounceButtonProps) {
  const isDisabled = disabled || loading;
  const translateY = useSharedValue(0);
  const shadowOpacity = useSharedValue(1);

  const handlePressIn = () => {
    if (isDisabled) return;
    translateY.value = withTiming(6, { duration: 100 });
    shadowOpacity.value = withTiming(0, { duration: 100 });
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    translateY.value = withTiming(0, { duration: 150 });
    shadowOpacity.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    if (isDisabled) return;
    if (withHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    }
    onPress?.();
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedShadowStyle = useAnimatedStyle(() => {
    return {
      opacity: shadowOpacity.value,
    };
  });

  return (
    <View
      className="relative self-center w-full"
      style={{ opacity: isDisabled ? 0.5 : 1 }}
    >
      {!disabled ? (
        <Animated.View
          className={`${shadowVariants({ variant })}`}
          style={animatedShadowStyle}
        />
      ) : <></>}

      <Animated.View
        className={`${bounceButtonVariants({ variant, size, className })} h-16`}
        style={animatedButtonStyle}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          disabled={isDisabled}
          accessibilityState={{ disabled: isDisabled, busy: loading }}
          className="w-full h-full justify-center items-center"
        >
          {loading ? (
            <LoadingContent variant={variant} size={size} />
          ) : (
            <Text className={textVariants({ variant, size })}>{children}</Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

function getSpinnerColor(
  variant?: VariantProps<typeof bounceButtonVariants>["variant"]
) {
  switch (variant) {
    case "destructive":
    case "secondary":
    case "translucent":
    case "solid":
      return "#ffffff";
    case "default":
    case "outline":
    case "ghost":
    case "link":
    default:
      return "#374151";
  }
}

function LoadingContent({
  children,
  variant,
  size,
}: {
  children?: React.ReactNode;
  variant?: VariantProps<typeof bounceButtonVariants>["variant"];
  size?: VariantProps<typeof bounceButtonVariants>["size"];
}) {
  const spinnerColor = getSpinnerColor(variant);
  return (
    <View className="flex-row items-center">
      <ActivityIndicator color={spinnerColor} />
      {children ? (
        <Text className={`${textVariants({ variant, size })} opacity-80 ml-2`}>
          {children}
        </Text>
      ) : null}
    </View>
  );
}