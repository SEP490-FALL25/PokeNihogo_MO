import UserAvatar from '@components/atoms/UserAvatar';
import BackScreen from '@components/molecules/Back';
import BounceButton from '@components/ui/BounceButton';
import ImageUploader from '@components/ui/ImageUploader';
import { Input } from '@components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@hooks/useAuth';
import useMinimalAlert from '@hooks/useMinimalAlert';
import { useUpdateProfile } from '@hooks/useUpdateProfile';
import { IUserEntity } from '@models/user/user.entity';
import { IUpdateProfileFormDataRequest, UpdateProfileFormDataRequest } from '@models/user/user.request';
import { formatDateToMMYYYY } from '@utils/date';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Calendar, Shield, Star } from 'lucide-react-native';
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
  const { AlertElement, showAlert } = useMinimalAlert();
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuth();
  const userProfile = user?.data as IUserEntity | undefined;
  const joinDate = userProfile?.createdAt ? formatDateToMMYYYY(userProfile.createdAt) : undefined;

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
      showAlert(t('account_details.nothing_to_update'), 'info');
      return;
    }

    try {
      await mutateAsync(payload);
      showAlert(t('account_details.update_success'), 'success');
      router.back();
    } catch (error: any) {
      showAlert(error?.message || t('account_details.update_error'), 'error');
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
        className="rounded-b-2xl"
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
          contentContainerStyle={{ paddingTop: 100 }}
        >
          <View className="px-5 -mt-24 gap-6">
            <LinearGradient
              colors={['#f5fffe', '#ecfeff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-6 rounded-3xl shadow-lg border border-white/40"
            >
              <View className="flex-row items-center">
                <View className="w-20 h-20 rounded-3xl bg-white/80 items-center justify-center shadow-md">
                  <UserAvatar
                    name={userProfile?.name ?? ''}
                    avatar={userProfile?.avatar ?? undefined}
                    size="large"
                  />
                </View>

                <View className="ml-12 flex-1">
                  <Text className="text-2xl font-extrabold text-slate-900" numberOfLines={1}>
                    {userProfile?.name}
                  </Text>
                  <Text className="text-sm font-semibold text-slate-500 mt-1">
                    {userProfile?.email}
                  </Text>

                  <View className="flex-row flex-wrap gap-2 mt-3">
                    {!!userProfile?.level?.levelNumber && (
                      <View className="px-3 py-1 rounded-2xl bg-emerald-100/90">
                        <Text className="text-xs font-bold text-emerald-700">
                          Lv {userProfile.level.levelNumber}
                        </Text>
                      </View>
                    )}
                    {!!userProfile?.rankName && (
                      <View className="px-3 py-1 rounded-2xl bg-slate-100">
                        <Text className="text-xs font-bold text-slate-700">
                          {userProfile.rankName}
                        </Text>
                      </View>
                    )}
                    {!!joinDate && (
                      <View className="px-3 py-1 rounded-2xl bg-white/70">
                        <Text className="text-xs font-semibold text-slate-600">
                          {t('account_details.member_since', { date: joinDate })}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </LinearGradient>

            <View className="bg-white rounded-3xl p-5 shadow-md border border-slate-100">
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-lg font-extrabold text-slate-800">
                    {t('account_details.stats_title')}
                  </Text>
                  <Text className="text-sm font-semibold text-slate-500">
                    {t('account_details.stats_subtitle')}
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-3">
                {[
                  {
                    icon: Star,
                    label: t('account_details.points'),
                    value:
                      typeof userProfile?.exp === 'number'
                        ? userProfile.exp.toLocaleString()
                        : t('account_details.not_available'),
                    colors: ['#fef3c7', '#fde68a'] as [string, string],
                    iconColor: '#f59e0b',
                  },
                  {
                    icon: Shield,
                    label: t('account_details.rank'),
                    value: userProfile?.rankName || t('account_details.not_available'),
                    colors: ['#dbeafe', '#bfdbfe'] as [string, string],
                    iconColor: '#3b82f6',
                  },
                  {
                    icon: Calendar,
                    label: t('account_details.joined'),
                    value: joinDate || t('account_details.not_available'),
                    colors: ['#dcfce7', '#bbf7d0'] as [string, string],
                    iconColor: '#059669',
                  },
                ].map((item) => (
                  <LinearGradient
                    key={item.label}
                    colors={item.colors}
                    className="flex-1 rounded-2xl p-4"
                  >
                    <View className="w-10 h-10 rounded-2xl bg-white/70 items-center justify-center mb-3">
                      <item.icon size={20} color={item.iconColor} strokeWidth={2.3} />
                    </View>
                    <Text className="text-2xl font-extrabold text-slate-900">
                      {item.value}
                    </Text>
                    <Text className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">
                      {item.label}
                    </Text>
                  </LinearGradient>
                ))}
              </View>
            </View>

            <View className="bg-white rounded-3xl p-5 shadow-md border border-slate-100">
              <Text className="text-lg font-extrabold text-slate-800 mb-1">
                {t('account_details.overview_title')}
              </Text>
              <Text className="text-sm font-semibold text-slate-500 mb-4">
                {t('account_details.overview_subtitle')}
              </Text>

              <View className="divide-y divide-slate-100 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50">
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
                    value: joinDate,
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
                    className="flex-row items-center justify-between px-4 py-3"
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

            <View className="bg-white rounded-3xl p-5 shadow-md mb-4 border border-slate-100">
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
                render={({ field: { onChange, value } }) => (
                  <View className="mt-4">
                    <ImageUploader
                      label={t('account_details.avatar')}
                      value={value}
                      onChange={onChange}
                      folderName="avatars"
                      placeholder={t('account_details.avatar_placeholder')}
                      disabled={isPending || isLoading}
                    />
                    {!!errors.avatar?.message && (
                      <Text className="text-xs text-red-500 font-semibold mt-2">
                        {errors.avatar.message as string}
                      </Text>
                    )}
                  </View>
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
          {AlertElement}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

