import { useEffect } from 'react';
import { Linking } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';

interface InAppBrowserProps {
    url: string;
    onClose?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Component to open URL in In-App Browser
 * @param url - The URL to open
 * @param onClose - Callback when browser is closed
 * @param onError - Callback when error occurs
 */
export default function InAppBrowserComponent({ url, onClose, onError }: InAppBrowserProps) {
    useEffect(() => {
        let isMounted = true;

        const openBrowser = async () => {
            try {
                if (await InAppBrowser.isAvailable()) {
                    const result = await InAppBrowser.open(url, {
                        // iOS options
                        dismissButtonStyle: 'cancel',
                        preferredBarTintColor: '#453AA4',
                        preferredControlTintColor: 'white',
                        readerMode: false,
                        animated: true,
                        modalPresentationStyle: 'fullScreen',
                        modalTransitionStyle: 'coverVertical',
                        modalEnabled: true,
                        enableBarCollapsing: false,
                        // Android options
                        showTitle: true,
                        toolbarColor: '#6200EE',
                        secondaryToolbarColor: '#000000',
                        navigationBarColor: '#000000',
                        navigationBarDividerColor: 'white',
                        enableUrlBarHiding: true,
                        enableDefaultShare: true,
                        forceCloseOnRedirection: false,
                        // Specify animations
                        animations: {
                            startEnter: 'slide_in_right',
                            startExit: 'slide_out_left',
                            endEnter: 'slide_in_left',
                            endExit: 'slide_out_right',
                        },
                        headers: {
                            'my-custom-header': 'my custom header value',
                        },
                    });

                    if (isMounted && result.type === 'cancel') {
                        onClose?.();
                    }
                } else {
                    // Fallback to system browser if InAppBrowser is not available
                    const canOpen = await Linking.canOpenURL(url);
                    if (canOpen) {
                        await Linking.openURL(url);
                    } else {
                        throw new Error('Cannot open URL');
                    }
                }
            } catch (error) {
                if (isMounted) {
                    onError?.(error as Error);
                }
            }
        };

        openBrowser();

        return () => {
            isMounted = false;
        };
    }, [url, onClose, onError]);

    // This component doesn't render anything
    return null;
}

