import { apiClient } from '@/lib/api';

export interface CollectorSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
}

export interface CreateCollectorPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export const collectorApi = {
  async list(): Promise<CollectorSummary[]> {
    const { data } = await apiClient.get<CollectorSummary[]>('/collectors');
    return data;
  },

  async create(payload: CreateCollectorPayload): Promise<CollectorSummary> {
    const { data } = await apiClient.post<CollectorSummary>('/collectors', payload);
    return data;
  },

  async deactivate(id: string): Promise<CollectorSummary> {
    const { data } = await apiClient.patch<CollectorSummary>(`/collectors/${id}/deactivate`);
    return data;
  },
};
