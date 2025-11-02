import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

/**
 * Configuration for a button in the ConfirmModal
 */
export interface ConfirmModalButton {
  /** The text label displayed on the button */
  label: string;
  /** Callback function when button is pressed */
  onPress: () => void;
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Text to show when button is disabled (usually a loading state) */
  loadingText?: string;
}

/**
 * Props for the ConfirmModal component
 */
export interface ConfirmModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** The modal title text */
  title: string;
  /** Optional message text below the title */
  message?: string;
  /** Array of buttons to display (defaults to Cancel/Confirm if not provided) */
  buttons?: ConfirmModalButton[];
  /** Callback when user requests to close the modal */
  onRequestClose?: () => void;
  /** Opacity of the overlay background (0-1) */
  overlayOpacity?: number;
  /** Additional styles for the content container */
  contentStyle?: ViewStyle;
  /** Additional styles for the title text */
  titleStyle?: TextStyle;
  /** Additional styles for the message text */
  messageStyle?: TextStyle;
  /** Animation type for modal appearance */
  animationType?: 'fade' | 'slide' | 'none';
}

/**
 * A reusable confirmation modal component with customizable buttons and styling.
 * 
 * @example
 * ```tsx
 * <ConfirmModal
 *   visible={showModal}
 *   title="Delete item?"
 *   message="This action cannot be undone."
 *   buttons={[
 *     { label: "Cancel", onPress: () => setShowModal(false), variant: "secondary" },
 *     { label: "Delete", onPress: handleDelete, variant: "danger" }
 *   ]}
 *   onRequestClose={() => setShowModal(false)}
 * />
 * ```
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  buttons = [],
  onRequestClose,
  overlayOpacity = 0.5,
  contentStyle,
  titleStyle,
  messageStyle,
  animationType = 'fade',
}) => {
  const defaultButtons: ConfirmModalButton[] = buttons.length
    ? buttons
    : [
        {
          label: 'Hủy',
          onPress: onRequestClose || (() => {}),
          variant: 'secondary',
        },
        {
          label: 'Xác nhận',
          onPress: onRequestClose || (() => {}),
          variant: 'primary',
        },
      ];

  const getButtonStyle = (
    variant: ConfirmModalButton['variant'] = 'primary'
  ): ViewStyle[] => {
    switch (variant) {
      case 'danger':
        return [styles.button, styles.buttonDanger];
      case 'secondary':
        return [styles.button, styles.buttonSecondary];
      default:
        return [styles.button, styles.buttonPrimary];
    }
  };

  const getButtonTextStyle = (
    variant: ConfirmModalButton['variant'] = 'primary'
  ): TextStyle[] => {
    switch (variant) {
      case 'danger':
        return [styles.buttonText, styles.buttonDangerText];
      case 'secondary':
        return [styles.buttonText, styles.buttonSecondaryText];
      default:
        return [styles.buttonText, styles.buttonPrimaryText];
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onRequestClose}
    >
      <View style={[styles.overlay, { backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }]}>
        <View style={[styles.content, contentStyle]}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          
          {message && (
            <Text style={[styles.message, messageStyle]}>{message}</Text>
          )}

          <View style={styles.buttons}>
            {defaultButtons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  ...getButtonStyle(button.variant),
                  button.disabled && styles.buttonDisabled,
                ]}
                onPress={button.onPress}
                activeOpacity={0.8}
                disabled={button.disabled}
              >
                <Text style={getButtonTextStyle(button.variant)}>
                  {button.disabled && button.loadingText
                    ? button.loadingText
                    : button.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#0ea5e9',
  },
  buttonSecondary: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPrimaryText: {
    color: '#ffffff',
  },
  buttonSecondaryText: {
    color: '#374151',
  },
  buttonDangerText: {
    color: '#ffffff',
  },
});
