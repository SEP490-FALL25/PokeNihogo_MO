import AuthScreenLayout from '@components/layouts/AuthScreenLayout';
import BackScreen from '@components/mocules/Back';
import BounceButton from '@components/ui/BounceButton';
import { Input } from '@components/ui/Input';
import { useToast } from '@components/ui/Toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { ROUTES } from '@routes/routes';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { z } from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';

export default function ResetPasswordScreen() {
    const { t } = useTranslation();
    const { toast } = useToast();
    z.setErrorMap(makeZodI18nMap({ t }));


    const resetPasswordSchema = z.object({
        token: z.string().min(1, t('auth.token-required')),
        password: z.string().min(1, t('auth.password-required')),
        confirmPassword: z.string().min(1, t('auth.confirm-password-required')),
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            token: '',
            password: '',
            confirmPassword: ''
        },
        mode: 'onChange',
    });

    const handleResetPassword = (data: z.infer<typeof resetPasswordSchema>) => {
        return new Promise((resolve) => {
            console.log("Resetting password with data:", data);
            // Ở đây bạn sẽ gọi API để xác thực token và cập nhật mật khẩu mới
            setTimeout(() => {
                toast({
                    title: "Success!",
                    description: "Your password has been reset. Please log in."
                });
                router.replace(ROUTES.AUTH.PASSWORD); // Quay về trang đăng nhập
                resolve(true);
            }, 2000);
        });
    };

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
                                <View></View>
                                {/* New Password Input */}
                                <View className="gap-2">
                                    <Text className="text-base font-medium text-white">{t('auth.new-password')}</Text>
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
                                                error={errors.password?.message}
                                            />
                                        )}
                                    />
                                </View>

                                {/* Confirm New Password Input */}
                                <View className="gap-2">
                                    <Text className="text-base font-medium text-white">{t('auth.confirm-new-password')}</Text>
                                    <Controller
                                        control={control}
                                        name="confirmPassword"
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <Input
                                                value={value}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                placeholder={t('auth.enter-your-password')}
                                                isPassword={true}
                                                error={errors.confirmPassword?.message}
                                            />
                                        )}
                                    />
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