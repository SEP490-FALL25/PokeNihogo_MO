import { useCallback, useMemo, useState } from "react";
import MinimalGameAlert, {
  AlertType,
} from "@components/atoms/MinimalAlert";

interface AlertConfig {
  visible: boolean;
  message: string;
  type: AlertType;
}

export const useMinimalAlert = () => {
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

  const AlertElement = useMemo(
    () => (
      <MinimalGameAlert
        visible={alertConfig.visible}
        message={alertConfig.message}
        type={alertConfig.type}
        onHide={hideAlert}
      />
    ),
    [alertConfig.message, alertConfig.type, alertConfig.visible, hideAlert]
  );

  return {
    showAlert,
    hideAlert,
    AlertElement,
    alertConfig,
  };
};

export default useMinimalAlert;

