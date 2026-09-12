import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { Text } from '@/components/ui';
import { useColors, radii, spacing } from '@/theme';

interface CollectionPoint {
  day: string;
  amount: number;
}

interface CollectionBarChartProps {
  data: CollectionPoint[];
  width: number;
  height?: number;
}

export function CollectionBarChart({ data, width, height = 116 }: CollectionBarChartProps) {
  const colors = useColors();
  const { bars, barWidth, gap } = useMemo(() => {
    const max = Math.max(...data.map((point) => point.amount), 1);
    const safeGap = Math.max(6, Math.min(12, width / Math.max(data.length * 5, 1)));
    const safeBarWidth = Math.max(
      8,
      (width - safeGap * Math.max(data.length - 1, 0)) / Math.max(data.length, 1),
    );

    return {
      bars: data.map((point, index) => ({
        x: index * (safeBarWidth + safeGap),
        height: point.amount > 0 ? Math.max(8, (point.amount / max) * height) : 3,
        amount: point.amount,
      })),
      barWidth: safeBarWidth,
      gap: safeGap,
    };
  }, [data, height, width]);

  return (
    <View>
      <Svg width={width} height={height} accessibilityLabel="Daily collections for the last seven days">
        {bars.map((bar, index) => (
          <Rect
            key={data[index].day}
            x={bar.x}
            y={height - bar.height}
            width={barWidth}
            height={bar.height}
            rx={Math.min(radii.sm, barWidth / 2)}
            fill={bar.amount > 0 ? colors.brand[600] : colors.slate[200]}
          />
        ))}
      </Svg>
      <View style={[styles.labels, { gap }]}> 
        {data.map((point) => (
          <Text key={point.day} variant="caption" color="tertiary" style={{ width: barWidth, textAlign: 'center' }}>
            {new Date(`${point.day}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'narrow' })}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: 'row',
    marginTop: spacing[2],
  },
});
