import AuthScreenLayout from '@components/layouts/AuthScreenLayout';
import BounceButton from '@components/ui/BounceButton';
import { ROUTES } from '@routes/routes';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';

const WelcomeScreen = () => {
  const { t } = useTranslation();

  const handleLogin = () => {
    router.push(ROUTES.AUTH.EMAIL);
  }

  return (
    <AuthScreenLayout>
      <View className='flex-1 justify-between px-8 py-10'>
        <View className='flex-1 justify-center items-center'>
          <Image source={require('../../../assets/images/PokeNihongoLogo.png')} className='w-72 h-44 object-contain mb-4' />
          <Text className='text-white text-xl font-bold'>
            {t('common.learn')} - {t('common.learn-again')} - {t('common.learn-forever')}!
          </Text>
        </View>
        <View className='gap-5'>
          <BounceButton onPress={handleLogin}>{t('common.start')}</BounceButton>
        </View>
      </View>
    </AuthScreenLayout >
  )
}

export default WelcomeScreen;