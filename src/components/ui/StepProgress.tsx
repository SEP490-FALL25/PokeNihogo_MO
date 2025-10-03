import React from "react";
import { View, ViewProps } from "react-native";

interface StepProgressProps extends ViewProps {
  currentStep: number;
  totalSteps: number;
  stepHeight?: number;
  stepWidth?: number;
  gap?: number;
  activeColor?: string;
  inactiveColor?: string;
  completedColor?: string;
}

const StepProgress = React.forwardRef<View, StepProgressProps>(
  (
    {
      currentStep = 1,
      totalSteps = 3,
      stepHeight = 8,
      stepWidth = 40,
      gap = 8,
      activeColor = "#3b82f6",
      inactiveColor = "#d1d5db",
      completedColor = "#10b981",
      style,
      ...props
    },
    ref
  ) => {
    const renderStep = (stepIndex: number) => {
      const stepNumber = stepIndex + 1;
      let stepColor = inactiveColor;

      if (stepNumber < currentStep) {
        stepColor = completedColor; // Đã hoàn thành
      } else if (stepNumber === currentStep) {
        stepColor = activeColor; // Đang thực hiện
      }

      return (
        <View
          key={stepIndex}
          style={{
            width: stepWidth,
            height: stepHeight,
            backgroundColor: stepColor,
            borderRadius: stepHeight / 2,
          }}
        />
      );
    };

    return (
      <View
        ref={ref}
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: gap,
          },
          style,
        ]}
        {...props}
      >
        {Array.from({ length: totalSteps }, (_, index) => renderStep(index))}
      </View>
    );
  }
);

StepProgress.displayName = "StepProgress";

export { StepProgress };
export type { StepProgressProps };

