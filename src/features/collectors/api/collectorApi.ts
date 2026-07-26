import { apiClient } from '@/lib/api';

export interface CollectorSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  is_active: boolean;
}

export interface CollectorDetail extends CollectorSummary {
  photo_url: string | null;
}

export interface CreateCollectorPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface UpdateCollectorPayload {
  name?: string;
  phone?: string;
  photo_url?: string;
}

export interface LocationReportPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
  recorded_at?: string;
}

export interface CollectorLocation {
  collector_id: string;
  collector_name: string;
  photo_url: string | null;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  recorded_at: string;
}

export const collectorApi = {
  async list(): Promise<CollectorSummary[]> {
    const { data } = await apiClient.get<CollectorSummary[]>('/collectors');
    return data;
  },

  async get(id: string): Promise<CollectorDetail> {
    const { data } = await apiClient.get<CollectorDetail>(`/collectors/${id}`);
    return data;
  },

  async create(payload: CreateCollectorPayload): Promise<CollectorSummary> {
    const { data } = await apiClient.post<CollectorSummary>('/collectors', payload);
    return data;
  },

  async update(id: string, payload: UpdateCollectorPayload): Promise<CollectorDetail> {
    const { data } = await apiClient.patch<CollectorDetail>(`/collectors/${id}`, payload);
    return data;
  },

  async activate(id: string): Promise<CollectorSummary> {
    const { data } = await apiClient.patch<CollectorSummary>(`/collectors/${id}/activate`);
    return data;
  },

  async deactivate(id: string): Promise<CollectorSummary> {
    const { data } = await apiClient.patch<CollectorSummary>(`/collectors/${id}/deactivate`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/collectors/${id}`);
  },

  async reportLocation(payload: LocationReportPayload): Promise<void> {
    await apiClient.post('/collectors/me/location', payload);
  },

  async listLocations(): Promise<CollectorLocation[]> {
    const { data } = await apiClient.get<CollectorLocation[]>('/collectors/locations');
    return data;
  },
};
