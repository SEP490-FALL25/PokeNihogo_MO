import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Linking } from 'react-native';

interface OpenBrowserOptions {
    onClose?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Utility function to open URL in In-App Browser using Expo WebBrowser
 * @param url - The URL to open
 * @param options - Callback options
 */
export async function openInAppBrowser(url: string, options?: OpenBrowserOptions) {
    const { onClose, onError } = options || {};

    try {
        // Use Expo WebBrowser for in-app browser experience
        const result = await WebBrowser.openBrowserAsync(url, {
            // iOS options
            dismissButtonStyle: 'cancel',
            readerMode: false,
            // Android options
            showTitle: true,
            secondaryToolbarColor: '#000000',
            enableBarCollapsing: false,
            // Show in-app browser (not external)
            showInRecents: false,
        });

        // Handle browser close
        if (result.type === 'cancel' || result.type === 'dismiss') {
            onClose?.();
        }
    } catch (error) {
        // Try fallback to system browser on error
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
                onClose?.();
            } else {
                onError?.(error as Error);
            }
        } catch (fallbackError) {
            onError?.(error as Error);
        }
    }
}

/**
 * Component wrapper for backward compatibility
 */
interface InAppBrowserProps {
    url: string;
    onClose?: () => void;
    onError?: (error: Error) => void;
}

export default function InAppBrowserComponent({ url, onClose, onError }: InAppBrowserProps) {
    React.useEffect(() => {
        openInAppBrowser(url, { onClose, onError });
    }, [url, onClose, onError]);

    return null;
}

