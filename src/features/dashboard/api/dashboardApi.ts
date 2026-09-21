/**
 * Dashboard + Reports API.
 */
import { apiClient } from '@/lib/api';

export interface DashboardKPIs {
  capital_disbursed: number;
  outstanding: number;
  collected_lifetime: number;
  collected_today: number;
  profit_realised: number;
  active_loans: number;
  closed_loans: number;
  overdue_loans: number;
  overdue_amount: number;
  active_customers: number;
  total_customers: number;
}

export interface TrendPoint {
  day: string;
  amount: number;
}

export interface CollectionSummary {
  start_date: string;
  end_date: string;
  total_collected: number;
  total_payments: number;
  cash_collected: number;
  upi_collected: number;
  bank_collected: number;
  active_collectors: number;
}

export interface CollectorPerformance {
  id: string;
  name: string;
  collected: number;
  missed: number;
  visits: number;
  collection_days: number;
  average_per_day: number;
  last_collection_date: string | null;
}

export interface DashboardResponse {
  kpis: DashboardKPIs;
  trend_30d: TrendPoint[];
  collection_summary: CollectionSummary;
  collector_performance: CollectorPerformance[];
}

export interface BlacklistedCustomerRow {
  customer_id: string;
  name: string;
  phone: string;
  reason: string | null;
}

export interface ReportsResponse {
  blacklisted: BlacklistedCustomerRow[];
  collection_summary: CollectionSummary;
  collection_trend: TrendPoint[];
  collector_performance: CollectorPerformance[];
  total_interest_earned: number;
  avg_loan_size: number;
  avg_interest_rate: number;
}

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export const dashboardApi = {
  async overview(params?: DateRangeParams): Promise<DashboardResponse> {
    const { data } = await apiClient.get<DashboardResponse>('/dashboard', { params });
    return data;
  },
  async reports(params?: {
    collector_id?: string;
    period?: 'week' | 'month' | 'year';
  } & DateRangeParams): Promise<ReportsResponse> {
    const { data } = await apiClient.get<ReportsResponse>('/reports', { params });
    return data;
  },
};
