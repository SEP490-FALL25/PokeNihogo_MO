import AuthScreenLayout from '@components/layouts/AuthScreenLayout';
import BackScreen from '@components/mocules/Back';
import BounceButton from '@components/ui/BounceButton';
import { useToast } from '@components/ui/Toast';
import { ROUTES } from '@routes/routes';
import { useEmailSelector } from '@stores/user/user.selectors';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Giả lập hàm API
const verifyOtpApi = async (email: string, otp: string): Promise<boolean> => {
    console.log(`Verifying OTP ${otp} for email ${email}`);
    // Giả lập: OTP đúng là '123456'
    return new Promise(resolve => setTimeout(() => resolve(otp === '123456'), 1000));
};

const resendOtpApi = async (email: string) => {
    console.log(`Resending OTP for email ${email}`);
    return new Promise(resolve => setTimeout(resolve, 1000));
};


export default function OTPScreen() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const email = useEmailSelector(); // Lấy email từ Zustand store

    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timer, setTimer] = useState(60);

    // Effect để chạy đồng hồ đếm ngược
    useEffect(() => {
        if (timer === 0) return;
        const interval = setInterval(() => {
            setTimer(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async () => {
        if (otp.length !== 6) return;

        setIsSubmitting(true);
        try {
            const isSuccess = await verifyOtpApi(email, otp);
            if (isSuccess) {
                toast({ title: "Success", description: t('auth.logged-in-successfully') });
                router.replace(ROUTES.AUTH.CREATE_ACCOUNT);
            } else {
                toast({ variant: 'destructive', title: "Error", description: t('auth.invalid-otp-please-try-again') });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: t('auth.an-unexpected-error-occurred') });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        await resendOtpApi(email);
        setTimer(60); // Reset đồng hồ
        toast({ title: "Sent", description: t('auth.a-new-code-has-been-sent-to-your-email') });
    };

    return (
        <AuthScreenLayout>
            <View className="flex-1">
                <BackScreen />

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
                        value={otp}
                        onChangeText={setOtp}
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
                            disabled={otp.length !== 6 || isSubmitting}
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