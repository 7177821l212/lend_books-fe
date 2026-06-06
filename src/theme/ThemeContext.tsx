import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { colors as lightColors } from './colors';
import { darkColors } from './darkColors';
import { useAppSettings } from '@/store/appSettings';

type AppColors = typeof lightColors;
const ThemeContext = createContext<AppColors>(lightColors);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useAppSettings();
  const systemScheme = useColorScheme();

  const isDark =
    theme === 'dark' || (theme === 'system' && systemScheme === 'dark');

  const activeColors = useMemo<AppColors>(
    () => (isDark ? (darkColors as unknown as AppColors) : lightColors),
    [isDark]
  );

  return (
    <ThemeContext.Provider value={activeColors}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useColors(): AppColors {
  return useContext(ThemeContext);
}

export function useIsDark(): boolean {
  const { theme } = useAppSettings();
  const systemScheme = useColorScheme();
  return theme === 'dark' || (theme === 'system' && systemScheme === 'dark');
}
