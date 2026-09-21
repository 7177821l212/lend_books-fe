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
