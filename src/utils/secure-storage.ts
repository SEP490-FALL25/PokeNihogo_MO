import * as SecureStore from 'expo-secure-store';

export async function saveSecureStorage(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
}

export async function getValueForSecureStorage(key: string) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        return result;
    } else {
        return null;
    }
}