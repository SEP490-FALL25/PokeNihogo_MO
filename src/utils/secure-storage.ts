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

export async function deleteSecureStorage(key: string) {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error: any) {
        console.error('Error when deleting secure storage: ', error.message);
    }
}