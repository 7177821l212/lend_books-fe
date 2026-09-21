import { useQuery } from '@tanstack/react-query';

import { dashboardApi, type DateRangeParams } from '../api/dashboardApi';

export function useDashboard(filters: DateRangeParams = {}) {
  return useQuery({
    queryKey: ['dashboard', filters],
    queryFn: () => dashboardApi.overview(filters),
    staleTime: 30_000,
  });
}

interface ReportFilters extends DateRangeParams {
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
