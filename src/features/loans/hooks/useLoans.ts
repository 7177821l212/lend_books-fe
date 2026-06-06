/**
 * Loan query hooks (TanStack Query).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type CreateLoanPayload, type ListLoansParams, loanApi } from '../api/loanApi';

const KEY = 'loans';

export function useLoans(params: ListLoansParams = {}) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => loanApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useLoan(loanId: string | undefined) {
  return useQuery({
    queryKey: [KEY, 'detail', loanId],
    queryFn: () => loanApi.get(loanId!),
    enabled: !!loanId,
  });
}

export function useCustomerLoans(customerId: string | undefined) {
  return useQuery({
    queryKey: [KEY, 'customer', customerId],
    queryFn: () => loanApi.list({ customer_id: customerId, page_size: 100 }),
    enabled: !!customerId,
  });
}

export function useCreateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLoanPayload) => loanApi.create(payload),
    onSuccess: (loan) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['customers', 'detail', loan.customer_id] });
    },
  });
}

export function useCloseLoan(loanId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => loanApi.close(loanId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useReassignLoan(loanId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (collectorId: string) => loanApi.assign(loanId, collectorId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
