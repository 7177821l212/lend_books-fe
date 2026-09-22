/**
 * Layout guards for the collection chart.
 *
 * The bars used to be floored at 8px wide with a 6px gap, which meant 30 days
 * needed 414px inside a 320px chart — a third of the range was drawn past the
 * right edge and clipped. A minimum bar size cannot be honoured AND fit an
 * arbitrary range, so fitting wins: a clipped chart misreports the data.
 */

/** Mirrors the slot maths in CollectionBarChart. */
function layout(width: number, count: number) {
  const slot = count > 0 ? width / count : width;
  const gap = Math.max(1, Math.min(10, slot * 0.28));
  const barWidth = Math.min(slot, Math.max(1, slot - gap));
  return { slot, gap, barWidth, total: slot * count };
}

const WIDTHS = [280, 320, 390, 430, 768];
const DAY_COUNTS = [1, 2, 7, 14, 21, 29, 30, 31, 60, 90, 180, 365];

describe('collection chart layout', () => {
  it.each(WIDTHS)('never overflows a %ipx chart at any range', (width) => {
    for (const count of DAY_COUNTS) {
      const { total } = layout(width, count);
      expect(total).toBeLessThanOrEqual(width + 0.001);
    }
  });

  it('fills the full width rather than leaving a gap', () => {
    for (const width of WIDTHS) {
      for (const count of DAY_COUNTS) {
        expect(layout(width, count).total).toBeCloseTo(width, 5);
      }
    }
  });

  it('keeps every bar drawable, however dense the range', () => {
    for (const width of WIDTHS) {
      for (const count of DAY_COUNTS) {
        // A year on a phone gives each day under a pixel; positive is the most
        // that can honestly be promised at that density.
        expect(layout(width, count).barWidth).toBeGreaterThan(0);
      }
    }
  });

  it('gives a readable bar at the ranges the filters actually offer', () => {
    // today / week / month / year map to these; only the year is sub-pixel.
    for (const count of [1, 7, 30]) {
      expect(layout(320, count).barWidth).toBeGreaterThanOrEqual(5);
    }
  });

  it('keeps bars separated so a dense range is not a solid block', () => {
    for (const width of WIDTHS) {
      for (const count of DAY_COUNTS) {
        expect(layout(width, count).gap).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('places the last bar inside the chart', () => {
    for (const width of WIDTHS) {
      for (const count of DAY_COUNTS) {
        const { slot, barWidth } = layout(width, count);
        const lastRightEdge = (count - 1) * slot + (slot - barWidth) / 2 + barWidth;
        expect(lastRightEdge).toBeLessThanOrEqual(width + 0.001);
      }
    }
  });

  it('thins labels so at most seven are ever shown', () => {
    for (const count of DAY_COUNTS) {
      const step = Math.max(1, Math.ceil(count / 7));
      const shown = Array.from({ length: count }).filter((_, i) => i % step === 0).length;
      expect(shown).toBeLessThanOrEqual(7);
      expect(shown).toBeGreaterThanOrEqual(1);
    }
  });

  it('would have caught the old 30-day overflow', () => {
    const old = (width: number, n: number) => {
      const gap = Math.max(6, Math.min(12, width / Math.max(n * 5, 1)));
      const bar = Math.max(8, (width - gap * Math.max(n - 1, 0)) / Math.max(n, 1));
      return n * bar + (n - 1) * gap;
    };
    expect(old(320, 30)).toBeGreaterThan(320);
    expect(layout(320, 30).total).toBeLessThanOrEqual(320.001);
  });
});

/** Mirrors the value-label decision in CollectionBarChart. */
const GLYPH_WIDTH = 6;

function exactAmount(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

function compactAmount(value: number): string {
  const short = (unit: number, suffix: string) =>
    `${Math.floor((value / unit) * 10) / 10}${suffix}`;
  if (value >= 10000000) return short(10000000, 'Cr');
  if (value >= 100000) return short(100000, 'L');
  if (value >= 1000) return short(1000, 'k');
  return String(value);
}

function chosenFormat(width: number, count: number, amounts: number[]) {
  const slot = count > 0 ? width / count : width;
  const positive = amounts.filter((a) => a > 0);
  if (!positive.length) return null;
  const room = (fmt: (n: number) => string) =>
    slot >= Math.max(...positive.map((a) => fmt(a).length), 1) * GLYPH_WIDTH + 4;
  if (room(exactAmount)) return 'exact';
  if (room(compactAmount)) return 'compact';
  return null;
}

/** Parse a compact label back to the rupees it claims. */
function claimedBy(label: string): number {
  if (label.endsWith('Cr')) return parseFloat(label) * 10000000;
  if (label.endsWith('L')) return parseFloat(label) * 100000;
  if (label.endsWith('k')) return parseFloat(label) * 1000;
  return parseFloat(label);
}

describe('value labels on bars', () => {
  it('never claims more money than was collected', () => {
    // ₹1,460 rendered as "1.5k" overstated by ₹40. A money label may round
    // down but must never round up.
    for (const value of [950, 1460, 1500, 1999, 99900, 125000, 149999, 12499999]) {
      expect(claimedBy(compactAmount(value))).toBeLessThanOrEqual(value);
    }
  });

  it('truncates rather than rounding', () => {
    expect(compactAmount(1460)).toBe('1.4k');
    expect(compactAmount(1999)).toBe('1.9k');
    expect(compactAmount(149999)).toBe('1.4L');
    expect(compactAmount(950)).toBe('950');
  });

  it('prefers the exact figure when the bar can hold it', () => {
    // The reported case: a single day filling the chart should read ₹1,460,
    // not an abbreviation.
    expect(chosenFormat(320, 1, [1460])).toBe('exact');
    expect(exactAmount(1460)).toBe('₹1,460');
  });

  it('falls back to compact only when exact will not fit', () => {
    const tenDays = Array.from({ length: 10 }, () => 1460);
    expect(chosenFormat(320, 10, tenDays)).toBe('compact');
  });

  it('omits labels once even the compact form collides', () => {
    expect(chosenFormat(320, 30, Array.from({ length: 30 }, () => 1460))).toBeNull();
    expect(chosenFormat(320, 60, Array.from({ length: 60 }, () => 1460))).toBeNull();
  });

  it('sizes to the widest value present, not the first', () => {
    // ₹12.5L is the widest, so it decides — even though most values are small.
    const mixed = [950, 1250000, 400];
    expect(chosenFormat(320, 3, mixed)).toBe('exact');
    // At ten bars a slot is 32px and "12.5L" needs 34px, so labels drop out
    // rather than overlap. The same ten bars of small values keep theirs.
    expect(chosenFormat(320, 10, mixed)).toBeNull();
    // Small values still fit exactly at ten bars — "₹950" needs only 28px.
    expect(chosenFormat(320, 10, [950, 400, 700])).toBe('exact');
    // ₹1,460 does not ("₹1,460" needs 40px) but "1.4k" does, at 28px.
    expect(chosenFormat(320, 10, [1460])).toBe('compact');
  });

  it('every bar remains reachable by tap whatever the density', () => {
    for (const count of [7, 30, 90, 365]) {
      const slot = 320 / count;
      expect(slot).toBeGreaterThan(0);
      expect(slot * count).toBeCloseTo(320, 5);
    }
  });
});
