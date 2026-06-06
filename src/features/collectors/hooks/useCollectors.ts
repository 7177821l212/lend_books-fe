import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type CreateCollectorPayload, collectorApi } from '../api/collectorApi';

export function useCollectors() {
  return useQuery({
    queryKey: ['collectors'],
    queryFn: () => collectorApi.list(),
    staleTime: 60_000,
  });
}

export function useCreateCollector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCollectorPayload) => collectorApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collectors'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeactivateCollector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectorApi.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collectors'] }),
  });
}
