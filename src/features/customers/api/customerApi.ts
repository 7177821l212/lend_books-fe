/**
 * Customer API — typed wrappers over apiClient.
 */
import { apiClient } from '@/lib/api';
import type { Customer, Paginated, RiskLevel } from '@/types';

export type CustomerStatusFilter = 'active' | 'overdue' | 'blacklisted';

export interface ListCustomersParams {
  status?: CustomerStatusFilter;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  location?: string;
  risk_level?: RiskLevel;
}

export interface UpdateCustomerPayload {
  name?: string;
  phone?: string;
  location?: string;
  risk_level?: RiskLevel;
}

export interface CustomerDocument {
  id: string;
  customer_id: string;
  doc_type: string;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface UploadDocumentPayload {
  doc_type: string;
  file_url: string;
}

export const customerApi = {
  async list(params: ListCustomersParams = {}): Promise<Paginated<Customer>> {
    const { data } = await apiClient.get<Paginated<Customer>>('/customers', { params });
    return data;
  },

  async get(id: string): Promise<Customer> {
    const { data } = await apiClient.get<Customer>(`/customers/${id}`);
    return data;
  },

  async create(payload: CreateCustomerPayload): Promise<Customer> {
    const { data } = await apiClient.post<Customer>('/customers', payload);
    return data;
  },

  async update(id: string, payload: UpdateCustomerPayload): Promise<Customer> {
    const { data } = await apiClient.patch<Customer>(`/customers/${id}`, payload);
    return data;
  },

  async blacklist(id: string, reason: string): Promise<Customer> {
    const { data } = await apiClient.post<Customer>(`/customers/${id}/blacklist`, { reason });
    return data;
  },

  async listDocuments(customerId: string): Promise<CustomerDocument[]> {
    const { data } = await apiClient.get<CustomerDocument[]>(
      `/customers/${customerId}/documents`
    );
    return data;
  },

  async uploadDocument(
    customerId: string,
    payload: UploadDocumentPayload
  ): Promise<CustomerDocument> {
    const { data } = await apiClient.post<CustomerDocument>(
      `/customers/${customerId}/documents`,
      payload
    );
    return data;
  },
};
