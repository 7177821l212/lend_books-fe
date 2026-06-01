import { StyleSheet, Text, View } from 'react-native';

import { STATUS_COLORS } from '@/config/constants';

type StatusKey = keyof typeof STATUS_COLORS;

interface BadgeProps {
  label: string;
  status: StatusKey;
}

export function Badge({ label, status }: BadgeProps) {
  const color = STATUS_COLORS[status];
  return (
    <View style={[styles.container, { borderColor: color, backgroundColor: color + '1A' }]}>
      <Text style={[styles.text, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});
