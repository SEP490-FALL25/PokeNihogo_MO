import React, { createContext, useContext, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// --- Định nghĩa Context ---
// Context sẽ giúp truyền state từ RadioGroup xuống các Item con
interface RadioGroupContextProps {
  value: string;
  onValueChange: (newValue: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextProps | null>(null);

// --- Component RadioGroup (Provider) ---
interface RadioGroupProps extends ViewProps {
  value?: string; // Dành cho controlled component
  defaultValue?: string; // Dành cho uncontrolled component
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const RadioGroup = ({
  value,
  defaultValue,
  onValueChange,
  children,
  style,
  ...props
}: RadioGroupProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue || "");

  // Ưu tiên `value` prop nếu được cung cấp (controlled), nếu không thì dùng state nội bộ (uncontrolled)
  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue: string) => {
    // Nếu là uncontrolled component, tự cập nhật state
    if (value === undefined) {
      setInternalValue(newValue);
    }
    // Luôn gọi callback ra bên ngoài
    onValueChange?.(newValue);
  };

  return (
    <RadioGroupContext.Provider
      value={{ value: currentValue, onValueChange: handleValueChange }}
    >
      <View
        style={[{ gap: 12 }, style]}
        {...props}
        accessibilityRole="radiogroup"
      >
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
};

// --- Component RadioGroupItem (Consumer) ---
interface RadioGroupItemProps extends ViewProps {
  value: string;
  disabled?: boolean;
  children?: React.ReactNode; // Cho phép kẹp label vào trong
}

const RadioGroupItem = React.forwardRef<View, RadioGroupItemProps>(
  ({ value, disabled = false, style, children, ...props }, ref) => {
    const context = useContext(RadioGroupContext);

    // Báo lỗi nếu Item không nằm trong Group
    if (!context) {
      throw new Error("RadioGroupItem must be used within a RadioGroup");
    }

    const { value: currentValue, onValueChange } = context;
    const isSelected = currentValue === value;

    const handlePress = () => {
      if (!disabled) {
        onValueChange(value);
      }
    };

    return (
      <TouchableOpacity
        ref={ref}
        style={[styles.itemContainer, style]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="radio"
        accessibilityState={{ checked: isSelected, disabled }}
        {...props}
      >
        <View
          style={[
            styles.radioOuterCircle,
            isSelected && styles.radioOuterCircleSelected,
            disabled && styles.disabled,
          ]}
        >
          <RadioGroupIndicator isSelected={isSelected} />
        </View>
        {children}
      </TouchableOpacity>
    );
  }
);

// --- Component Indicator với Animation ---
const RadioGroupIndicator = ({ isSelected }: { isSelected: boolean }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      // Dùng withSpring để có hiệu ứng nảy nhẹ
      transform: [
        {
          scale: withSpring(isSelected ? 1 : 0, {
            damping: 15,
            stiffness: 200,
          }),
        },
      ],
      opacity: withTiming(isSelected ? 1 : 0, { duration: 150 }),
    };
  });

  return <Animated.View style={[styles.radioInnerCircle, animatedStyle]} />;
};

RadioGroupItem.displayName = "RadioGroupItem";

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioOuterCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterCircleSelected: {
    borderColor: "#3b82f6",
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3b82f6",
  },
  disabled: {
    opacity: 0.5,
  },
  labelText: {
    fontSize: 16,
    color: "#374151",
  },
});

export { RadioGroup, RadioGroupItem };
export type { RadioGroupItemProps, RadioGroupProps };

