import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

import { Text } from '@/components/ui';
import { useT } from '@/i18n';
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
/** Rough width of one caption glyph at 11px — used to decide if a value fits. */
const GLYPH_WIDTH = 6;
/** Headroom above the tallest bar so its value label is not clipped. */
const LABEL_BAND = 16;

/**
 * Bars are laid out in equal SLOTS — every bar occupies `width / count` and is
 * drawn inside it, so the total is always exactly `width` whatever the range.
 *
 * An earlier version floored the bar at 8px and the gap at 6px, which meant 30
 * days needed 414px inside a 320px chart and ran off the right edge. A minimum
 * size cannot be honoured *and* fit an arbitrary range; fitting wins, because a
 * clipped chart misreports the data.
 */
function layout(width: number, count: number, height: number, amounts: number[]) {
  const slot = count > 0 ? width / count : width;
  // Gap scales with the slot so dense ranges stay legible rather than merging
  // into a solid block, but never eats the whole slot.
  const gap = Math.max(1, Math.min(10, slot * 0.28));
  // Clamped to the slot: at a year's range a day is under a pixel wide, and a
  // 1px floor would push the final bar past the right edge.
  const barWidth = Math.min(slot, Math.max(1, slot - gap));
  const max = Math.max(...amounts, 1);
  // Bars are drawn inside `plot`, leaving a band on top for value labels.
  const plot = Math.max(1, height - LABEL_BAND);

  return {
    slot,
    barWidth,
    bars: amounts.map((amount, index) => ({
      x: index * slot + (slot - barWidth) / 2,
      // Zero days keep a hairline so the day is visibly present but empty.
      height: amount > 0 ? Math.max(2, (amount / max) * plot) : 2,
      amount,
    })),
  };
}

/** The exact figure, which is what a money label should show when it fits. */
function exactAmount(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

/**
 * Shortened form for when the exact figure will not fit on a bar.
 *
 * Truncated, never rounded: `toFixed(1)` turns ₹1,460 into "1.5k", which claims
 * ₹40 more than was collected. A money label must never overstate, so the tenth
 * is floored — ₹1,460 reads "1.4k" — and the exact value is always one tap away.
 */
function compactAmount(value: number): string {
  const short = (unit: number, suffix: string) =>
    `${Math.floor((value / unit) * 10) / 10}${suffix}`;
  if (value >= 10000000) return short(10000000, 'Cr');
  if (value >= 100000) return short(100000, 'L');
  if (value >= 1000) return short(1000, 'k');
  return String(value);
}

function formatDay(day: string, dense: boolean): string {
  const date = new Date(`${day}T00:00:00`);
  // Weekday initials repeat every 7 days, so they say nothing over a long
  // range — show the date instead once the range outgrows a week.
  return dense
    ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : date.toLocaleDateString('en-IN', { weekday: 'narrow' });
}

export function CollectionBarChart({ data, width, height = 132 }: CollectionBarChartProps) {
  const colors = useColors();
  const t = useT();
  const [selected, setSelected] = useState<number | null>(null);

  const { slot, barWidth, bars, labelStep, dense, labelFormat } = useMemo(() => {
    const amounts = data.map((point) => point.amount);
    const computed = layout(width, data.length, height, amounts);
    const positive = amounts.filter((a) => a > 0);
    const widest = (fmt: (n: number) => string) =>
      Math.max(...positive.map((a) => fmt(a).length), 1);
    const room = (fmt: (n: number) => string) =>
      computed.slot >= widest(fmt) * GLYPH_WIDTH + 4;
    // Exact first — abbreviating a figure that would have fitted only loses
    // precision for nothing. Compact is the fallback, and past ~10 days not
    // even that fits, so the amount is read by tapping instead.
    const labelFormat: ((n: number) => string) | null = !positive.length
      ? null
      : room(exactAmount)
        ? exactAmount
        : room(compactAmount)
          ? compactAmount
          : null;
    return {
      ...computed,
      labelStep: Math.max(1, Math.ceil(data.length / MAX_LABELS)),
      dense: data.length > 7,
      labelFormat,
    };
  }, [data, height, width]);

  const plot = Math.max(1, height - LABEL_BAND);
  const point = selected !== null ? data[selected] : undefined;

  return (
    <View>
      {/* Readout: every bar is tappable, which is the only way to read a value
          on a dense range where no label can fit. */}
      <View style={styles.readout}>
        {point ? (
          <Text variant="bodyStrong">
            {formatDay(point.day, true)} · ₹{point.amount.toLocaleString('en-IN')}
          </Text>
        ) : (
          <Text variant="caption" color="tertiary">
            {t('tap_a_bar')}
          </Text>
        )}
      </View>

      <Svg
        width={width}
        height={height}
        accessibilityLabel={
          data.length
            ? `Daily collections from ${data[0].day} to ${data[data.length - 1].day}`
            : 'Daily collections'
        }
      >
        {bars.map((bar, index) => {
          const isSelected = selected === index;
          return (
            <Rect
              key={`bar-${data[index].day}`}
              x={bar.x}
              y={plot - bar.height + LABEL_BAND}
              width={barWidth}
              height={bar.height}
              rx={Math.min(radii.sm, barWidth / 2)}
              fill={
                isSelected
                  ? colors.brand[800]
                  : bar.amount > 0
                    ? colors.brand[600]
                    : colors.slate[200]
              }
            />
          );
        })}

        {labelFormat
          ? bars.map((bar, index) =>
              bar.amount > 0 ? (
                <SvgText
                  key={`value-${data[index].day}`}
                  x={bar.x + barWidth / 2}
                  y={plot - bar.height + LABEL_BAND - 4}
                  fontSize={10}
                  fill={colors.text.secondary}
                  textAnchor="middle"
                >
                  {labelFormat(bar.amount)}
                </SvgText>
              ) : null,
            )
          : null}

        {/* Full-height transparent hit areas: a 7px bar is far too small to
            tap, so the whole slot is the target. */}
        {bars.map((bar, index) => (
          <Rect
            key={`hit-${data[index].day}`}
            x={index * slot}
            y={0}
            width={slot}
            height={height}
            fill="transparent"
            onPress={() => setSelected(selected === index ? null : index)}
          />
        ))}
      </Svg>

      {/* Same slot width and no flex gap, so a label sits under its own bar. */}
      <View style={[styles.labels, { width }]}>
        {data.map((p, index) => (
          <Text
            key={p.day}
            variant="caption"
            color="tertiary"
            numberOfLines={1}
            style={{ width: slot, textAlign: 'center' }}
          >
            {index % labelStep === 0 ? formatDay(p.day, dense) : ''}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  readout: {
    minHeight: 20,
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  labels: {
    flexDirection: 'row',
    marginTop: spacing[2],
  },
});
