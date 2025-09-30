import AuthScreenLayout from '@components/layouts/AuthScreenLayout';
import BounceButton from '@components/ui/BounceButton';
import { Input } from '@components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailFormDataRequest, IEmailFormDataRequest } from '@models/user/user.request';
import { useUserSetEmail } from '@stores/user/user.selectors';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import z from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';

export default function EmailScreen() {
    const { t } = useTranslation();
    const setEmail = useUserSetEmail();
    z.setErrorMap(makeZodI18nMap({ t }));


    const { control, handleSubmit, formState: { errors, isValid } } = useForm<IEmailFormDataRequest>({
        resolver: zodResolver(EmailFormDataRequest),
        defaultValues: { email: '' },
        mode: 'onChange',
    });

    const handleNextStep = (data: IEmailFormDataRequest) => {
        // 1. Lưu email vào store
        setEmail(data.email);
        // 2. Chuyển đến màn hình nhập mật khẩu
        // router.push(ROUTES.AUTH.LOGIN_PASSWORD); // Bạn cần thêm route này
    };

    return (
        <AuthScreenLayout>
            <View className="flex-1">
                <View className="flex-row items-center justify-between px-5 py-4">
                    <TouchableOpacity className="p-2" onPress={() => router.back()}>
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="w-10" />
                </View>

                <View className="flex-1 px-5 pt-16">
                    <Text className="text-3xl font-bold text-white mb-8">{t('auth.welcome-back')}</Text>
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
                            />
                        )}
                    />

                    <View className="mt-auto pb-5">
                        <BounceButton variant="solid" onPress={handleSubmit(handleNextStep)} disabled={!isValid}>
                            <Text className="text-white font-bold text-lg">Continue</Text>
                        </BounceButton>
                    </View>
                </View>
            </View>
        </AuthScreenLayout>
    );
}