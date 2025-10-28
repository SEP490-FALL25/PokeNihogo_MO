import { cssInterop } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";

cssInterop(LinearGradient, { className: 'style' });
export const TWLinearGradient = LinearGradient as unknown as React.ComponentType<React.ComponentProps<typeof LinearGradient> & { className?: string }>;
