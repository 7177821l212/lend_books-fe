import { create } from 'zustand';

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

export const useAppSettings = create<AppSettingsState>((set) => ({
  theme: 'system',
  language: 'en',
  hapticsEnabled: true,
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
}));
