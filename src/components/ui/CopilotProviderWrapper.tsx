import i18n from "@i18n/i18n";
import React from "react";
import { CopilotProvider } from "react-native-copilot";
import CustomCopilotTooltip from "./CustomCopilotTooltip";

interface CopilotProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component for CopilotProvider that provides i18n tooltip
 * This ensures tour buttons (Skip, Next, Finish) are translated
 */
export default function CopilotProviderWrapper({
  children,
}: CopilotProviderWrapperProps) {
  // Get current language from i18n to force re-render when language changes
  const currentLanguage = i18n.language || "en";

  return (
    <CopilotProvider
      tooltipComponent={CustomCopilotTooltip}
      // Force re-render when language changes
      key={currentLanguage}
    >
      {children}
    </CopilotProvider>
  );
}

