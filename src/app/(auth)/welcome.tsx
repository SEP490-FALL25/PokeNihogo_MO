import BounceButton from '@components/ui/BounceButton';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WelcomeScreen = () => {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={['#79B4C4', '#85C3C3', '#9BC7B9']}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView className='flex-1'>
        <View className='flex-1 justify-between px-8 py-10'>
          <View className='flex-1 justify-center items-center'>
            <Image source={require('../../../assets/images/PokeNihongoLogo.png')} className='w-72 h-44 object-contain mb-4' />
            <Text className='text-white text-xl font-bold'>
              {t('common.learn')} - {t('common.learn-again')} - {t('common.learn-forever')}!
            </Text>
          </View>

          <View className='gap-5'>
            <BounceButton>{t('common.start')}</BounceButton>
            <BounceButton variant={'ghost'}>{t('common.i-already-have-an-account')}</BounceButton>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: 'red',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default WelcomeScreen;