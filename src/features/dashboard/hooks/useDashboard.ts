import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '../api/dashboardApi';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.overview(),
    staleTime: 30_000,
  });
}

interface ReportFilters {
  collector_id?: string;
  period?: 'week' | 'month' | 'year';
}

export function useReports(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => dashboardApi.reports(filters),
    staleTime: 60_000,
  });
}
