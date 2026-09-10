/**
 * DatePickerField — dependency-free, cross-platform (web + iOS + Android) date picker.
 *
 * Renders a tappable field showing the selected date; opens a month-grid calendar
 * modal to pick a new one. Values are ISO date strings ("YYYY-MM-DD") in LOCAL time,
 * so there are no timezone-shift surprises.
 */
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { useColors, radii, spacing } from '@/theme';

interface DatePickerFieldProps {
  label?: string;
  value: string; // ISO "YYYY-MM-DD"
  onChange: (iso: string) => void;
  minDate?: string; // inclusive ISO bound
  maxDate?: string; // inclusive ISO bound
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Build a local ISO "YYYY-MM-DD" from a Date (no UTC conversion). */
function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse a local ISO "YYYY-MM-DD" into a local Date at midnight. */
function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10));
  return new Date(y, (m || 1) - 1, d || 1);
}

function formatDisplay(iso: string): string {
  const d = fromISO(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

function relativeLabel(iso: string): string | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = fromISO(iso);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  return null;
}

export function DatePickerField({ label, value, onChange, minDate, maxDate }: DatePickerFieldProps) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  // Month currently shown in the calendar grid (first of month).
  const selected = fromISO(value);
  const [viewMonth, setViewMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));

  const min = minDate ? fromISO(minDate) : null;
  const max = maxDate ? fromISO(maxDate) : null;

  const openPicker = () => {
    setViewMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    setOpen(true);
  };

  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(year, month, d));
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [viewMonth]);

  const isDisabled = (d: Date): boolean => {
    if (min && d < min) return true;
    if (max && d > max) return true;
    return false;
  };

  const todayISOv = toISO(new Date());
  const rel = relativeLabel(value);

  const pick = (d: Date) => {
    onChange(toISO(d));
    setOpen(false);
  };

  const goMonth = (delta: number) =>
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  return (
    <>
      {label ? (
        <Text variant="caption" color="secondary" style={{ marginBottom: spacing[1.5] }}>
          {label.toUpperCase()}
        </Text>
      ) : null}
      <Pressable
        onPress={openPicker}
        style={[
          styles.field,
          { backgroundColor: colors.slate[50], borderColor: colors.border.default },
        ]}
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Pick a date'}
      >
        <Calendar size={18} color={colors.brand[600]} />
        <Text variant="body" style={{ marginLeft: spacing[2], flex: 1 }}>
          {formatDisplay(value)}
        </Text>
        {rel ? (
          <Text variant="caption" color="tertiary">
            {rel}
          </Text>
        ) : null}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <Pressable
            accessibilityLabel="Close date picker"
            onPress={() => setOpen(false)}
            style={styles.backdrop}
          />
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            {/* Month navigation */}
            <View style={styles.monthRow}>
              <Pressable onPress={() => goMonth(-1)} hitSlop={12} style={styles.navBtn}>
                <ChevronLeft size={22} color={colors.text.primary} />
              </Pressable>
              <Text variant="title">
                {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </Text>
              <Pressable onPress={() => goMonth(1)} hitSlop={12} style={styles.navBtn}>
                <ChevronRight size={22} color={colors.text.primary} />
              </Pressable>
            </View>

            {/* Weekday header */}
            <View style={styles.weekRow}>
              {WEEKDAYS.map((w, i) => (
                <View key={i} style={styles.cell}>
                  <Text variant="caption" color="tertiary" align="center">
                    {w}
                  </Text>
                </View>
              ))}
            </View>

            {/* Day grid */}
            <View style={styles.grid}>
              {cells.map((d, i) => {
                if (!d) return <View key={i} style={styles.cell} />;
                const iso = toISO(d);
                const isSelected = iso === value;
                const isToday = iso === todayISOv;
                const disabled = isDisabled(d);
                return (
                  <Pressable
                    key={i}
                    style={styles.cell}
                    disabled={disabled}
                    onPress={() => pick(d)}
                  >
                    <View
                      style={[
                        styles.day,
                        isSelected && { backgroundColor: colors.brand[600] },
                        !isSelected && isToday && {
                          borderWidth: 1.5,
                          borderColor: colors.brand[600],
                        },
                      ]}
                    >
                      <Text
                        variant="body"
                        align="center"
                        color={isSelected ? 'onBrand' : disabled ? 'tertiary' : 'primary'}
                        style={disabled ? { opacity: 0.35 } : undefined}
                      >
                        {d.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Quick "Today" */}
            <Pressable
              onPress={() => {
                const now = new Date();
                if (!isDisabled(now)) pick(now);
              }}
              style={[styles.todayBtn, { backgroundColor: colors.brand[50] }]}
            >
              <Text variant="label" style={{ color: colors.brand[700] }} align="center">
                Today
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radii.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: spacing[6],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderRadius: radii['2xl'],
    padding: spacing[4],
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  navBtn: { padding: spacing[1] },
  weekRow: { flexDirection: 'row', marginBottom: spacing[1] },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBtn: {
    marginTop: spacing[3],
    paddingVertical: spacing[2.5],
    borderRadius: radii.lg,
  },
});
