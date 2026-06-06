/**
 * Payment query hooks.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type CollectPayload, type MissedPayload, paymentApi } from '../api/paymentApi';

const KEY = 'payments';

export function useMyDay() {
  return useQuery({
    queryKey: [KEY, 'my-day'],
    queryFn: () => paymentApi.myDay(),
    staleTime: 30_000,
  });
}

export function usePaymentHistory(params: { collector_id?: string; loan_id?: string } = {}) {
  return useQuery({
    queryKey: [KEY, 'history', params],
    queryFn: () => paymentApi.history({ ...params, page: 1, page_size: 100 }),
  });
}

export function useCollect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollectPayload) => paymentApi.collect(payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['loans'] });
      qc.invalidateQueries({ queryKey: ['loans', 'detail', vars.loan_id] });
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useMarkMissed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MissedPayload) => paymentApi.markMissed(payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['loans', 'detail', vars.loan_id] });
    },
  });
}
