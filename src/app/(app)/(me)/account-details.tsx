import UserAvatar from '@components/atoms/UserAvatar';
import BackScreen from '@components/molecules/Back';
import BounceButton from '@components/ui/BounceButton';
import { Input } from '@components/ui/Input';
import { useToast } from '@components/ui/Toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@hooks/useAuth';
import { useUpdateProfile } from '@hooks/useUpdateProfile';
import { IUserEntity } from '@models/user/user.entity';
import { IUpdateProfileFormDataRequest, UpdateProfileFormDataRequest } from '@models/user/user.request';
import { ROUTES } from '@routes/routes';
import { formatDateToMMYYYY } from '@utils/date';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';

const buildPayload = (values: IUpdateProfileFormDataRequest) => {
  const payload: Record<string, string> = {};

  (['name', 'phoneNumber', 'avatar'] as const).forEach((key) => {
    const value = values[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        payload[key] = trimmed;
      }
    }
  });

  return payload;
};

export default function AccountDetailsScreen() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuth();
  const userProfile = user?.data as IUserEntity | undefined;

  z.setErrorMap(makeZodI18nMap({ t }));

  const initialValues = useMemo(
    () => ({
      name: userProfile?.name ?? '',
      phoneNumber: userProfile?.phoneNumber ?? '',
      avatar: userProfile?.avatar ?? '',
    }),
    [userProfile?.name, userProfile?.phoneNumber, userProfile?.avatar]
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<IUpdateProfileFormDataRequest>({
    resolver: zodResolver(UpdateProfileFormDataRequest),
    defaultValues: initialValues,
    mode: 'onChange',
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const { mutateAsync, isPending } = useUpdateProfile();

  const onSubmit = async (values: IUpdateProfileFormDataRequest) => {
    const payload = buildPayload(values);

    if (Object.keys(payload).length === 0) {
      toast({
        variant: 'default',
        description: t('account_details.nothing_to_update'),
      });
      return;
    }

    try {
      await mutateAsync(payload);
      toast({
        variant: 'Success',
        description: t('account_details.update_success'),
      });
      router.push(ROUTES.ME.PROFILE);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: error?.message || t('account_details.update_error'),
      });
    }
  };

  return (
    <View className="flex-1 bg-slate-100">
      <StatusBar barStyle="light-content" translucent />
      <LinearGradient
        colors={['#4A9FA2', '#5FA8AB', '#6FAFB2', '#7EC5C8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 12 }}
        className="pb-8"
      >
        <BackScreen
          onPress={() => router.back()}
          color="white"
          title={t('account_details.title')}
        />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 32, paddingBottom: 32 }}
        >
          <View className="px-5 -mt-6">
            <LinearGradient
              colors={['#ffffff', '#fefefe']}
              className="p-6 rounded-3xl shadow-lg"
            >
              <View className="flex-row items-center">
                <UserAvatar
                  name={userProfile?.name ?? ''}
                  avatar={userProfile?.avatar ?? undefined}
                  size="large"
                />
                <View className="ml-4 flex-1">
                  <Text className="text-xl font-extrabold text-slate-800">
                    {userProfile?.name}
                  </Text>
                  <Text className="text-sm font-semibold text-slate-500 mt-1">
                    {userProfile?.email}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            <View className="mt-6 bg-white rounded-3xl p-5 shadow-md">
              <Text className="text-lg font-extrabold text-slate-800 mb-1">
                {t('account_details.overview_title')}
              </Text>
              <Text className="text-sm font-semibold text-slate-500 mb-4">
                {t('account_details.overview_subtitle')}
              </Text>

              <View className="divide-y divide-slate-100 rounded-2xl border border-slate-100 overflow-hidden">
                {[
                  {
                    key: 'email',
                    label: t('account_details.email'),
                    value: userProfile?.email,
                  },
                  {
                    key: 'rank',
                    label: t('account_details.rank'),
                    value: userProfile?.rankName,
                  },
                  {
                    key: 'level',
                    label: t('account_details.level'),
                    value: userProfile?.level?.levelNumber
                      ? `Lv ${userProfile.level.levelNumber}`
                      : undefined,
                  },
                  {
                    key: 'joined',
                    label: t('account_details.joined'),
                    value: userProfile?.createdAt
                      ? formatDateToMMYYYY(userProfile.createdAt)
                      : undefined,
                  },
                  {
                    key: 'points',
                    label: t('account_details.points'),
                    value:
                      typeof userProfile?.exp === 'number'
                        ? userProfile.exp.toLocaleString()
                        : undefined,
                  },
                  {
                    key: 'pokemon',
                    label: t('account_details.pokemon_owned'),
                    value:
                      typeof userProfile?.pokemonCount === 'number'
                        ? userProfile.pokemonCount.toString()
                        : undefined,
                  },
                ].map((item) => (
                  <View
                    key={item.key}
                    className="flex-row items-center justify-between px-4 py-3 bg-slate-50"
                  >
                    <Text className="text-sm font-semibold text-slate-500">
                      {item.label}
                    </Text>
                    <Text className="text-base font-bold text-slate-800">
                      {item.value ?? t('account_details.not_available')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mt-6 bg-white rounded-3xl p-5 shadow-md">
              <Text className="text-lg font-extrabold text-slate-800 mb-1">
                {t('account_details.form_title')}
              </Text>
              <Text className="text-sm font-semibold text-slate-500 mb-4">
                {t('account_details.form_subtitle')}
              </Text>

              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    variant="original"
                    label={t('account_details.name')}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder={t('account_details.name_placeholder')}
                    error={errors.name?.message as string}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                )}
              />

              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    variant="original"
                    label={t('account_details.phone')}
                    keyboardType="phone-pad"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder={t('account_details.phone_placeholder')}
                    error={errors.phoneNumber?.message as string}
                  />
                )}
              />

              <Controller
                control={control}
                name="avatar"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    variant="original"
                    label={t('account_details.avatar')}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder={t('account_details.avatar_placeholder')}
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={errors.avatar?.message as string}
                  />
                )}
              />

              <BounceButton
                variant="solid"
                className="mt-4"
                loading={isPending}
                disabled={!isDirty || !isValid || isPending || isLoading}
                onPress={handleSubmit(onSubmit)}
              >
                <Text className="text-white font-bold text-lg">
                  {t('account_details.save')}
                </Text>
              </BounceButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

