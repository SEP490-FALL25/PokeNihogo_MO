import React, { useRef, useState } from "react";
import { View, ViewProps } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";

interface SliderProps extends ViewProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
}

const Slider = React.forwardRef<View, SliderProps>(
  (
    {
      value,
      defaultValue = [0],
      min = 0,
      max = 100,
      step = 1,
      onValueChange,
      disabled = false,
      style,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<number[]>(defaultValue);
    const currentValue = value ?? internalValue;
    const containerWidth = useRef(0);

    const handleGesture = (event: PanGestureHandlerGestureEvent) => {
      if (disabled) return;

      const { absoluteX } = event.nativeEvent;
      const progress = Math.max(
        0,
        Math.min(1, absoluteX / containerWidth.current)
      );
      const newValue = min + progress * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      const newValues = [clampedValue];

      if (value === undefined) {
        setInternalValue(newValues);
      }
      onValueChange?.(newValues);
    };

    const getProgress = (): number => {
      const val = currentValue[0] || min;
      return (val - min) / (max - min);
    };

    return (
      <View
        ref={ref}
        style={[
          {
            height: 20,
            justifyContent: "center",
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
        onLayout={(event) => {
          containerWidth.current = event.nativeEvent.layout.width;
        }}
        {...props}
      >
        {/* Track */}
        <View
          style={{
            height: 4,
            backgroundColor: "#e5e7eb",
            borderRadius: 2,
            position: "relative",
          }}
        >
          {/* Range */}
          <View
            style={{
              position: "absolute",
              height: 4,
              width: `${getProgress() * 100}%`,
              backgroundColor: "#3b82f6",
              borderRadius: 2,
            }}
          />

          {/* Thumb */}
          <PanGestureHandler onGestureEvent={handleGesture} enabled={!disabled}>
            <View
              style={{
                position: "absolute",
                left: `${getProgress() * 100}%`,
                marginLeft: -10,
                width: 20,
                height: 20,
                backgroundColor: "#ffffff",
                borderRadius: 10,
                borderWidth: 2,
                borderColor: "#3b82f6",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            />
          </PanGestureHandler>
        </View>
      </View>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
export type { SliderProps };

