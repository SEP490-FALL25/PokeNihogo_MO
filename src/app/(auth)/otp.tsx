import AuthScreenLayout from '@components/layouts/AuthScreenLayout';
import BackScreen from '@components/molecules/Back';
import BounceButton from '@components/ui/BounceButton';
import { AuthType } from '@constants/auth.enum';
import { useMinimalAlert } from '@hooks/useMinimalAlert';
import { ROUTES } from '@routes/routes';
import authService from '@services/auth';
import { useEmailSelector } from '@stores/user/user.selectors';
import { saveSecureStorage } from '@utils/secure-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function OTPScreen() {
    /**
     * Define variables
     */
    const { t } = useTranslation();
    const { showAlert } = useMinimalAlert();
    const email = useEmailSelector();
    const { type } = useLocalSearchParams<{ type: string }>();
    //-----------------------End-----------------------//

    const [timer, setTimer] = useState<number>(60);

    /**
     * Handle timer
     */
    useEffect(() => {
        if (timer === 0) return;
        const interval = setInterval(() => {
            setTimer(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);
    //-----------------------End-----------------------//

    /**
     * Handle verify OTP
     * Handle resend OTP
     */
    const [code, setCode] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleVerify = async () => {
        if (code.length !== 6) return;

        setIsSubmitting(true);
        try {
            const res = await authService.verifyOtp({ email, code, type });

            if (res.data.statusCode === 201 && type === AuthType.REGISTER) {
                showAlert(res.data.message, 'success');
                router.replace(ROUTES.AUTH.CREATE_ACCOUNT);
            } else if (res.data.statusCode === 201 && type === AuthType.LOGIN) {
                showAlert(res.data.message, 'success');
                router.replace(ROUTES.AUTH.PASSWORD);
            } else if (res.data.statusCode === 200 && type === AuthType.FORGOT_PASSWORD) {
                showAlert(res.data.message, 'success');
                saveSecureStorage('accessToken', res.data.data.accessToken);
                router.replace(ROUTES.AUTH.RESET_PASSWORD);
            }
        } catch (error: any) {
            showAlert(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        try {
            const res = await authService.resendOtp(email);

            if (res.data.statusCode === 201) {
                showAlert(res.data.data.message, 'success');
                setTimer(60);
            }
        } catch (error: any) {
            showAlert(error.message, 'error');
            setTimer(60);
        }
    };
    //-----------------------End-----------------------//

    return (
        <AuthScreenLayout>
            <View className="flex-1">
                <BackScreen title={t('auth.enter-code')} />

                <View className="flex-1 px-5 pt-16">
                    <View className="absolute inset-0 justify-center items-center -z-10">
                        <Image source={require('../../../assets/images/PokeNihongoLogo.png')} className='w-80 h-52 object-contain opacity-20' />
                    </View>

                    <Text className="text-3xl font-bold text-white mb-2">{t('auth.enter-code')}</Text>
                    <Text className="text-base text-white/80 mb-12">
                        {t('auth.we-sent-a-6-digit-code-to')} {'\n'}
                        <Text className="font-bold">{email}</Text>
                    </Text>

                    {/* Ô nhập OTP */}
                    <TextInput
                        value={code}
                        onChangeText={setCode}
                        className="text-white text-4xl text-center font-bold tracking-[16px]"
                        maxLength={6}
                        keyboardType="number-pad"
                        autoFocus={true}
                    />
                    {/* Đường gạch chân giả */}
                    <View className="w-full h-px bg-white/30 mt-2" />

                    <View className="flex-row justify-center mt-6">
                        <Text className="text-base text-white/80">{t('auth.didnt-receive-a-code')} </Text>
                        <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
                            <Text className={`text-base font-bold ${timer > 0 ? 'text-white/50' : 'text-white'}`}>
                                {t('auth.resend')} {timer > 0 ? `(${timer}s)` : ''}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-auto pb-5">
                        <BounceButton
                            variant="solid"
                            loading={isSubmitting}
                            // Nút bị vô hiệu hóa khi chưa nhập đủ 6 số
                            disabled={code.length !== 6 || isSubmitting}
                            onPress={handleVerify}
                        >
                            <Text className="text-white font-bold text-lg">{t('auth.verify')}</Text>
                        </BounceButton>
                    </View>
                </View>
            </View>
        </AuthScreenLayout>
    );
}