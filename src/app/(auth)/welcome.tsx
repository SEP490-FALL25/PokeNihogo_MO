import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WelcomeScreen = () => {


  return (
    <LinearGradient
      colors={['#58CC02', '#89E219']}
      className='flex-1'
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView className='flex-1'>
        <View className='flex-1 justify-between px-8 py-10'>
          <View className='flex-1 justify-center items-center'>
            <Text className='text-8xl mb-4'>🦉</Text>
            <Text className='text-white text-4xl font-bold'>Duolingo</Text>
            <Text className='text-white text-lg font-bold'>
              The free, fun, and effective way to learn a language!
            </Text>
          </View>

          <View className='gap-4'>
            <TouchableOpacity
              className='bg-white p-4 rounded-lg items-center'
            // onPress={() => router.push('/(auth)/language-selection')}
            >
              <Text className='text-green-500 text-lg font-bold'>GET STARTED</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className='bg-transparent p-4 rounded-lg items-center border border-white'
            // onPress={() => router.push('/(auth)/login')}
            >
              <Text className='text-white text-lg font-bold'>I ALREADY HAVE AN ACCOUNT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

export default WelcomeScreen;