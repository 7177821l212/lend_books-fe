/**
 * EmptyState — empty list/feature placeholder.
 */
import { View, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { Button } from './Button';
import { useColors, spacing, radii } from '@/theme';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, style }: EmptyStateProps) {
  const colors = useColors();
  return (
    <View
      style={[
        {
          alignItems: 'center',
          paddingVertical: spacing[10],
          paddingHorizontal: spacing[6],
        },
        style,
      ]}
    >
      {icon ? (
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radii.full,
            backgroundColor: colors.slate[100],
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing[3],
          }}
        >
          {icon}
        </View>
      ) : null}
      <Text variant="h3" align="center" style={{ marginBottom: spacing[1] }}>
        {title}
      </Text>
      {description ? (
        <Text variant="body" color="secondary" align="center" style={{ marginBottom: spacing[5] }}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="primary" onPress={onAction} style={{ alignSelf: 'center' }} />
      ) : null}
    </View>
  );
}
