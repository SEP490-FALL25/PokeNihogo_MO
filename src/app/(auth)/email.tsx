import AuthScreenLayout from '@components/layouts/AuthScreenLayout';
import BackScreen from '@components/molecules/Back';
import BounceButton from '@components/ui/BounceButton';
import { Input } from '@components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { IBackendResponse } from '@models/backend/common';
import { EmailFormDataRequest, IEmailFormDataRequest } from '@models/user/user.request';
import { ROUTES } from '@routes/routes';
import authService from '@services/auth';
import { useUserSetEmail } from '@stores/user/user.selectors';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, Text, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import z from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';

export default function EmailScreen() {
    /**
     * Define variables
     */
    const { t } = useTranslation();
    const setEmail = useUserSetEmail();
    z.setErrorMap(makeZodI18nMap({ t }));
    //-----------------------End-----------------------//

    /**
     * Handle form validation
     * Handle next step
     */
    const { control, handleSubmit, formState: { errors, isValid } } = useForm<IEmailFormDataRequest>({
        resolver: zodResolver(EmailFormDataRequest),
        defaultValues: { email: '' },
        mode: 'onChange',
    });

    const handleNextStep = async (data: IEmailFormDataRequest) => {
        const res = await authService.checkEmail(data.email) as IBackendResponse<any>

        switch (res.data.statusCode) {
            case 401:
                setEmail(data.email)
                router.push({ pathname: ROUTES.AUTH.OTP, params: { type: res.data.data.type } })
                break;
            case 200:
                setEmail(data.email)
                router.push({ pathname: ROUTES.AUTH.OTP, params: { type: res.data.data.type } })
                break;
            //Đã lưu IP máy dưới
            case 201:
                setEmail(data.email)
                router.push({ pathname: ROUTES.AUTH.PASSWORD, params: { type: res.data.data.type } })
                break;

            default:
                break;
        }
    };
    //-----------------------End-----------------------//

    return (
        <AuthScreenLayout>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1">
                    <BackScreen title={t('auth.log-in')} />

                    <View className="flex-1 px-5">
                        <View className="absolute inset-0 justify-center items-center -z-10">
                            <Image
                                source={require('../../../assets/images/PokeNihongoLogo.png')}
                                className='w-80 h-52 object-contain opacity-20'
                            />
                        </View>

                        <View className="flex-1 justify-between pt-16 pb-5">
                            <View>
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
                            </View>

                            <BounceButton variant="solid" onPress={handleSubmit(handleNextStep)} disabled={!isValid}>
                                <Text className="text-white font-bold text-lg">{t('auth.next')}</Text>
                            </BounceButton>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </AuthScreenLayout>
    );
}