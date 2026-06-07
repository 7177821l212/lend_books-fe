/**
 * Customer query hooks built on TanStack Query.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type CreateCustomerPayload,
  type CustomerStatusFilter,
  type ListCustomersParams,
  type UpdateCustomerPayload,
  type UploadDocumentPayload,
  customerApi,
} from '../api/customerApi';

const KEY = 'customers';

export function useCustomers(params: ListCustomersParams = {}) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => customerApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useCustomer(customerId: string | undefined) {
  return useQuery({
    queryKey: [KEY, 'detail', customerId],
    queryFn: () => customerApi.get(customerId!),
    enabled: !!customerId,
  });
}

export function useCustomerDocuments(customerId: string | undefined) {
  return useQuery({
    queryKey: [KEY, 'documents', customerId],
    queryFn: () => customerApi.listDocuments(customerId!),
    enabled: !!customerId,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => customerApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateCustomer(customerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCustomerPayload) => customerApi.update(customerId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useBlacklistCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      customerApi.blacklist(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUnblacklistCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerApi.unblacklist(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUploadDocument(customerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadDocumentPayload) =>
      customerApi.uploadDocument(customerId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'documents', customerId] }),
  });
}

export type { CustomerStatusFilter };
