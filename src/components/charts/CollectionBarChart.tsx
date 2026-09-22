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

/** Roughly how many date labels stay readable before they start colliding. */
const MAX_LABELS = 7;

/**
 * Bars are laid out in equal SLOTS — every bar occupies `width / count` and is
 * drawn inside it. The total is therefore always exactly `width`, whatever the
 * day count.
 *
 * The previous version floored the bar at 8px and the gap at 6px, which means
 * 30 days needed 414px inside a 320px chart and simply ran off the right edge.
 * A minimum size cannot be honoured *and* fit an arbitrary range; fitting wins,
 * because a clipped chart misreports the data.
 */
function layout(width: number, count: number, height: number, amounts: number[]) {
  const slot = count > 0 ? width / count : width;
  // Gap scales with the slot so dense ranges stay legible rather than merging
  // into a solid block, but never eats the whole slot.
  const gap = Math.max(1, Math.min(10, slot * 0.28));
  // Clamped to the slot: at a year's range a day is under a pixel wide, and a
  // 1px floor would push the final bar past the right edge. Sub-pixel is the
  // honest rendering — 365 distinct bars do not fit on a phone.
  const barWidth = Math.min(slot, Math.max(1, slot - gap));
  const max = Math.max(...amounts, 1);

  return {
    slot,
    barWidth,
    bars: amounts.map((amount, index) => ({
      x: index * slot + (slot - barWidth) / 2,
      // Zero days keep a hairline so the day is visibly present but empty.
      height: amount > 0 ? Math.max(2, (amount / max) * height) : 2,
      amount,
    })),
  };
}

function formatLabel(day: string, dense: boolean): string {
  const date = new Date(`${day}T00:00:00`);
  // Weekday initials repeat every 7 days, so they say nothing over a long
  // range — show the date instead once the range outgrows a week.
  return dense
    ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : date.toLocaleDateString('en-IN', { weekday: 'narrow' });
}

export function CollectionBarChart({ data, width, height = 116 }: CollectionBarChartProps) {
  const colors = useColors();

  const { slot, barWidth, bars, labelStep, dense } = useMemo(() => {
    const amounts = data.map((point) => point.amount);
    const computed = layout(width, data.length, height, amounts);
    return {
      ...computed,
      // Show at most MAX_LABELS, evenly spaced, so they never collide.
      labelStep: Math.max(1, Math.ceil(data.length / MAX_LABELS)),
      dense: data.length > 7,
    };
  }, [data, height, width]);

  const first = data[0]?.day;
  const last = data[data.length - 1]?.day;

  return (
    <View>
      <Svg
        width={width}
        height={height}
        accessibilityLabel={
          first && last
            ? `Daily collections from ${first} to ${last}`
            : 'Daily collections'
        }
      >
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
      {/* Same slot width and no flex gap, so a label sits under its own bar.
          The old row used flexbox `gap` against absolutely-placed bars, so the
          two drifted apart as soon as the counts grew. */}
      <View style={[styles.labels, { width }]}>
        {data.map((point, index) => (
          <Text
            key={point.day}
            variant="caption"
            color="tertiary"
            numberOfLines={1}
            style={{ width: slot, textAlign: 'center' }}
          >
            {index % labelStep === 0 ? formatLabel(point.day, dense) : ''}
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
