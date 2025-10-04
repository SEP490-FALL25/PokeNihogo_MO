import AuthScreenLayout from '@components/layouts/AuthScreenLayout';
import BounceButton from '@components/ui/BounceButton';
import { Input } from '@components/ui/Input';
import { useToast } from '@components/ui/Toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { IPasswordFormDataRequest, PasswordFormDataRequest } from '@models/user/user.request';
import { ROUTES } from '@routes/routes';
import authService from '@services/auth';
import { useEmailSelector } from '@stores/user/user.selectors';
import { saveSecureStorage } from '@utils/secure-storage';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';

export default function PasswordScreen() {
    /**
     * Define variables
     */
    const { t } = useTranslation();
    const email = useEmailSelector();
    const { toast } = useToast();
    z.setErrorMap(makeZodI18nMap({ t }));
    //-----------------------End-----------------------//


    /**
     * Handle form validation
     * Handle login
     */
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<IPasswordFormDataRequest>({
        resolver: zodResolver(PasswordFormDataRequest),
        defaultValues: { email: email, password: '' },
        mode: 'onChange',
    });

    const handleLogin = async (data: IPasswordFormDataRequest) => {
        try {
            const res = await authService.login(data);

            if (res.data.statusCode === 200) {
                saveSecureStorage('accessToken', res.data.data.accessToken);
                saveSecureStorage('refreshToken', res.data.data.refreshToken);
                if (res.data.data.level !== null) {
                    router.replace(ROUTES.TABS.ROOT);
                }
                router.replace(ROUTES.AUTH.SELECT_LEVEL);
            }
        } catch (error: any) {
            toast({ variant: 'destructive', description: error.message });
        }
    };
    //-----------------------End-----------------------//


    /**
     * Handle forgot password
     */
    const handleForgotPassword = async () => {
        try {
            const res = await authService.forgotPassword({ email });

            console.log(res);

            if (res.data.statusCode === 200) {
                toast({ variant: 'Success', description: res.data.message });
                router.push({ pathname: ROUTES.AUTH.OTP, params: { type: res.data.data.type } });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', description: error.message });
        }
    };
    //-----------------------End-----------------------//

    return (
        <AuthScreenLayout>
            <View className="flex-1">
                <View className="flex-row items-center justify-between px-5 py-4">
                    <TouchableOpacity className="p-2" onPress={() => router.back()}>
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold text-white">{t('auth.log-in')}</Text>
                    <View className="w-10" />
                </View>

                <View className="flex-1 px-5 pt-16">

                    <Text className="text-3xl font-bold text-white mb-2">{t('auth.welcome-back')}</Text>
                    <Text className="text-base text-white/80 mb-8">{email}</Text>

                    <Text className="text-base font-medium text-white mb-2">{t('auth.password')}</Text>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                placeholder={t('auth.enter-your-password')}
                                isPassword={true}
                                autoCorrect={false}
                                error={errors.password?.message}
                                autoFocus={true}
                                onSubmitEditing={handleSubmit(handleLogin)}
                            />
                        )}
                    />
                    <View className="items-end mt-4">
                        <TouchableOpacity onPress={handleForgotPassword}>
                            <Text className="text-base font-semibold text-white">{t('auth.forgot-your-password')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-auto pb-5">
                        <BounceButton
                            variant="solid"
                            loading={isSubmitting}
                            disabled={!isValid || isSubmitting}
                            onPress={handleSubmit(handleLogin)}
                        >
                            <Text className="text-white font-bold text-lg">{t('auth.log-in')}</Text>
                        </BounceButton>
                    </View>
                </View>
            </View>
        </AuthScreenLayout>
    );
}