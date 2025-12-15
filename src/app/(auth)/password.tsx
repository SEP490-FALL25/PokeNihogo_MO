import AuthScreenLayout from '@components/layouts/AuthScreenLayout';
import BounceButton from '@components/ui/BounceButton';
import { Input } from '@components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMinimalAlert } from '@hooks/useMinimalAlert';
import { IPasswordFormDataRequest, PasswordFormDataRequest } from '@models/user/user.request';
import { ROUTES } from '@routes/routes';
import authService from '@services/auth';
import { useAuthStore } from '@stores/auth/auth.config';
import { useEmailSelector } from '@stores/user/user.selectors';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { z } from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';

export default function PasswordScreen() {
    /**
     * Define variables
     */
    const { t } = useTranslation();
    const email = useEmailSelector();
    const { showAlert } = useMinimalAlert();
    const setAccessToken = useAuthStore((state) => state.setAccessToken);

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
                await setAccessToken(res.data.data.accessToken);
                // persist refresh token for future refresh
                try { await SecureStore.setItemAsync('refreshToken', res.data.data.refreshToken); } catch { }
                if (res.data.data.level !== null) {
                    router.replace(ROUTES.TABS.HOME);
                } else {
                    router.replace(ROUTES.STARTER.SELECT_LEVEL);
                }
            }
        } catch (error: any) {
            showAlert(error.message, 'error');
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
                showAlert(res.data.message, 'success');
                router.push({ pathname: ROUTES.AUTH.OTP, params: { type: res.data.data.type } });
            }
        } catch (error: any) {
            showAlert(error.message, 'error');
        }
    };
    //-----------------------End-----------------------//

    return (
        <AuthScreenLayout>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            </TouchableWithoutFeedback>
        </AuthScreenLayout>
    );
}