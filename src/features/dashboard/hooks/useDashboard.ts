import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '../api/dashboardApi';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.overview(),
    staleTime: 30_000,
  });
}

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => dashboardApi.reports(),
    staleTime: 60_000,
  });
}
