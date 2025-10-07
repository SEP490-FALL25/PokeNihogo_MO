import React, { useEffect, useRef } from 'react';
import { Animated, Image, View } from 'react-native';

interface SplashScreenProps {
    from?: 'index' | 'layout';
}

const SplashScreen = ({ from = 'index' }: SplashScreenProps) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    return (
        <View className='flex-1 justify-center items-center bg-white'>
            <Animated.View style={{ opacity: fadeAnim }}>
                <Image
                    source={from === 'index' ? require('../../assets/images/PokeNihongoLogo.png') : require('../../assets/images/PokeNihongoLogo.png')}
                    className='w-64 h-36 object-contain'
                />
            </Animated.View>
        </View>
    );
};

export default SplashScreen;