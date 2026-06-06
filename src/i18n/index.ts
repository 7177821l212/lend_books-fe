import { useAppSettings } from '@/store/appSettings';
import { translations, type TranslationKey } from './translations';

export function useT() {
  const { language } = useAppSettings();
  return (key: TranslationKey): string => translations[language][key] ?? translations.en[key];
}

export type { TranslationKey };
