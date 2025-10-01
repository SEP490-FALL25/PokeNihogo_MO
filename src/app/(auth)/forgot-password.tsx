import AuthScreenLayout from '@components/layouts/AuthScreenLayout';
import BackScreen from '@components/mocules/Back';
import BounceButton from '@components/ui/BounceButton';
import { Input } from '@components/ui/Input';
import { useToast } from '@components/ui/Toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailFormDataRequest, IEmailFormDataRequest } from '@models/user/user.request';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { z } from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';

export default function ForgotPasswordScreen() {
    const { t } = useTranslation();
    const { toast } = useToast();
    z.setErrorMap(makeZodI18nMap({ t }));

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<IEmailFormDataRequest>({
        resolver: zodResolver(EmailFormDataRequest),
        defaultValues: { email: '' },
        mode: 'onChange',
    });

    const handleSendInstructions = (data: IEmailFormDataRequest) => {
        return new Promise((resolve) => {
            console.log("Sending password reset instructions to:", data.email);
            // Ở đây bạn sẽ gọi API để yêu cầu reset mật khẩu
            setTimeout(() => {
                toast({
                    title: "Check your email",
                    description: `We've sent password reset instructions to ${data.email}.`
                });
                resolve(true);
            }, 2000);
        });
    };

    return (
        <AuthScreenLayout>
            <View className="flex-1">
                <View className="flex-1">
                    <BackScreen />

                    <View className="flex-1 px-5 pt-16">
                        <Text className="text-3xl font-bold text-white mb-4">{t('auth.reset-your-password')}</Text>
                        <Text className="text-base text-white/80 mb-8">{t('auth.reset-password-description')}</Text>

                        <Text className="text-base font-medium text-white mb-2">{t('auth.email')}</Text>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    placeholder={t('auth.enter-your-email')}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    error={errors.email?.message}
                                    autoFocus={true}
                                    onSubmitEditing={handleSubmit(handleSendInstructions)}
                                />
                            )}
                        />

                        <View className="mt-auto pb-5">
                            <BounceButton
                                variant="solid"
                                loading={isSubmitting}
                                disabled={!isValid || isSubmitting}
                                onPress={handleSubmit(handleSendInstructions)}
                            >
                                <Text className="text-white font-bold text-lg">{t('auth.send-instructions')}</Text>
                            </BounceButton>
                        </View>
                    </View>
                </View>
            </View>
        </AuthScreenLayout>
    );
}