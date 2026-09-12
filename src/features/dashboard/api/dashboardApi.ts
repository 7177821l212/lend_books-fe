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

export interface CollectorPerformance {
  id: string;
  name: string;
  collected: number;
  missed: number;
  visits: number;
}

export interface DashboardResponse {
  kpis: DashboardKPIs;
  trend_30d: TrendPoint[];
  collector_performance: CollectorPerformance[];
}

export interface OverdueLoanRow {
  loan_id: string;
  customer_id: string;
  customer_name: string;
  collector_id: string;
  collector_name: string;
  overdue_installments: number;
  overdue_amount: number;
}

export interface BlacklistedCustomerRow {
  customer_id: string;
  name: string;
  phone: string;
  reason: string | null;
}

export interface ReportsResponse {
  overdue: OverdueLoanRow[];
  blacklisted: BlacklistedCustomerRow[];
  total_interest_earned: number;
  avg_loan_size: number;
  avg_interest_rate: number;
}

export const dashboardApi = {
  async overview(): Promise<DashboardResponse> {
    const { data } = await apiClient.get<DashboardResponse>('/dashboard');
    return data;
  },
  async reports(params?: { collector_id?: string; period?: 'week' | 'month' | 'year' }): Promise<ReportsResponse> {
    const { data } = await apiClient.get<ReportsResponse>('/reports', { params });
    return data;
  },
};
