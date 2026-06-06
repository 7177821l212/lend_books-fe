/**
 * Payment API — collect, missed, history, my-day.
 */
import { apiClient } from '@/lib/api';
import type { Paginated, Payment, PaymentMode } from '@/types';

export interface CollectPayload {
  loan_id: string;
  amount: number;
  mode: PaymentMode;
  schedule_id?: string;
  notes?: string;
  proof_photo_url?: string;
}

export interface MissedPayload {
  loan_id: string;
  schedule_id: string;
  reason: string;
  notes?: string;
}

export interface PickupItem {
  loan_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_location: string | null;
  schedule_id: string;
  sequence: number;
  due_date: string;
  due_amount: number;
  is_overdue: boolean;
}

export interface MyDayResponse {
  today: string;
  pickups: PickupItem[];
  target_total: number;
  collected_today: number;
  pickup_count: number;
  overdue_count: number;
}

export const paymentApi = {
  async collect(payload: CollectPayload): Promise<Payment> {
    const { data } = await apiClient.post<Payment>('/payments/collect', payload);
    return data;
  },
  async markMissed(payload: MissedPayload): Promise<Payment> {
    const { data } = await apiClient.post<Payment>('/payments/missed', payload);
    return data;
  },
  async history(params: { collector_id?: string; loan_id?: string; page?: number; page_size?: number } = {}): Promise<Paginated<Payment>> {
    const { data } = await apiClient.get<Paginated<Payment>>('/payments/history', { params });
    return data;
  },
  async myDay(): Promise<MyDayResponse> {
    const { data } = await apiClient.get<MyDayResponse>('/payments/my-day');
    return data;
  },
};
