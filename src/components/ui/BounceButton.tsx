import { cva, VariantProps } from "class-variance-authority";
import React from "react";
import { Pressable, Text, View } from "react-native";
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
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface BounceButtonProps extends VariantProps<typeof bounceButtonVariants> {
  children: string;
  onPress?: () => void;
  className?: string;
}

export default function BounceButton({
  children,
  onPress,
  variant,
  size,
  className,
}: BounceButtonProps) {
  const translateY = useSharedValue(0);
  const shadowOpacity = useSharedValue(1);

  const handlePressIn = () => {
    translateY.value = withTiming(6, { duration: 100 });
    shadowOpacity.value = withTiming(0, { duration: 100 });
  };

  const handlePressOut = () => {
    translateY.value = withTiming(0, { duration: 150 });
    shadowOpacity.value = withTiming(1, { duration: 150 });
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
    <View className="relative self-center w-full">
      <Animated.View
        className={`${shadowVariants({ variant })}`}
        style={animatedShadowStyle}
      />
      <Animated.View
        className={`${bounceButtonVariants({ variant, size, className })} h-16`}
        style={animatedButtonStyle}
      >

        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          className="w-full h-full justify-center items-center"
        >
          <Text className={textVariants({ variant, size })}>
            {children}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}