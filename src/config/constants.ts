export const BRAND_COLOR = '#7B2FBE';
export const BRAND_COLOR_DARK = '#5B1F9E';

export const STATUS_COLORS = {
  active: '#22C55E',
  overdue: '#F97316',
  blacklisted: '#EF4444',
  closed: '#6B7280',
  paid: '#22C55E',
  pending: '#6B7280',
  due_today: '#3B82F6',
} as const;

export const RISK_COLORS = {
  low: '#22C55E',
  medium: '#F97316',
  high: '#EF4444',
} as const;

export const PAYMENT_MODES = ['CASH', 'UPI', 'BANK'] as const;

export const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;
