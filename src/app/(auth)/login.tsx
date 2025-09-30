import AuthScreenLayout from '@components/layouts/AuthScreenLayout';
import BounceButton from '@components/ui/BounceButton';
import { Input } from '@components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { ILoginFormDataRequest, loginFormDataRequest } from '@models/user/user.request';
import { ROUTES } from '@routes/routes';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    Image,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { z } from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';

export default function LoginScreen() {
    const { t } = useTranslation();
    z.setErrorMap(makeZodI18nMap({ t }));

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ILoginFormDataRequest>({
        resolver: zodResolver(loginFormDataRequest),
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const handleLogin = (data: ILoginFormDataRequest) => {
        return new Promise((resolve) => {
            console.log(data);
            setTimeout(() => {
                router.replace(ROUTES.TABS.ROOT);
                resolve(true);
            }, 2000);
        });
    };

    return (
        <AuthScreenLayout>
            <View className="flex-1">
                <View className="flex-row items-center justify-between px-5 py-4 border-b border-white/20">
                    <TouchableOpacity
                        className="p-2"
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold text-white">{t('auth.log-in')}</Text>
                    <View className="w-10" />
                </View>

                <View className="flex-1 px-5">
                    <View className="items-center mt-10 mb-6">
                        <Image source={require('../../../assets/images/PokeNihongoLogo.png')} className="w-60 h-36 object-contain mb-4" />
                    </View>

                    <Text className="text-3xl font-bold text-white text-center mb-10">
                        {t('auth.welcome-back')}
                    </Text>

                    <View className="gap-5 mb-6">
                        <View className="gap-2">
                            <Text className="text-base font-medium text-white">{t('auth.email')}</Text>
                            <Controller
                                control={control}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        style={{ fontSize: 16 }}
                                        value={value}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        placeholder={t('auth.enter-your-email')}
                                        placeholderTextColor="#FFFFFF99"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        error={errors.email?.message}
                                    />
                                )}
                            />
                        </View>

                        <View className="gap-2">
                            <Text className="text-base font-medium text-white">{t('auth.password')}</Text>
                            <Controller
                                control={control}
                                name="password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        value={value}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        placeholder={t('auth.enter-your-password')}
                                        placeholderTextColor="#FFFFFF99"
                                        isPassword={true}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        error={errors.password?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <TouchableOpacity className="items-center mb-5">
                        <Text className="text-base font-semibold text-white">{t('auth.forgot-your-password')}</Text>
                    </TouchableOpacity>

                    <BounceButton
                        onPress={handleSubmit(handleLogin)}
                        disabled={isSubmitting}
                        variant="solid"
                        loading={isSubmitting}
                    >
                        <Text className="text-white font-bold text-lg [text-shadow:0px_1px_2px_rgba(0,0,0,0.25)]">
                            {t('auth.log-in')}
                        </Text>
                    </BounceButton>

                </View>

                <View className="p-5 border-t border-white/20 gap-4">
                    <TouchableOpacity
                        className="items-center"
                    >
                        <Text className="text-base text-white/80">
                            {t('auth.dont-have-an-account')} {' '}
                            <Text className="text-white font-bold">{t('auth.sign-up')}</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </AuthScreenLayout >
    );
}