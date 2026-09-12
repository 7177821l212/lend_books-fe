import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from './Button';
import { Text } from './Text';
import { useColors, radii, shadows, spacing } from '@/theme';

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  description: string;
  cancelLabel?: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  variant?: 'danger' | 'primary';
  icon?: React.ReactNode;
}

export function ConfirmSheet({
  visible,
  title,
  description,
  cancelLabel = 'Cancel',
  confirmLabel,
  onCancel,
  onConfirm,
  loading = false,
  variant = 'danger',
  icon,
}: ConfirmSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={[
            styles.sheet,
            shadows.lg,
            { backgroundColor: colors.card, paddingBottom: Math.max(spacing[5], insets.bottom + spacing[3]) },
          ]}
          onPress={() => {}}
        >
          <View style={[styles.handle, { backgroundColor: colors.border.default }]} />
          {icon ? (
            <View
              style={[
                styles.icon,
                { backgroundColor: variant === 'danger' ? colors.dangerSoft : colors.brand[50] },
              ]}
            >
              {icon}
            </View>
          ) : null}
          <Text variant="h2" align="center" style={{ marginTop: icon ? spacing[3] : spacing[1] }}>
            {title}
          </Text>
          <Text variant="body" color="secondary" align="center" style={styles.description}>
            {description}
          </Text>
          <View style={styles.actions}>
            <Button label={cancelLabel} variant="secondary" style={{ flex: 1 }} onPress={onCancel} />
            <Button
              label={confirmLabel}
              variant={variant === 'danger' ? 'danger' : 'primary'}
              style={{ flex: 1 }}
              loading={loading}
              onPress={onConfirm}
              hapticFeedback="medium"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.56)',
  },
  sheet: {
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: spacing[4],
  },
  description: {
    marginTop: spacing[2],
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[5],
  },
});
