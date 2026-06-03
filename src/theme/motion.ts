/**
 * Motion tokens — durations + easings for animations.
 */
import { Easing } from 'react-native-reanimated';

export const duration = {
  instant: 80,
  fast: 150,
  base: 220,
  slow: 320,
  slower: 480,
} as const;

export const easing = {
  standard: Easing.bezier(0.2, 0.0, 0.0, 1.0),
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1.0),
  accelerate: Easing.bezier(0.4, 0.0, 1.0, 1.0),
  spring: Easing.bezier(0.68, -0.55, 0.27, 1.55),
  emphasize: Easing.bezier(0.3, 0.0, 0.1, 1.0),
} as const;

export const spring = {
  // Gentle bounce — for FAB, badges
  gentle: { damping: 18, stiffness: 180, mass: 1 },
  // Quick snap — for taps, presses
  snap: { damping: 22, stiffness: 320, mass: 1 },
  // Soft bounce — for sheets, cards entering
  soft: { damping: 16, stiffness: 140, mass: 1 },
  // Stiff — for layout changes
  stiff: { damping: 28, stiffness: 500, mass: 1 },
} as const;
