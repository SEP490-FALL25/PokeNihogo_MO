import AuthScreenLayout from '@components/layouts/AuthScreenLayout';
import BackScreen from '@components/mocules/Back';
import BounceButton from '@components/ui/BounceButton';
import { Input } from '@components/ui/Input';
import { useToast } from '@components/ui/Toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateAccountFormDataRequest, ICreateAccountFormDataRequest } from '@models/user/user.request';
// import { IRegisterFormDataRequest, RegisterFormDataRequest } from '@models/user/user.request';
import { ROUTES } from '@routes/routes';
import authService from '@services/auth';
import { useEmailSelector } from '@stores/user/user.selectors';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';
import { z } from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';

export default function CreateAccountScreen() {
    /**
     * Define variables
     */
    const { t } = useTranslation();
    const email = useEmailSelector();
    const { toast } = useToast();
    z.setErrorMap(makeZodI18nMap({ t }));
    //-----------------------End-----------------------//

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<ICreateAccountFormDataRequest>({
        resolver: zodResolver(CreateAccountFormDataRequest),
        defaultValues: {
            name: '',
            email: email,
            password: '',
            confirmPassword: '',
        },
        mode: 'onChange',
    });

    const handleCompleteRegistration = async (data: ICreateAccountFormDataRequest) => {
        const res = await authService.register(data);
        console.log(">>>>>>>>>>>>>>.", res);

        if (res.data.statusCode === 201) {
            toast({ variant: 'Success', description: res.data.message });
            router.replace(ROUTES.TABS.ROOT);
        } else {
            toast({ variant: 'destructive', description: res.data.message });
        }
    };

    return (
        <AuthScreenLayout>
            <View className="flex-1">
                <BackScreen />

                <View className="flex-1 px-5">
                    <View className="absolute inset-0 justify-center items-center -z-10">
                        <Image
                            source={require('../../../assets/images/PokeNihongoLogo.png')}
                            className='w-80 h-52 object-contain opacity-10'
                        />
                    </View>

                    <View className="flex-1 justify-between pt-16">

                        <View className="gap-5">
                            <Text className="text-3xl font-bold text-white mb-8">{t('auth.whats-your-name')}</Text>
                            {/* Name Input */}
                            <View className="gap-2">
                                <Text className="text-base font-medium text-white">{t('auth.name')}</Text>
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
                            </View>

                            {/* Password Input */}
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
                                            isPassword={true}
                                            error={errors.password?.message as string}
                                        />
                                    )}
                                />
                            </View>

                            {/* Confirm Password Input */}
                            <View className="gap-2">
                                <Text className="text-base font-medium text-white">{t('auth.confirm-password')}</Text>
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
                                            error={errors.confirmPassword?.message as string}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        <View className="pb-5">
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
            </View>
        </AuthScreenLayout>
    );
}