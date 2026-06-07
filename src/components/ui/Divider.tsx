import { View, type ViewStyle } from 'react-native';

import { useColors, spacing } from '@/theme';

interface DividerProps {
  vertical?: boolean;
  inset?: keyof typeof spacing;
  color?: string;
  style?: ViewStyle;
}

export function Divider({ vertical = false, inset = 0, color, style }: DividerProps) {
  const colors = useColors();
  const resolvedColor = color ?? colors.border.subtle;
  if (vertical) {
    return <View style={[{ width: 1, backgroundColor: resolvedColor, marginVertical: spacing[inset] }, style]} />;
  }
  return <View style={[{ height: 1, backgroundColor: resolvedColor, marginHorizontal: spacing[inset] }, style]} />;
}
