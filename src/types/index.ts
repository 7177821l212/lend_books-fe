export type UserRole = 'investor' | 'collector';
export type LoanStatus = 'active' | 'overdue' | 'closed' | 'cancelled';
export type InstallmentStatus =
  | 'pending'
  | 'due_today'
  | 'overdue'
  | 'paid'
  | 'partial'
  | 'missed';
export type PaymentMode = 'CASH' | 'UPI' | 'BANK';
export type RiskLevel = 'low' | 'medium' | 'high';
export type RepaymentFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'half_yearly'
  | 'yearly'
  | 'custom';
export type LendingModel = 'model_a' | 'model_b';
export type InterestType = 'pct' | 'fixed';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  photo_url: string | null;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  location: string | null;
  risk_level: RiskLevel;
  is_blacklisted: boolean;
  blacklist_reason: string | null;
  active_loan_count: number;
  total_outstanding: number;
  photo_url: string | null;
}

export interface Installment {
  id: string;
  sequence: number;
  due_date: string;
  due_amount: number;
  paid_amount: number;
  status: InstallmentStatus;
  is_active: boolean;
  schedule_version: number;
  replaced_at: string | null;
}

/** How a loan tracks what is owed. `balance` loans keep no schedule at all. */
export type CollectionMode = 'schedule' | 'balance';

export type RescheduleMode = 'same_end_date' | 'same_installment' | 'manual';

export interface RescheduleInstallment {
  due_date: string;
  due_amount: number;
}

export interface SchedulePreviewRow {
  sequence: number;
  due_date: string;
  due_amount: number;
  paid_amount: number;
}

export interface ReschedulePreview {
  remaining_balance: number;
  current: SchedulePreviewRow[];
  proposed: SchedulePreviewRow[];
  current_total: number;
  proposed_total: number;
  current_end_date: string | null;
  proposed_end_date: string | null;
}

export interface ScheduleRevision {
  id: string;
  loan_id: string;
  version: number;
  reason: string;
  effective_from: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

export interface PaymentAllocation {
  installment_id: string;
  sequence: number;
  due_date: string;
  amount: number;
}

export interface Loan {
  id: string;
  customer_id: string;
  customer_name: string;
  collector_id: string;
  collector_name: string;

  principal: number;
  interest_type: InterestType;
  interest_value: number;
  lending_model: LendingModel;

  disbursed: number;
  repayable: number;
  profit: number;

  collection_mode: CollectionMode;
  /** Position among this customer's loans, oldest first ("Loan 1" was given first). */
  loan_number: number;
  /** Visits where the collector called and collected nothing. */
  missed_count: number;
  repayment_frequency: RepaymentFrequency;
  /** null on balance loans — they have no installments. */
  total_installments: number | null;
  /** null on balance loans — there is no per-visit amount. */
  installment_amount: number | null;
  /** Largest single installment amount; null on balance loans. */
  installment_amount_max: number | null;
  start_date: string;

  status: LoanStatus;
  outstanding: number;
  repaid: number;
  repaid_pct: number;
  paid_count: number;
  overdue_count: number;
  closed_at: string | null;

  installments?: Installment[];
}

export interface Payment {
  id: string;
  loan_id: string;
  schedule_id: string | null;
  collector_id: string;
  is_missed: boolean;
  missed_reason: string | null;
  amount: number;
  mode: PaymentMode | null;
  notes: string | null;
  proof_photo_url: string | null;
  collected_at: string;
  allocations: PaymentAllocation[];
}

export interface Collector {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  loan_count: number;
  total_collected: number;
  missed_count: number;
}

export interface PickupItem {
  loan_id: string;
  customer_name: string;
  customer_phone: string;
  location: string | null;
  amount: number;
  status: InstallmentStatus;
  installment_id: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}
