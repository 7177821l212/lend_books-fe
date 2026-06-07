import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';
type Language = 'en' | 'ta';

interface AppSettingsState {
  theme: ThemeMode;
  language: Language;
  hapticsEnabled: boolean;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
  setHapticsEnabled: (enabled: boolean) => void;
}

const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return window.localStorage?.getItem(key) ?? null;
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') { window.localStorage?.setItem(key, value); return; }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') { window.localStorage?.removeItem(key); return; }
    await SecureStore.deleteItemAsync(key);
  },
};

export const useAppSettings = create<AppSettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'en',
      hapticsEnabled: true,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
