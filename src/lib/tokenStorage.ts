import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export const tokenStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web' && canUseLocalStorage()) {
      return window.localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web' && canUseLocalStorage()) {
      window.localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  deleteItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web' && canUseLocalStorage()) {
      window.localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
