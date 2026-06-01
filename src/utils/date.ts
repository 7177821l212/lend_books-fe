import { format, isToday, isPast, parseISO } from 'date-fns';

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy');
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MM-dd');
}

export function getInstallmentStatus(dueDateStr: string, paid: boolean) {
  if (paid) return 'paid';
  const due = parseISO(dueDateStr);
  if (isToday(due)) return 'due_today';
  if (isPast(due)) return 'overdue';
  return 'pending';
}
