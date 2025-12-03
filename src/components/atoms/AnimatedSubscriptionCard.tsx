import { ROUTES } from '@routes/routes';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Crown } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AnimatedSubscriptionCard() {
  const { t } = useTranslation();
  const shimmerTranslateX = useSharedValue(-SCREEN_WIDTH);

  useEffect(() => {
    // Shimmer effect chạy từ trái qua phải
    shimmerTranslateX.value = withRepeat(
      withTiming(SCREEN_WIDTH, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1
    );
  }, []);

  const animatedShimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerTranslateX.value }],
    };
  });

  return (
    <View className="mb-6 relative" style={{ padding: 3 }}>
      {/* Outer Border Container */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 18,
          overflow: 'hidden',
        }}
      >
        {/* Static Border Background */}
        <LinearGradient
          colors={['#f59e0b', '#fbbf24', '#f59e0b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: '100%',
            height: '100%',
          }}
        />

        {/* Animated Shimmer Effect */}
        <Animated.View
          style={[
            animatedShimmerStyle,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              width: SCREEN_WIDTH,
              height: '100%',
            },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(255,255,255,0)',
              'rgba(255,255,255,0.4)',
              'rgba(255,255,255,0.8)',
              'rgba(255,255,255,0.4)',
              'rgba(255,255,255,0)'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </Animated.View>
      </View>

      {/* Card Content */}
      <TouchableOpacity
        onPress={() => router.push(ROUTES.APP.SUBSCRIPTION)}
        activeOpacity={0.8}
        className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 flex-row items-center justify-between shadow-lg"
        style={{
          backgroundColor: '#f59e0b',
          shadowColor: '#f59e0b',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
            <Crown size={24} color="white" strokeWidth={2.5} />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg mb-1">
              {t('subscription.title')}
            </Text>
            <Text className="text-white/90 text-sm">
              {t('subscription.subtitle')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

