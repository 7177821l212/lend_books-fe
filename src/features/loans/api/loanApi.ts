/**
 * Loan API — typed wrappers over apiClient.
 */
import { apiClient } from '@/lib/api';
import type { InterestType, LendingModel, Loan, Paginated, RepaymentFrequency } from '@/types';

export interface ListLoansParams {
  status?: 'active' | 'overdue' | 'closed' | 'cancelled';
  customer_id?: string;
  collector_id?: string;
  page?: number;
  page_size?: number;
}

export interface CreateLoanPayload {
  customer_id: string;
  collector_id: string;
  principal: number;
  interest_type: InterestType;
  interest_value: number;
  lending_model: LendingModel;
  repayment_frequency: RepaymentFrequency;
  frequency_meta?: Record<string, unknown> | null;
  total_installments: number;
  start_date: string; // YYYY-MM-DD
}

export const loanApi = {
  async list(params: ListLoansParams = {}): Promise<Paginated<Loan>> {
    const { data } = await apiClient.get<Paginated<Loan>>('/loans', { params });
    return data;
  },
  async get(id: string): Promise<Loan> {
    const { data } = await apiClient.get<Loan>(`/loans/${id}`);
    return data;
  },
  async create(payload: CreateLoanPayload): Promise<Loan> {
    const { data } = await apiClient.post<Loan>('/loans', payload);
    return data;
  },
  async close(id: string, reason?: string): Promise<Loan> {
    const { data } = await apiClient.post<Loan>(`/loans/${id}/close`, { reason });
    return data;
  },
  async assign(id: string, collectorId: string): Promise<Loan> {
    const { data } = await apiClient.post<Loan>(`/loans/${id}/assign`, {
      collector_id: collectorId,
    });
    return data;
  },
};
