import { useQuery } from '@tanstack/react-query';

import { collectorApi } from '../api/collectorApi';

export function useCollectors() {
  return useQuery({
    queryKey: ['collectors'],
    queryFn: () => collectorApi.list(),
    staleTime: 60_000,
  });
}
