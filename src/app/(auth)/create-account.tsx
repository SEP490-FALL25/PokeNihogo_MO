import AuthScreenLayout from '@components/layouts/AuthScreenLayout';
import BounceButton from '@components/ui/BounceButton';
import { Input } from '@components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { ROUTES } from '@routes/routes';
import { useEmailSelector } from '@stores/user/user.selectors';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';

export default function CreateAccountScreen() {
    const { t } = useTranslation();
    const email = useEmailSelector(); // Lấy email đã được lưu
    z.setErrorMap(makeZodI18nMap({ t }));

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<any>({
        resolver: zodResolver(z.object({ name: z.string() })),
        defaultValues: { name: '' },
        mode: 'onChange',
    });

    const handleCompleteRegistration = (data: any) => {
        return new Promise((resolve) => {
            console.log("Completing registration for:", { email, name: data.name });
            // Ở đây bạn sẽ gọi API để tạo user với email và tên
            setTimeout(() => {
                router.replace(ROUTES.TABS.ROOT); // Đăng ký xong và vào app
                resolve(true);
            }, 2000);
        });
    };

    return (
        <AuthScreenLayout>
            <View className="flex-1">
                <View className="flex-row items-center justify-between px-5 py-4">
                    <TouchableOpacity className="p-2" onPress={() => router.back()}>
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold text-white">{t('auth.complete-profile')}</Text>
                    <View className="w-10" />
                </View>

                <View className="flex-1 px-5 pt-16">
                    <Text className="text-3xl font-bold text-white mb-8">{t('auth.whats-your-name')}</Text>

                    <Text className="text-base font-medium text-white mb-2">{t('auth.name')}</Text>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                placeholder={t('auth.enter-your-name')}
                                autoCapitalize="words"
                                autoCorrect={false}
                                error={errors.name?.message as string}
                                autoFocus={true}
                            />
                        )}
                    />

                    <View className="mt-auto pb-5">
                        <BounceButton
                            variant="solid"
                            loading={isSubmitting}
                            disabled={!isValid || isSubmitting}
                            onPress={handleSubmit(handleCompleteRegistration)}
                        >
                            <Text className="text-white font-bold text-lg">{t('auth.next')}</Text>
                        </BounceButton>
                    </View>
                </View>
            </View>
        </AuthScreenLayout>
    );
}