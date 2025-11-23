import AuthScreenLayout from '@components/layouts/AuthScreenLayout';
import BackScreen from '@components/molecules/Back';
import BounceButton from '@components/ui/BounceButton';
import { Input } from '@components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMinimalAlert } from '@hooks/useMinimalAlert';
import { IResetPasswordFormDataRequest, ResetPasswordFormDataRequest } from '@models/user/user.request';
import { ROUTES } from '@routes/routes';
import authService from '@services/auth';
import { useEmailSelector } from '@stores/user/user.selectors';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { z } from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';

export default function ResetPasswordScreen() {
    /**
     * Define variables
     */
    const { t } = useTranslation();
    const { showAlert } = useMinimalAlert();
    const email = useEmailSelector();
    z.setErrorMap(makeZodI18nMap({ t }));
    //-----------------------End-----------------------//


    /**
     * Handle form validation
     * Handle reset password
     */
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<IResetPasswordFormDataRequest>({
        resolver: zodResolver(ResetPasswordFormDataRequest),
        defaultValues: {
            email: email,
            newPassword: '',
            confirmNewPassword: ''
        },
        mode: 'onChange',
    });

    const handleResetPassword = async (data: IResetPasswordFormDataRequest) => {
        try {
            const res = await authService.resetPassword(data);

            if (res.data.statusCode === 201) {
                showAlert(res.data.message, 'success');
                router.replace(ROUTES.AUTH.PASSWORD);
            }
        } catch (error: any) {
            showAlert(error.message, 'error');
        }
    };
    //-----------------------End-----------------------//

    return (
        <AuthScreenLayout>
            <View className="flex-1">
                <View className="flex-1">
                    <BackScreen title={t('auth.reset-your-password')} />

                    <ScrollView
                        className="flex-1 px-5"
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="flex-1 pt-16">
                            <Text className="text-3xl font-bold text-white mb-4">{t('auth.enter-new-password')}</Text>
                            <Text className="text-base text-white/80 mb-8">{t('auth.new-password-description')}</Text>

                            <View className="gap-5">
                                {/* New Password Input */}
                                <View className="gap-2">
                                    <Text className="text-base font-medium text-white">{t('auth.new-password')}</Text>
                                    <Controller
                                        control={control}
                                        name="newPassword"
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <Input
                                                value={value}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                placeholder={t('auth.enter-your-password')}
                                                isPassword={true}
                                                error={errors.newPassword?.message}
                                            />
                                        )}
                                    />
                                </View>

                                {/* Confirm New Password Input */}
                                <View className="gap-2">
                                    <Text className="text-base font-medium text-white">{t('auth.confirm-new-password')}</Text>
                                    <View>
                                        <Controller
                                            control={control}
                                            name="confirmNewPassword"
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <Input
                                                    value={value}
                                                    onBlur={onBlur}
                                                    onChangeText={onChange}
                                                    placeholder={t('auth.enter-your-password')}
                                                    isPassword={true}
                                                    error={errors.confirmNewPassword?.message}
                                                />
                                            )}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View className="mt-auto pb-5">
                                <BounceButton
                                    variant="solid"
                                    loading={isSubmitting}
                                    disabled={!isValid || isSubmitting}
                                    onPress={handleSubmit(handleResetPassword)}
                                >
                                    <Text className="text-white font-bold text-lg">{t('auth.save-password')}</Text>
                                </BounceButton>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </AuthScreenLayout>
    );
}