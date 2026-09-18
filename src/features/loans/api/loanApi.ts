/**
 * Loan API — typed wrappers over apiClient.
 */
import { apiClient } from '@/lib/api';
import type {
  InterestType,
  LendingModel,
  Loan,
  Paginated,
  RepaymentFrequency,
  ReschedulePreview,
  RescheduleInstallment,
  RescheduleMode,
  ScheduleRevision,
} from '@/types';

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

export interface ReschedulePayload {
  reason: string;
  mode: RescheduleMode;
  /** `manual` mode only — the investor's explicit replacement rows. */
  installments?: RescheduleInstallment[];
  /** `same_installment` mode only — the per-visit amount to hold constant. */
  installment_amount?: number;
  /** Optional override for the first new due date. */
  start_date?: string;
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
  /** Dry run — returns old vs. new remaining rows without writing anything. */
  async previewReschedule(id: string, payload: ReschedulePayload): Promise<ReschedulePreview> {
    const { data } = await apiClient.post<ReschedulePreview>(
      `/loans/${id}/reschedule/preview`,
      payload,
    );
    return data;
  },
  async reschedule(id: string, payload: ReschedulePayload): Promise<Loan> {
    const { data } = await apiClient.post<Loan>(`/loans/${id}/reschedule`, payload);
    return data;
  },
  async revisions(id: string): Promise<ScheduleRevision[]> {
    const { data } = await apiClient.get<ScheduleRevision[]>(`/loans/${id}/revisions`);
    return data;
  },
};
