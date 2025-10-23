import { Audio } from 'expo-av';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

export const useMicrophonePermission = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Request permission for audio recording
      const { status } = await Audio.requestPermissionsAsync();
      
      if (status === 'granted') {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        showPermissionDeniedAlert();
      }
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    requestMicrophonePermission();
  }, [requestMicrophonePermission]);

  const showPermissionDeniedAlert = () => {
    Alert.alert(
      'Quyền truy cập microphone bị từ chối',
      'Để sử dụng tính năng luyện tập phát âm, vui lòng cấp quyền truy cập microphone trong cài đặt ứng dụng.',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Mở cài đặt',
          onPress: () => {
            // On iOS, this will open the app settings
            if (Platform.OS === 'ios') {
              // You can use Linking.openSettings() if needed
              console.log('Open iOS settings');
            }
          },
        },
      ]
    );
  };

  const checkPermission = async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      setHasPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      return false;
    }
  };

  return {
    hasPermission,
    isLoading,
    requestMicrophonePermission,
    checkPermission,
  };
};
