/**
 * App-level constants. Visual tokens live in `@/theme`, NOT here.
 */
export const PAYMENT_MODES = ['CASH', 'UPI', 'BANK'] as const;

export const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const QUERY_KEYS = {
  ME: ['me'] as const,
  CUSTOMERS: ['customers'] as const,
  CUSTOMER: (id: string) => ['customers', id] as const,
  COLLECTORS: ['collectors'] as const,
  LOANS: ['loans'] as const,
  LOAN: (id: string) => ['loans', id] as const,
  MY_DAY: ['my-day'] as const,
  PAYMENT_HISTORY: ['payment-history'] as const,
  DASHBOARD: ['dashboard'] as const,
  REPORTS_OVERDUE: ['reports', 'overdue'] as const,
  REPORTS_SUMMARY: ['reports', 'summary'] as const,
} as const;
