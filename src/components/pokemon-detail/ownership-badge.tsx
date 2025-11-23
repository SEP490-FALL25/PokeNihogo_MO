import { CheckCircle2, XCircle } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export const OwnershipBadge = ({ owned }: { owned: boolean | undefined }) => {
    const { t } = useTranslation();
    return (
        <View className={`flex-row items-center px-3 py-1 rounded-xl ${owned ? 'bg-emerald-500/15' : 'bg-rose-500/15'}`}>
            {owned ? <CheckCircle2 size={14} color="#10b981" strokeWidth={2.5} /> : <XCircle size={14} color="#f87171" strokeWidth={2.5} />}
            <Text className={`ml-1 text-[12px] font-semibold ${owned ? 'text-emerald-500' : 'text-rose-400'}`}>
                {owned ? t('ownership.owned') : t('ownership.not_owned')}
            </Text>
        </View>
    );
};
