import { View, type ViewStyle } from 'react-native';

import { colors, spacing } from '@/theme';

interface DividerProps {
  vertical?: boolean;
  inset?: keyof typeof spacing;
  color?: string;
  style?: ViewStyle;
}

export function Divider({ vertical = false, inset = 0, color = colors.border.subtle, style }: DividerProps) {
  if (vertical) {
    return <View style={[{ width: 1, backgroundColor: color, marginVertical: spacing[inset] }, style]} />;
  }
  return <View style={[{ height: 1, backgroundColor: color, marginHorizontal: spacing[inset] }, style]} />;
}
