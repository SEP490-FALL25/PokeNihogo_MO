import AuthScreenLayout from '@components/layouts/AuthScreenLayout';
import BackScreen from '@components/mocules/Back';
import BounceButton from '@components/ui/BounceButton';
import { Input } from '@components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailFormDataRequest, IEmailFormDataRequest } from '@models/user/user.request';
import { ROUTES } from '@routes/routes';
import { useUserSetEmail } from '@stores/user/user.selectors';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';
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

    const handleNextStep = (data: IEmailFormDataRequest) => {

        enum UserStatus {
            NewUser,
            ExistingUserSafeDevice,
            ExistingUserNewDevice,
        }

        const checkUserStatus = (email: string): { status: UserStatus, deviceToken?: string } => {
            const emailWithAccountAndDevice = 'user.safe@gmail.com';
            const emailWithAccountOnly = 'user.unsafe@gmail.com';

            if (email === emailWithAccountAndDevice) {
                return {
                    status: UserStatus.ExistingUserSafeDevice,
                    deviceToken: 'a-very-long-and-secure-device-token-12345'
                };
            }
            if (email === emailWithAccountOnly) {
                return { status: UserStatus.ExistingUserNewDevice };
            }
            return { status: UserStatus.NewUser };
        };

        const { status, deviceToken } = checkUserStatus(data.email);

        const res = {
            statusCode: 200,
            email: data.email,
            userExists: status !== UserStatus.NewUser,
            deviceToken: deviceToken || null,
        };

        switch (status) {
            case UserStatus.ExistingUserSafeDevice:
                router.push(ROUTES.AUTH.PASSWORD);
                break;

            case UserStatus.ExistingUserNewDevice:
            case UserStatus.NewUser:
            default:
                router.push(ROUTES.AUTH.OTP);
                break;
        }

        console.log('API Response:', res);
    };
    //-----------------------End-----------------------//

    return (
        <AuthScreenLayout>
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
        </AuthScreenLayout>
    );
}