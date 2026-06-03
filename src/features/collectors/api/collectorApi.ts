import { apiClient } from '@/lib/api';

export interface CollectorSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
}

export const collectorApi = {
  async list(): Promise<CollectorSummary[]> {
    const { data } = await apiClient.get<CollectorSummary[]>('/collectors');
    return data;
  },
};
