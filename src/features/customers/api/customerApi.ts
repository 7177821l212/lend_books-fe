/**
 * Customer API — typed wrappers over apiClient.
 */
import { apiClient } from '@/lib/api';
import { getApiServerRoot } from '@/lib/uploadPhoto';
import { SECURE_STORE_KEYS } from '@/config/constants';
import { tokenStorage } from '@/lib/tokenStorage';
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
  photo_url?: string;
}

export interface UpdateCustomerPayload {
  name?: string;
  phone?: string;
  location?: string;
  risk_level?: RiskLevel;
  photo_url?: string;
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
  /** Local file:// URI from the image/document picker. */
  local_uri: string;
  filename?: string;
  mime_type?: string;
}

function guessMimeType(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    pdf: 'application/pdf',
  };
  return map[ext] ?? 'application/octet-stream';
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

  async unblacklist(id: string): Promise<Customer> {
    const { data } = await apiClient.delete<Customer>(`/customers/${id}/blacklist`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
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
    const filename = payload.filename ?? payload.local_uri.split('/').pop() ?? 'document';
    const type = payload.mime_type ?? guessMimeType(filename);

    const formData = new FormData();
    formData.append('doc_type', payload.doc_type);
    formData.append('file', { uri: payload.local_uri, name: filename, type } as unknown as Blob);

    // Use React Native's native fetch implementation. It supplies the multipart
    // boundary itself; Axios/global JSON headers caused Android uploads to arrive
    // without the required Form fields.
    const token = await tokenStorage.getItem(SECURE_STORE_KEYS.ACCESS_TOKEN);
    const response = await fetch(
      `${getApiServerRoot()}/api/v1/customers/${customerId}/documents`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token ?? ''}`, Accept: 'application/json' },
        body: formData,
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      let detail = '';
      try {
        const parsed = JSON.parse(body) as { detail?: string };
        detail = parsed.detail ?? '';
      } catch {
        // Preserve the generic status message when a proxy returns non-JSON.
      }
      throw new Error(detail || `Document upload failed (${response.status})`);
    }

    return (await response.json()) as CustomerDocument;
  },
};
