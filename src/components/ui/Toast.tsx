/**
 * Toast — provider + hook. Wrap app once, then use `useToast().show(...)`.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from './Text';
import { colors, radii, shadows, spacing, spring, duration as motion } from '@/theme';

type ToastTone = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
  success: (m: string) => void;
  error: (m: string) => void;
  warning: (m: string) => void;
  info: (m: string) => void;
}

const ToastCtx = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const ICON: Record<ToastTone, (size: number, color: string) => React.ReactNode> = {
  success: (s, c) => <CheckCircle2 size={s} color={c} />,
  error: (s, c) => <XCircle size={s} color={c} />,
  warning: (s, c) => <AlertCircle size={s} color={c} />,
  info: (s, c) => <Info size={s} color={c} />,
};
const TONE_BG: Record<ToastTone, string> = {
  success: colors.success,
  error: colors.danger,
  warning: colors.warning,
  info: colors.info,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<ToastItem | null>(null);
  const counter = useRef(0);
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const dismiss = useCallback(() => {
    translateY.value = withTiming(-100, { duration: motion.fast });
    opacity.value = withTiming(0, { duration: motion.fast }, (finished) => {
      if (finished) runOnJS(setCurrent)(null);
    });
  }, [translateY, opacity]);

  const show = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      counter.current += 1;
      setCurrent({ id: counter.current, message, tone });
      translateY.value = withSpring(0, spring.soft);
      opacity.value = withTiming(1, { duration: motion.base });
      setTimeout(dismiss, 2500);
    },
    [translateY, opacity, dismiss]
  );

  useEffect(() => {
    return () => {
      translateY.value = -100;
      opacity.value = 0;
    };
  }, [translateY, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const value: ToastContextValue = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
    warning: (m) => show(m, 'warning'),
    info: (m) => show(m, 'info'),
  };

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {current ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            { top: insets.top + spacing[2], backgroundColor: TONE_BG[current.tone] },
            shadows.lg,
            animStyle,
          ]}
        >
          {ICON[current.tone](20, colors.white)}
          <Text variant="bodyStrong" color="onDark" style={{ marginLeft: spacing[2], flex: 1 }}>
            {current.message}
          </Text>
        </Animated.View>
      ) : null}
    </ToastCtx.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radii.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
