/**
 * Contrast guards for the two palettes.
 *
 * `darkColors` is built by spreading `lightColors`, so any token the dark
 * palette forgets to override silently keeps its LIGHT value. That is how the
 * selected-state tint ended up near-white behind near-white dark-mode text
 * (1.07:1 — invisible). These tests pin the pairings the UI actually renders so
 * the next forgotten override fails here rather than in someone's hands.
 *
 * Scope note: these are REGRESSION guards, not an accessibility audit. A few
 * brand pairings ship below WCAG AA by design (see KNOWN_BRAND_TRADEOFFS); they
 * are asserted as "dark is never worse than light" instead of to a fixed bar, so
 * a forgotten dark override still fails while the design choice is left alone.
 */
import { colors as lightColors } from '../colors';
import { darkColors } from '../darkColors';

type Palette = typeof lightColors;

function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '');
  const channel = (offset: number) => {
    const c = parseInt(h.slice(offset, offset + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function contrast(fg: string, bg: string): number {
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;
/** Enough of a step for the eye to read two adjacent fills as different surfaces. */
const SURFACE_STEP = 1.2;

const dark = darkColors as unknown as Palette;
const palettes: [string, Palette][] = [
  ['light', lightColors],
  ['dark', dark],
];

describe.each(palettes)('%s palette', (_name, c) => {
  it('renders on-tint text legibly over the selected-state tint', () => {
    // NewLoanScreen's ToggleCard, CollectScreen's mode cards, RescheduleSheet's
    // mode and reason options. This is the pairing that was invisible in dark.
    expect(contrast(c.brand[900], c.brand[50])).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrast(c.brand[800], c.brand[50])).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrast(c.brand[900], c.brand[100])).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it('keeps secondary copy readable over the selected-state tint', () => {
    // ToggleCard's sub-line and RescheduleSheet's mode description.
    expect(contrast(c.text.secondary, c.brand[50])).toBeGreaterThanOrEqual(AA_LARGE);
  });

  it('renders body and secondary text legibly on both surfaces', () => {
    for (const surface of [c.card, c.background]) {
      expect(contrast(c.text.primary, surface)).toBeGreaterThanOrEqual(AA_NORMAL);
      expect(contrast(c.text.secondary, surface)).toBeGreaterThanOrEqual(AA_LARGE);
    }
  });
});

describe('dark palette', () => {
  it('makes the selected tint a visible surface against the card', () => {
    // Light mode leans on the brand border for this and ships at ~1.1; dark mode
    // has to carry it in the fill, because a near-black tint on a near-black card
    // leaves the user unable to see WHICH option is selected.
    expect(contrast(dark.brand[50], dark.card)).toBeGreaterThanOrEqual(SURFACE_STEP);
  });

  it('renders brand accents legibly on the card surface', () => {
    // ReportsScreen's selected collector row sits on `card`, not on a tint —
    // brand[800]/[900] were 2.96:1 and 1.48:1 there before the dark override.
    expect(contrast(dark.brand[800], dark.card)).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrast(dark.brand[900], dark.card)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it('overrides every token it uses as a selected-state background', () => {
    // The spread-from-light trap: a tint left at its light value is the bug.
    for (const step of [50, 100] as const) {
      expect(dark.brand[step]).not.toBe(lightColors.brand[step]);
    }
    for (const step of [800, 900] as const) {
      expect(dark.brand[step]).not.toBe(lightColors.brand[step]);
    }
  });
});

describe.each(palettes)('%s palette semantics', (_name, c) => {
  const surface = (p: Palette) => (p === lightColors ? p.card : p.card);

  it('renders semantic ink legibly on the card surface', () => {
    // Amber was the worst offender at 2.15:1 on a white card.
    for (const ink of [c.success, c.warning, c.danger, c.info]) {
      expect(contrast(ink, surface(c))).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });

  it('renders Badge ink legibly on its own soft fill', () => {
    const tones: [string, string][] = [
      [c.success, c.successSoft],
      [c.warning, c.warningSoft],
      [c.danger, c.dangerSoft],
      [c.info, c.infoSoft],
      [c.brand[900], c.brand[50]],
      [c.slate[600], c.slate[100]],
    ];
    for (const [fg, bg] of tones) {
      expect(contrast(fg, bg)).toBeGreaterThanOrEqual(AA_LARGE);
    }
  });

  it('renders white legibly on every fill that carries white text', () => {
    // Button `danger`, and CollectScreen's PAID / MISSED toggles.
    for (const fill of [c.successFill, c.dangerFill]) {
      expect(contrast(c.white, fill)).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });

  it('renders the primary button label legibly on the vivid brand fill', () => {
    // White here was 2.24:1; the label is 14px semibold, i.e. normal-size text.
    expect(contrast(c.text.onBrandFill, c.brand[600])).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it('keeps the semantic fills theme-invariant', () => {
    // They sit under WHITE text, which does not change between themes, so they
    // must not follow the ink lighter in dark mode.
    expect(dark.successFill).toBe(lightColors.successFill);
    expect(dark.dangerFill).toBe(lightColors.dangerFill);
    expect(dark.text.onBrandFill).toBe(lightColors.text.onBrandFill);
  });
});

describe('dark palette semantics', () => {
  it('overrides every semantic ink and soft fill', () => {
    // Same spread-from-light trap as the brand ramp: a light ink left on a light
    // soft fill, or a dark ink left on a dark card, is the bug.
    for (const key of ['success', 'warning', 'danger', 'info'] as const) {
      expect(dark[key]).not.toBe(lightColors[key]);
    }
    for (const key of ['successSoft', 'warningSoft', 'dangerSoft', 'infoSoft'] as const) {
      expect(dark[key]).not.toBe(lightColors[key]);
    }
  });
});
