import type { AlertType } from "@components/atoms/MinimalAlert";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AlertConfig {
  visible: boolean;
  message: string;
  type: AlertType;
}

interface MinimalAlertContextValue {
  alertConfig: AlertConfig;
  showAlert: (message: string, type?: AlertType) => void;
  hideAlert: () => void;
}

const MinimalAlertContext = createContext<MinimalAlertContextValue | null>(null);

export const MinimalAlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    message: "",
    type: "info",
  });

  const hideAlert = useCallback(() => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  const showAlert = useCallback(
    (message: string, type: AlertType = "info") => {
      setAlertConfig({
        visible: true,
        message,
        type,
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      alertConfig,
      showAlert,
      hideAlert,
    }),
    [alertConfig, showAlert, hideAlert]
  );

  return (
    <MinimalAlertContext.Provider value={value}>
      {children}
    </MinimalAlertContext.Provider>
  );
};

export const useMinimalAlert = () => {
  const context = useContext(MinimalAlertContext);

  if (!context) {
    throw new Error(
      "useMinimalAlert must be used within a MinimalAlertProvider"
    );
  }

  return {
    alertConfig: context.alertConfig,
    hideAlert: context.hideAlert,
    showAlert: context.showAlert,
  };
};

